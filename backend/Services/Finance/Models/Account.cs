namespace Finance.Models
{
    public class Account : BaseEntity
    {
        public string Number { get; set; } = string.Empty; // Code SYSCOHADA
        public string Name { get; set; } = string.Empty;
        public string? Currency { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
