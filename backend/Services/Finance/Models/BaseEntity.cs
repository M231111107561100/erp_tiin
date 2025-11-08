using System;

namespace Finance.Models
{
    public abstract class BaseEntity
    {
        public Guid Id { get; protected set; } = Guid.NewGuid();
        public DateTime CreatedAt { get; protected set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; protected set; }

        public void Touch() => UpdatedAt = DateTime.UtcNow;
    }
}
