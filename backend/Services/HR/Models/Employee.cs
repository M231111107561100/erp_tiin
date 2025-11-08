using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HR.Models;

[Table("employees")]
public class Employee
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("employee_number")]
    [Required]
    [StringLength(20)]
    public required string EmployeeNumber { get; set; }

    [Column("first_name")]
    [Required]
    [StringLength(50)]
    public required string FirstName { get; set; }

    [Column("last_name")]
    [Required]
    [StringLength(50)]
    public required string LastName { get; set; }

    [Column("email")]
    [StringLength(100)]
    public string? Email { get; set; }

    [Column("phone")]
    [StringLength(20)]
    public string? Phone { get; set; }

    [Column("hire_date")]
    public DateOnly HireDate { get; set; }

    [Column("birth_date")]
    public DateOnly? BirthDate { get; set; }

    [Column("social_security_number")]
    [StringLength(30)]
    public string? SocialSecurityNumber { get; set; }

    [Column("base_salary")]
    [Precision(18, 2)]
    public decimal BaseSalary { get; set; }

    [Column("position")]
    [StringLength(100)]
    public string? Position { get; set; }

    [Column("department")]
    [StringLength(100)]
    public string? Department { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<PayrollRun> PayrollRuns { get; set; } = new List<PayrollRun>();

    // Computed properties
    [NotMapped]
    public string FullName => $"{FirstName} {LastName}";

    [NotMapped]
    public int YearsOfService
    {
        get
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var years = today.Year - HireDate.Year;
            if (HireDate > today.AddYears(-years)) years--;
            return years;
        }
    }
}

[Table("payroll_runs")]
public class PayrollRun
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("employee_id")]
    [Required]
    public Guid EmployeeId { get; set; }

    [Column("period")]
    [Required]
    [StringLength(7)] // Format: YYYY-MM
    public required string Period { get; set; }

    [Column("base_salary")]
    [Precision(18, 2)]
    public decimal BaseSalary { get; set; }

    [Column("gross_salary")]
    [Precision(18, 2)]
    public decimal GrossSalary { get; set; }

    [Column("ipres_employee")]
    [Precision(18, 2)]
    public decimal IpresEmployee { get; set; }

    [Column("ipres_employer")]
    [Precision(18, 2)]
    public decimal IpresEmployer { get; set; }

    [Column("css")]
    [Precision(18, 2)]
    public decimal Css { get; set; }

    [Column("ir")]
    [Precision(18, 2)]
    public decimal Ir { get; set; }

    [Column("ipm")]
    [Precision(18, 2)]
    public decimal Ipm { get; set; }

    [Column("trimf")]
    [Precision(18, 2)]
    public decimal Trimf { get; set; }

    [Column("net_salary")]
    [Precision(18, 2)]
    public decimal NetSalary { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("EmployeeId")]
    public virtual Employee Employee { get; set; } = null!;
}

public class HRDbContext : DbContext
{
    public HRDbContext(DbContextOptions<HRDbContext> options) : base(options)
    {
    }

    public DbSet<Employee> Employees { get; set; } = null!;
    public DbSet<PayrollRun> PayrollRuns { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Employee configuration
        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.EmployeeNumber).IsRequired().HasMaxLength(20);
            entity.HasIndex(e => e.EmployeeNumber).IsUnique();
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(50);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.SocialSecurityNumber).HasMaxLength(30);
            entity.Property(e => e.BaseSalary).HasPrecision(18, 2);
            entity.Property(e => e.Position).HasMaxLength(100);
            entity.Property(e => e.Department).HasMaxLength(100);
            entity.Property(e => e.CreatedAt).HasColumnType("timestamp with time zone");
            entity.Property(e => e.UpdatedAt).HasColumnType("timestamp with time zone");

            entity.HasIndex(e => e.IsActive);
            entity.HasIndex(e => e.Department);
            entity.HasIndex(e => e.Position);
        });

        // PayrollRun configuration
        modelBuilder.Entity<PayrollRun>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Period).IsRequired().HasMaxLength(7);
            entity.Property(e => e.BaseSalary).HasPrecision(18, 2);
            entity.Property(e => e.GrossSalary).HasPrecision(18, 2);
            entity.Property(e => e.IpresEmployee).HasPrecision(18, 2);
            entity.Property(e => e.IpresEmployer).HasPrecision(18, 2);
            entity.Property(e => e.Css).HasPrecision(18, 2);
            entity.Property(e => e.Ir).HasPrecision(18, 2);
            entity.Property(e => e.Ipm).HasPrecision(18, 2);
            entity.Property(e => e.Trimf).HasPrecision(18, 2);
            entity.Property(e => e.NetSalary).HasPrecision(18, 2);
            entity.Property(e => e.CreatedAt).HasColumnType("timestamp with time zone");

            entity.HasIndex(e => e.EmployeeId);
            entity.HasIndex(e => e.Period);
            entity.HasIndex(e => new { e.Period, e.EmployeeId }).IsUnique();

            entity.HasOne(e => e.Employee)
                  .WithMany(e => e.PayrollRuns)
                  .HasForeignKey(e => e.EmployeeId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.Entity is Employee && (e.State == EntityState.Added || e.State == EntityState.Modified));

        foreach (var entityEntry in entries)
        {
            ((Employee)entityEntry.Entity).UpdatedAt = DateTime.UtcNow;
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}

public class SenegalPayrollCalculator
{
    private const decimal IPRES_RATE_EMPLOYEE = 0.056m; // 5.6%
    private const decimal IPRES_RATE_EMPLOYER = 0.092m; // 9.2%
    private const decimal CSS_RATE = 0.03m; // 3%
    private const decimal IPM_RATE = 0.01m; // 1%
    private const decimal TRIMF = 1000m; // Fixed amount

    // Plafonds 2025 (à ajuster selon les barèmes officiels)
    private const decimal IPRES_PLafOND = 500000m;
    private const decimal CSS_PLafOND = 500000m;

    public PayrollRun CalculatePayroll(Employee employee, string period, decimal bonuses = 0)
    {
        var grossSalary = employee.BaseSalary + bonuses;
        
        // IPRES calculations
        var ipresEmployee = Math.Min(grossSalary * IPRES_RATE_EMPLOYEE, IPRES_PLafOND);
        var ipresEmployer = Math.Min(grossSalary * IPRES_RATE_EMPLOYER, IPRES_PLafOND);
        
        // CSS (plafonnée)
        var css = Math.Min(grossSalary * CSS_RATE, CSS_PLafOND);
        
        // IPM
        var ipm = grossSalary * IPM_RATE;
        
        // IR (barème progressif Sénégal)
        var taxableIncome = grossSalary - ipresEmployee - ipm;
        var ir = CalculateIncomeTax(taxableIncome);
        
        // Net salary calculation
        var netSalary = grossSalary - (ipresEmployee + ipm + ir + TRIMF);

        return new PayrollRun
        {
            Id = Guid.NewGuid(),
            EmployeeId = employee.Id,
            Period = period,
            BaseSalary = employee.BaseSalary,
            GrossSalary = grossSalary,
            IpresEmployee = ipresEmployee,
            IpresEmployer = ipresEmployer,
            Css = css,
            Ir = ir,
            Ipm = ipm,
            Trimf = TRIMF,
            NetSalary = netSalary
        };
    }

    private decimal CalculateIncomeTax(decimal taxableIncome)
    {
        // Barème IR 2025 Sénégal (à mettre à jour selon la législation)
        if (taxableIncome <= 630000) 
            return 0;
        
        if (taxableIncome <= 1500000)
            return (taxableIncome - 630000) * 0.20m;
        
        if (taxableIncome <= 4000000)
            return 174000 + (taxableIncome - 1500000) * 0.30m;
        
        if (taxableIncome <= 8000000)
            return 924000 + (taxableIncome - 4000000) * 0.36m;
        
        return 2364000 + (taxableIncome - 8000000) * 0.40m;
    }

    public decimal CalculateEmployerTotalCost(decimal grossSalary)
    {
        var ipresEmployer = Math.Min(grossSalary * IPRES_RATE_EMPLOYER, IPRES_PLafOND);
        var css = Math.Min(grossSalary * CSS_RATE, CSS_PLafOND);
        
        return grossSalary + ipresEmployer + css;
    }
}