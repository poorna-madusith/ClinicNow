namespace backend.DTOs;

public class TownStatItem
{
    public string Town { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class TownStatsDto
{
    public List<TownStatItem> TownStats { get; set; } = new List<TownStatItem>();
    public int TotalPatients { get; set; }
}
