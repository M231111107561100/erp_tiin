using System;

namespace Finance.Models
{
    public class JournalLine : BaseEntity
    {
        public Guid JournalEntryId { get; set; }
        public string AccountNumber { get; set; } = string.Empty;
        public decimal Debit { get; set; }
        public decimal Credit { get; set; }
        public string? Description { get; set; }
    }
}
