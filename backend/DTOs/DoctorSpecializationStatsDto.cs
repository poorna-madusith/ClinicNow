namespace backend.DTOs;

public class SpecializationStatItem
{
    public string Specialization { get; set; } = null!;
    public int Count { get; set; }
}

public class DoctorSpecializationStatsDto
{
    public List<SpecializationStatItem> SpecializationStats { get; set; } = new();
    public int TotalDoctors { get; set; }
}
