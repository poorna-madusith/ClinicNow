namespace backend.DTOs
{

    public class BookingDto
    {
        public int Id { get; set; }
        public int SessionId { get; set; }
        public string PatientId { get; set; } = null!;
        public string? PatientName { get; set; }
        public DateTime BookedDateandTime { get; set; }
        public int positionInQueue { get; set; }
        public bool Completed { get; set; }
        public bool OnGoing { get; set; }
    }
}