using System;
using System.Collections.Generic;

namespace Finance.Models
{
    public class JournalEntry : BaseEntity
    {
        public DateTime Date { get; set; }
        public string Reference { get; set; } = string.Empty;
        public ICollection<JournalLine> Lines { get; set; } = new List<JournalLine>();
    }
}
