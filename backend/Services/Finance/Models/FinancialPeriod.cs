namespace Finance.Models
{
    public class FinancialPeriod : BaseEntity
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public bool Closed { get; set; }
    }
}
