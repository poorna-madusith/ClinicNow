using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Session
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string DoctorId { get; set; } = null!;
        public ApplicationUser Doctor { get; set; } = null!;

        [Required]
        public DateTime Date { get; set; }

        [Required]
        public TimeSpan StartTime { get; set; }

        [Required]
        public TimeSpan EndTime { get; set; }

        [Required]
        public double SessionFee { get; set; }

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public int Capacity { get; set; }

        public bool Canceled { get; set; } = false;

        [Column("ongoing")]
        public bool Ongoing { get; set; } = false;

        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
