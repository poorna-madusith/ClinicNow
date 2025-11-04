using backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stripe;
using Microsoft.Extensions.Logging;
using backend.Data;
using Microsoft.EntityFrameworkCore;
using backend.Models;

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
    
    
}