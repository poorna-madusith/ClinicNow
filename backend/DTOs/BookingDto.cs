namespace backend.DTOs
{

    public class BookingDto
    {
        public int Id { get; set; }
        public int SessionId { get; set; }
        public string PatientId { get; set; } = null!;
        public DateTime BookedDateandTime { get; set; }
    }
}