namespace backend.DTOs;

public class DoctorRatingItem
{
    public string DoctorId { get; set; } = null!;
    public string DoctorName { get; set; } = null!;
    public string Specialization { get; set; } = null!;
    public double AverageRating { get; set; }
    public int TotalFeedbacks { get; set; }
}

public class DoctorFeedbackStatsDto
{
    public List<DoctorRatingItem> TopRatedDoctors { get; set; } = new();
    public int TotalFeedbacks { get; set; }
}
