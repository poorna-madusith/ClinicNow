namespace backend.DTOs
{

    public class BookingDto
    {
        public int Id { get; set; }
        public int SessionId { get; set; }
        public string PatientId { get; set; } = null!;
        public string? PatientName { get; set; }
        public PatientDto? Patient { get; set; }
        public DateTime BookedDateandTime { get; set; }
        public int positionInQueue { get; set; }
        public bool Completed { get; set; }
        public bool OnGoing { get; set; }
    }

    public class PatientDto
    {
        public string? Id { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string[]? ContactNumbers { get; set; }
    }
}