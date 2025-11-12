using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Message
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ConversationId { get; set; } // Links to Booking or Session

        [Required]
        public string SenderId { get; set; } // User ID of sender

        [Required]
        public string ReceiverId { get; set; } // User ID of receiver

        [Required]
        public string Content { get; set; }

        [Required]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public bool IsRead { get; set; } = false;
        
    }
}