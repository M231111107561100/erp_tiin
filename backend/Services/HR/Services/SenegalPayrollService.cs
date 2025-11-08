using HR.Models;
using Microsoft.Extensions.Logging;

namespace HR.Services;

public class SenegalPayrollService
{
    private readonly ILogger<SenegalPayrollService> _logger;

    public SenegalPayrollService(ILogger<SenegalPayrollService> logger)
    {
        _logger = logger;
    }

    public PayrollResult CalculatePayroll(Employee employee, string? companyId = null)
    {
        // Vérifier si l'employé est valide
        if (employee.Id == Guid.Empty)  // ← CORRIGÉ: Guid.Empty au lieu de 0
        {
            throw new ArgumentException("Employé invalide");
        }

        if (string.IsNullOrEmpty(employee.Matricule))
        {
            throw new ArgumentException("Matricule de l'employé manquant");
        }

        _logger.LogInformation("Calculating payroll for employee {EmployeeId} in company {CompanyId}", 
            employee.Id.ToString(), companyId ?? "default");  // ← CORRIGÉ: .ToString() et valeur par défaut

        var result = new PayrollResult
        {
            EmployeeId = employee.Id,
            EmployeeName = $"{employee.Prenom} {employee.Nom}",
            Matricule = employee.Matricule,
            Period = DateOnly.FromDateTime(DateTime.Now),
            GrossSalary = employee.SalaireBase,
            NetSalary = 0,
            Deductions = new List<Deduction>(),
            Contributions = new List<Contribution>()
        };

        // Calcul des cotisations sociales (Sénégal)
        CalculateSocialContributions(employee, result);
        
        // Calcul des impôts (IR)
        CalculateIncomeTax(employee, result);
        
        // Calcul du net
        result.NetSalary = result.GrossSalary - result.TotalDeductions;

        return result;
    }

    private void CalculateSocialContributions(Employee employee, PayrollResult result)
    {
        // IPRES (Retraite) - 7.2% employé + 9.8% employeur
        var ipresEmployee = employee.SalaireBase * 0.072m;
        var ipresEmployer = employee.SalaireBase * 0.098m;
        
        result.Deductions.Add(new Deduction { Name = "IPRES Employé", Amount = ipresEmployee });
        result.Contributions.Add(new Contribution { Name = "IPRES Employeur", Amount = ipresEmployer });

        // CSS (Santé) - 3% employé + 3% employeur
        var cssEmployee = employee.SalaireBase * 0.03m;
        var cssEmployer = employee.SalaireBase * 0.03m;
        
        result.Deductions.Add(new Deduction { Name = "CSS Employé", Amount = cssEmployee });
        result.Contributions.Add(new Contribution { Name = "CSS Employeur", Amount = cssEmployer });

        // FNR (Logement) - 1% employeur
        var fnrEmployer = employee.SalaireBase * 0.01m;
        result.Contributions.Add(new Contribution { Name = "FNR", Amount = fnrEmployer });
    }

    private void CalculateIncomeTax(Employee employee, PayrollResult result)
    {
        var taxableIncome = result.GrossSalary - result.Deductions.Where(d => d.Name.Contains("IPRES") || d.Name.Contains("CSS")).Sum(d => d.Amount);
        
        // Barème IR Sénégal (simplifié)
        decimal ir = 0;
        
        if (taxableIncome > 500000)
        {
            ir = taxableIncome * 0.40m - 125000;
        }
        else if (taxableIncome > 300000)
        {
            ir = taxableIncome * 0.30m - 45000;
        }
        else if (taxableIncome > 150000)
        {
            ir = taxableIncome * 0.20m - 15000;
        }
        else if (taxableIncome > 75000)
        {
            ir = taxableIncome * 0.15m - 5625;
        }
        else if (taxableIncome > 50000)
        {
            ir = taxableIncome * 0.10m - 2500;
        }
        else if (taxableIncome > 35000)
        {
            ir = taxableIncome * 0.06m - 1050;
        }
        else if (taxableIncome > 20000)
        {
            ir = taxableIncome * 0.03m - 300;
        }

        if (ir > 0)
        {
            result.Deductions.Add(new Deduction { Name = "IR", Amount = ir });
        }
    }
}

public class PayrollResult
{
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string Matricule { get; set; } = string.Empty;
    public DateOnly Period { get; set; }
    public decimal GrossSalary { get; set; }
    public decimal NetSalary { get; set; }
    public List<Deduction> Deductions { get; set; } = new();
    public List<Contribution> Contributions { get; set; } = new();
    
    public decimal TotalDeductions => Deductions.Sum(d => d.Amount);
    public decimal TotalContributions => Contributions.Sum(c => c.Amount);
}

public class Deduction
{
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class Contribution
{
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}