namespace backend.DTOs;

public class DayBookingStatItem
{
    public string DayOfWeek { get; set; } = string.Empty;
    public int BookingCount { get; set; }
    public double AverageRating { get; set; }
}

public class WeeklyBookingStatsDto
{
    public List<DayBookingStatItem> DailyStats { get; set; } = new List<DayBookingStatItem>();
    public int TotalBookings { get; set; }
    public double OverallAverageRating { get; set; }
}
