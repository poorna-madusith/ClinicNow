using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class FeedbackDto
    {
        public int Id { get; set; }

        public string? DoctorId { get; set; }

        public string? DoctorName { get; set; }
        public DoctorDto? Doctor { get; set; }

        public string? PatientId { get; set; }

        public string? PatientName { get; set; }
        public PatientDto? Patient { get; set; }

        [Range(1, 5, ErrorMessage = "Communication rating must be between 1 and 5")]
        public int CommunicationRating { get; set; }

        [Range(1, 5, ErrorMessage = "Professionalism rating must be between 1 and 5")]
        public int ProfessionalismRating { get; set; }

        [Range(1, 5, ErrorMessage = "Punctuality rating must be between 1 and 5")]
        public int PunctualityRating { get; set; }

        [Range(1, 5, ErrorMessage = "Treatment rating must be between 1 and 5")]
        public int TreatmentRating { get; set; }

        [Range(1, 5, ErrorMessage = "Overall rating must be between 1 and 5")]
        public int OverallRating { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}