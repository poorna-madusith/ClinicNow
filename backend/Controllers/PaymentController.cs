using backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stripe;
using Microsoft.Extensions.Logging;
using backend.Data;
using Microsoft.EntityFrameworkCore;
using backend.Models;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.Layout.Properties;

namespace backend.Controllers;


[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentController : ControllerBase
{

    private readonly string _stripeSecretKey;
    private readonly string _stripeWebhookSecret;
    private readonly ILogger<PaymentController> _logger;
    private readonly ApplicationDBContext _context;

    public PaymentController(IConfiguration configuration, ILogger<PaymentController> logger, ApplicationDBContext context)
    {
        _stripeSecretKey = configuration["Stripe:SecretKey"] ?? throw new ArgumentNullException("Stripe:SecretKey is not configured");
        _stripeWebhookSecret = configuration["Stripe:WebhookSecret"] ?? throw new ArgumentNullException("Stripe:WebhookSecret is not configured");
        _logger = logger;
        _context = context;

        StripeConfiguration.ApiKey = _stripeSecretKey;
    }


    [HttpPost("createpaymentintent")]
    public async Task<IActionResult> CreatePaymentIntent([FromBody] PaymentRequestDto paymentRequest)
    {
        var options = new PaymentIntentCreateOptions
        {
            Amount = paymentRequest.Amount,
            Currency = "usd",
            PaymentMethodTypes = new List<string> { "card" },
        };

        var Service = new PaymentIntentService();
        var paymentIntent = Service.Create(options);

        // Create payment record in database
        var payment = new Payment
        {
            PaymentIntentId = paymentIntent.Id,
            Amount = paymentRequest.Amount / 100m, // Convert from cents to dollars
            Currency = "usd",
            Status = "pending",
            BookingId = paymentRequest.BookingId,
            PatientId = paymentRequest.PatientId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();

        return Ok(new { clientSecret = paymentIntent.ClientSecret });
    }


    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> StripeWebHook() {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        
        try
        {
            var StripeEvent = EventUtility.ConstructEvent(
                json,
                Request.Headers["Stripe-Signature"],
                _stripeWebhookSecret
            );

            if (StripeEvent.Type == "payment_intent.succeeded")
            {
                var paymentIntent = StripeEvent.Data.Object as PaymentIntent;
                if (paymentIntent != null)
                {
                    var payment = await _context.Payments
                        .FirstOrDefaultAsync(p => p.PaymentIntentId == paymentIntent.Id);
                    
                    if (payment != null)
                    {
                        payment.Status = "succeeded";
                        payment.UpdatedAt = DateTime.UtcNow;
                        await _context.SaveChangesAsync();
                        
                        _logger.LogInformation("Payment {PaymentIntentId} succeeded for booking {BookingId}", 
                            paymentIntent.Id, payment.BookingId);
                    }
                    else
                    {
                        _logger.LogWarning("Payment intent {PaymentIntentId} succeeded but no matching payment record found", 
                            paymentIntent.Id);
                    }
                }
            }
            else if (StripeEvent.Type == "payment_intent.payment_failed")
            {
                var paymentIntent = StripeEvent.Data.Object as PaymentIntent;
                if (paymentIntent != null)
                {
                    var payment = await _context.Payments
                        .FirstOrDefaultAsync(p => p.PaymentIntentId == paymentIntent.Id);
                    
                    if (payment != null)
                    {
                        payment.Status = "failed";
                        payment.UpdatedAt = DateTime.UtcNow;
                        await _context.SaveChangesAsync();
                        
                        _logger.LogWarning("Payment {PaymentIntentId} failed for booking {BookingId}", 
                            paymentIntent.Id, payment.BookingId);
                    }
                }
            }

            return Ok();
        }
        catch (StripeException e)
        {
            _logger.LogError(e, "Stripe webhook error");
            return BadRequest();
        }
    }
    
    
    [HttpGet("latest/{patientId}")]
    public async Task<IActionResult> GetLatestPayment(string patientId)
    {
        var payment = await _context.Payments
            .Where(p => p.PatientId == patientId && p.Status == "succeeded")
            .OrderByDescending(p => p.CreatedAt)
            .FirstOrDefaultAsync();

        if (payment == null)
        {
            return NotFound("No successful payment found");
        }

        return Ok(new { paymentId = payment.Id });
    }

    [HttpPut("updatebooking/{paymentId}")]
    public async Task<IActionResult> UpdatePaymentBooking(int paymentId, [FromBody] int bookingId)
    {
        var payment = await _context.Payments.FindAsync(paymentId);
        if (payment == null)
        {
            return NotFound("Payment not found");
        }

        payment.BookingId = bookingId;
        await _context.SaveChangesAsync();

        return Ok();
    }

    [HttpGet("receipt/{bookingId}")]
    public async Task<IActionResult> GetReceipt(int bookingId)
    {
        var payment = await _context.Payments
            .Include(p => p.Booking)
            .ThenInclude(b => b.Session)
            .ThenInclude(s => s.Doctor)
            .Include(p => p.Patient)
            .FirstOrDefaultAsync(p => p.BookingId == bookingId && p.Status == "succeeded");

        if (payment == null)
        {
            return NotFound("Payment not found or not completed");
        }

        using (var memoryStream = new MemoryStream())
        {
            var pdfWriter = new PdfWriter(memoryStream);
            var pdfDocument = new PdfDocument(pdfWriter);
            var document = new Document(pdfDocument);

            // Add title
            document.Add(new Paragraph("Payment Receipt")
                .SetFontSize(20)
                .SetTextAlignment(TextAlignment.CENTER)
                .SetMarginBottom(20));

            // Add payment details
            document.Add(new Paragraph($"Receipt Number: {payment.Id}")
                .SetFontSize(12));
            document.Add(new Paragraph($"Date: {payment.CreatedAt:yyyy-MM-dd HH:mm:ss}")
                .SetFontSize(12));
            document.Add(new Paragraph($"Patient: {payment.Patient?.FirstName} {payment.Patient?.LastName}")
                .SetFontSize(12));
            document.Add(new Paragraph($"Doctor: {payment.Booking?.Session?.Doctor?.FirstName} {payment.Booking?.Session?.Doctor?.LastName}")
                .SetFontSize(12));
            document.Add(new Paragraph($"Session Date: {payment.Booking?.Session?.Date:yyyy-MM-dd}")
                .SetFontSize(12));
            document.Add(new Paragraph($"Amount: ${payment.Amount}")
                .SetFontSize(12));
            document.Add(new Paragraph($"Status: {payment.Status}")
                .SetFontSize(12));

            document.Close();

            var pdfBytes = memoryStream.ToArray();
            return File(pdfBytes, "application/pdf", $"receipt_{payment.Id}.pdf");
        }
    }
    
    
}