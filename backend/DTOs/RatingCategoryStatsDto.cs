namespace backend.DTOs;

public class RatingCategoryStatsDto
{
    public double AverageCommunicationRating { get; set; }
    public double AverageProfessionalismRating { get; set; }
    public double AveragePunctualityRating { get; set; }
    public double AverageTreatmentRating { get; set; }
    public double AverageOverallRating { get; set; }
    public int TotalFeedbacks { get; set; }
}
