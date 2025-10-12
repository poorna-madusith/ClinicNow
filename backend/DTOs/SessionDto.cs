using System;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class SessionDto
    {

        [Required(ErrorMessage = "Doctor ID is required")]
        public string DoctorId { get; set; } = null!;  // Only send ID from frontend, not full user object

        [Required(ErrorMessage = "Capacity is required")]
        [Range(1, 500, ErrorMessage = "Capacity must be between 1 and 500")]
        public int Capacity { get; set; }

        [Required(ErrorMessage = "Start Time is required")]
        public TimeSpan StartTime { get; set; }

        [Required(ErrorMessage = "End Time is required")]
        public TimeSpan EndTime { get; set; }

        [Required(ErrorMessage = "Date is required")]
        public DateTime Date { get; set; }

        [Required(ErrorMessage = "Session Fee is required")]
        [Range(0, double.MaxValue, ErrorMessage = "Session Fee must be positive")]
        public double SessionFee { get; set; }

        [Required(ErrorMessage = "Description is required")]
        public string Description { get; set; } = string.Empty;

    }
}
