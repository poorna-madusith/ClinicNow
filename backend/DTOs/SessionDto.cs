using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class SessionDto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Doctor ID is required")]
        public string DoctorId { get; set; } = null!;

        public string? DoctorName { get; set; }

        public DoctorDto? Doctor { get; set; }

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

        public bool Canceled { get; set; }

        public bool Completed { get; set; } = false;


        public bool Ongoing { get; set; }

        public List<BookingDto>? Bookings { get; set; }
    }

    public class DoctorDto
    {
        public string? Id { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string[]? ContactNumbers { get; set; }
    }
}
