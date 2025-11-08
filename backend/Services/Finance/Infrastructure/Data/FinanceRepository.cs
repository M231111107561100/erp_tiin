using Finance.Models;
using Microsoft.EntityFrameworkCore;
using SharedKernel;

namespace Finance.Infrastructure.Data;

public interface IFinanceRepository
{
    Task<Account?> GetAccountByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<IEnumerable<Account>> GetAccountsAsync(bool includeInactive = false, CancellationToken cancellationToken = default);
    Task<JournalEntry?> GetJournalEntryByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<JournalEntry>> GetJournalEntriesAsync(DateOnly? fromDate = null, DateOnly? toDate = null, CancellationToken cancellationToken = default);
    Task<Guid> AddJournalEntryAsync(JournalEntry entry, CancellationToken cancellationToken = default);
    Task<bool> AccountExistsAsync(string code, CancellationToken cancellationToken = default);
    Task<FinancialPeriod?> GetCurrentPeriodAsync(CancellationToken cancellationToken = default);
}

public class FinanceRepository : IFinanceRepository
{
    private readonly FinanceDbContext _context;

    public FinanceRepository(FinanceDbContext context)
    {
        _context = context;
    }

    public async Task<Account?> GetAccountByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _context.Accounts
            .FirstOrDefaultAsync(a => a.Code == code && a.IsActive, cancellationToken);
    }

    public async Task<IEnumerable<Account>> GetAccountsAsync(bool includeInactive = false, CancellationToken cancellationToken = default)
    {
        var query = _context.Accounts.AsQueryable();
        
        if (!includeInactive)
        {
            query = query.Where(a => a.IsActive);
        }

        return await query
            .OrderBy(a => a.Code)
            .ToListAsync(cancellationToken);
    }

    public async Task<JournalEntry?> GetJournalEntryByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.JournalEntries
            .Include(e => e.Lines)
            .ThenInclude(l => l.Account)
            .Include(e => e.Period)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<JournalEntry>> GetJournalEntriesAsync(
        DateOnly? fromDate = null, 
        DateOnly? toDate = null, 
        CancellationToken cancellationToken = default)
    {
        var query = _context.JournalEntries
            .Include(e => e.Lines)
            .ThenInclude(l => l.Account)
            .Include(e => e.Period)
            .AsQueryable();

        if (fromDate.HasValue)
        {
            query = query.Where(e => e.EntryDate >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(e => e.EntryDate <= toDate.Value);
        }

        return await query
            .OrderByDescending(e => e.EntryDate)
            .ThenByDescending(e => e.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Guid> AddJournalEntryAsync(JournalEntry entry, CancellationToken cancellationToken = default)
    {
        _context.JournalEntries.Add(entry);
        await _context.SaveChangesAsync(cancellationToken);
        return entry.Id;
    }

    public async Task<bool> AccountExistsAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _context.Accounts
            .AnyAsync(a => a.Code == code && a.IsActive, cancellationToken);
    }

    public async Task<FinancialPeriod?> GetCurrentPeriodAsync(CancellationToken cancellationToken = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        return await _context.FinancialPeriods
            .FirstOrDefaultAsync(p => p.StartDate <= today && p.EndDate >= today && p.Status == "Open", 
                cancellationToken);
    }
}