namespace backend.DTOs;

public class DoctorBookingRatingItem
{
    public string DoctorId { get; set; } = null!;
    public string DoctorName { get; set; } = null!;
    public string Specialization { get; set; } = null!;
    public int TotalBookings { get; set; }
    public double AverageRating { get; set; }
}

public class DoctorBookingRatingStatsDto
{
    public List<DoctorBookingRatingItem> DoctorStats { get; set; } = new();
    public int TotalBookings { get; set; }
}
