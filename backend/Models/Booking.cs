using System.ComponentModel.DataAnnotations;

namespace backend.Models
{

    public class Booking
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int SessionId { get; set; }

        public Session Session { get; set; } = null!;

        [Required]
        public string PatientId { get; set; } = null!;

        public ApplicationUser Patient { get; set; } = null!;

        [Required]
        public DateTime BookedDateandTime { get; set; }

        public int positionInQueue { get; set; }

        public bool OnGoing { get; set; } = false;

        public bool Completed { get; set; } = false;

    }
};