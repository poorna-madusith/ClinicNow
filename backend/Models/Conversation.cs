using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Conversation
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string PatientId { get; set; } = null!;
        public ApplicationUser Patient { get; set; } = null!;

        [Required]
        public string DoctorId { get; set; } = null!;
        public ApplicationUser Doctor { get; set; } = null!;

        public ICollection<Message> Messages { get; set; } = new List<Message>();
    }
}
