using Finance.Data;
using Finance.Infrastructure.Data;
using Finance.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Finance.Services;

public record PostJournalCommand(
    DateOnly Date,
    string Reference,
    string Memo,
    List<JournalLineDto> Lines,
    string JournalType = "General") : IRequest<Guid>;

public record JournalLineDto(
    string AccountCode,
    decimal Debit,
    decimal Credit,
    string? Auxiliary = null,
    string? CostCenter = null,
    string? Description = null);

public class PostJournalCommandHandler : IRequestHandler<PostJournalCommand, Guid>
{
    private readonly IFinanceRepository _repository;
    private readonly FinanceDbContext _dbContext;
    private readonly ILogger<PostJournalCommandHandler> _logger;

    public PostJournalCommandHandler(
        IFinanceRepository repository,
        FinanceDbContext dbContext,
        ILogger<PostJournalCommandHandler> logger)
    {
        _repository = repository;
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<Guid> Handle(PostJournalCommand request, CancellationToken cancellationToken)
    {
        using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            // Validation: Check journal balance
            var totalDebit = request.Lines.Sum(l => l.Debit);
            var totalCredit = request.Lines.Sum(l => l.Credit);
            
            if (totalDebit != totalCredit)
            {
                throw new InvalidOperationException(
                    $"Journal non équilibré. Débit: {totalDebit:F2}, Crédit: {totalCredit:F2}");
            }

            // Validation: Check if all accounts exist and are active
            var accountCodes = request.Lines.Select(l => l.AccountCode).Distinct().ToList();
            foreach (var accountCode in accountCodes)
            {
                if (!await _repository.AccountExistsAsync(accountCode, cancellationToken))
                {
                    throw new InvalidOperationException($"Le compte {accountCode} n'existe pas ou n'est pas actif.");
                }
            }

            // Find appropriate financial period
            var period = await _repository.GetCurrentPeriodAsync(cancellationToken);
            if (period == null)
            {
                throw new InvalidOperationException("Aucune période financière ouverte trouvée.");
            }

            if (!period.IsDateInPeriod(request.Date))
            {
                throw new InvalidOperationException(
                    $"La date {request.Date} n'est pas dans la période ouverte ({period.StartDate} - {period.EndDate}).");
            }

            // Generate unique entry number
            var entryNumber = await GenerateEntryNumberAsync(request.JournalType, request.Date, cancellationToken);

            var entry = new JournalEntry
            {
                Id = Guid.NewGuid(),
                EntryNumber = entryNumber,
                EntryDate = request.Date,
                Reference = request.Reference,
                Memo = request.Memo,
                JournalType = request.JournalType,
                PeriodId = period.Id,
                UserId = Guid.NewGuid(), // In real app, get from current user context
                TotalDebit = totalDebit,
                TotalCredit = totalCredit,
                IsPosted = true,
                PostedAt = DateTime.UtcNow
            };

            // Add journal lines
            for (int i = 0; i < request.Lines.Count; i++)
            {
                var lineDto = request.Lines[i];
                var line = new JournalLine
                {
                    Id = Guid.NewGuid(),
                    EntryId = entry.Id,
                    AccountCode = lineDto.AccountCode,
                    Debit = lineDto.Debit,
                    Credit = lineDto.Credit,
                    Auxiliary = lineDto.Auxiliary,
                    CostCenter = lineDto.CostCenter,
                    Description = lineDto.Description,
                    LineNumber = i + 1
                };
                entry.Lines.Add(line);
            }

            // Validate entry totals
            entry.CalculateTotals();
            if (!entry.IsBalanced())
            {
                throw new InvalidOperationException("L'écriture n'est pas équilibrée après calcul des totaux.");
            }

            var entryId = await _repository.AddJournalEntryAsync(entry, cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            _logger.LogInformation("Journal entry {EntryNumber} posted successfully with ID {EntryId}", 
                entryNumber, entryId);

            return entryId;
        }
        catch (Exception)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    private async Task<string> GenerateEntryNumberAsync(string journalType, DateOnly date, CancellationToken cancellationToken)
    {
        var prefix = journalType switch
        {
            "Sales" => "SJ",
            "Purchase" => "PJ",
            "Cash" => "CJ",
            "Bank" => "BJ",
            _ => "GJ"
        };

        var todayEntriesCount = await _dbContext.JournalEntries
            .CountAsync(e => e.EntryDate == date && e.JournalType == journalType, cancellationToken);

        var sequence = todayEntriesCount + 1;
        return $"{prefix}-{date:yyyyMMdd}-{sequence:D4}";
    }
}

public class JournalService
{
    private readonly IFinanceRepository _repository;

    public JournalService(IFinanceRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<JournalEntry>> GetJournalEntriesForPeriodAsync(
        DateOnly startDate, 
        DateOnly endDate,
        CancellationToken cancellationToken = default)
    {
        return await _repository.GetJournalEntriesAsync(startDate, endDate, cancellationToken);
    }

    public async Task<decimal> GetAccountBalanceAsync(string accountCode, DateOnly? asOfDate = null, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.JournalLines
            .Where(l => l.AccountCode == accountCode);

        if (asOfDate.HasValue)
        {
            query = query.Where(l => l.Entry.EntryDate <= asOfDate.Value);
        }

        var balance = await query
            .Select(l => l.Debit - l.Credit)
            .SumAsync(cancellationToken);

        return balance;
    }
}