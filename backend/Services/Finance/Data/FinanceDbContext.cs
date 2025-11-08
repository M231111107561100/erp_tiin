using Finance.Models;
using Microsoft.EntityFrameworkCore;

namespace Finance.Data;

public class FinanceDbContext : DbContext
{
    public FinanceDbContext(DbContextOptions<FinanceDbContext> options) : base(options)
    {
    }

    public DbSet<Account> Accounts { get; set; }
    public DbSet<JournalEntry> JournalEntries { get; set; }
    public DbSet<JournalLine> JournalLines { get; set; }
    public DbSet<FinancialPeriod> FinancialPeriods { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configuration des comptes
        modelBuilder.Entity<Account>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Type).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.Code).IsUnique();
        });

        // Configuration des écritures journalières
        modelBuilder.Entity<JournalEntry>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.EntryNumber).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Reference).HasMaxLength(100);
            entity.Property(e => e.Memo).HasMaxLength(500);
            entity.Property(e => e.JournalType).IsRequired().HasMaxLength(20);
            
            entity.HasMany(e => e.Lines)
                .WithOne(l => l.Entry)
                .HasForeignKey(l => l.EntryId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasOne(e => e.Period)
                .WithMany()
                .HasForeignKey(e => e.PeriodId);
        });

        // Configuration des lignes d'écriture
        modelBuilder.Entity<JournalLine>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.AccountCode).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Auxiliary).HasMaxLength(50);
            entity.Property(e => e.CostCenter).HasMaxLength(50);
            entity.Property(e => e.Description).HasMaxLength(200);
            
            entity.HasOne(l => l.Account)
                .WithMany()
                .HasForeignKey(l => l.AccountCode)
                .HasPrincipalKey(a => a.Code);
        });

        // Configuration des périodes financières
        modelBuilder.Entity<FinancialPeriod>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
        });
    }
}