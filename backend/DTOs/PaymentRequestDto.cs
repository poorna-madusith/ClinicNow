namespace backend.DTOs;

public class PaymentRequestDto
{
    public long Amount { get; set; }
    public int BookingId { get; set; }
    public string PatientId { get; set; } = null!;
}