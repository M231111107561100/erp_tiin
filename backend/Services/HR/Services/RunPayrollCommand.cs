namespace HR.Services;

/// <summary>
/// Contrat aligné sur les usages de SenegalPayrollService d'après les erreurs de build :
/// - EmployeeId : int
/// - Period : string (ex: "2025-11")
/// - Bonuses : decimal (total des bonus)
/// - Ctor à 2 paramètres : (int employeeId, string period)
/// </summary>
public sealed class RunPayrollCommand
{
    public int EmployeeId { get; init; }

    /// <summary>
    /// Période de paie au format texte (ex: "2025-11").
    /// </summary>
    public string Period { get; init; } = "";

    /// <summary>
    /// Montant total des bonus pour la période.
    /// </summary>
    public decimal Bonuses { get; init; }

    /// <summary>
    /// Constructeur minimal attendu (2 paramètres).
    /// </summary>
    public RunPayrollCommand(int employeeId, string period)
    {
        EmployeeId = employeeId;
        Period = period;
    }

    /// <summary>
    /// Constructeur sans paramètre pour la désérialisation si nécessaire.
    /// </summary>
    public RunPayrollCommand() { }
}
