using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Feedback
    {
        [Key]
        public int id { get; set; }

        [Required]
        public string doctorId { get; set; } = null!;
        public ApplicationUser Doctor { get; set; } = null!;

        [Required]
        public string patientId { get; set; } = null!;
        public ApplicationUser Patient { get; set; } = null!;


        public int CommunicationRating { get; set; }

        public int ProfessionalismRating { get; set; }

        public int PunctualityRating { get; set; }

        public int TreatmentRating { get; set; }

        public int OverallRating { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;


    }
}