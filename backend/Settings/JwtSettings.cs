
namespace backend.Settings;

public class JwtSettings
{
    public string key { get; set; } = null!;
    public string issuer { get; set; } = null!;
    public string audience { get; set; } = null!;
    public double durationInMinutes { get; set; }
}