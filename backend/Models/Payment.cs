using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Payment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string PaymentIntentId { get; set; } = null!;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Required]
        [StringLength(3)]
        public string Currency { get; set; } = "usd";

        [Required]
        public string Status { get; set; } = "pending"; // pending, succeeded, failed, canceled

        public int? BookingId { get; set; }
        public Booking? Booking { get; set; }

        [Required]
        public string PatientId { get; set; } = null!;
        public ApplicationUser? Patient { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}