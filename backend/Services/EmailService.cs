using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace backend.Services;

public interface IEmailService
{
    Task SendPasswordResetEmailAsync(string toEmail, string resetLink);
}

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendPasswordResetEmailAsync(string toEmail, string resetLink)
    {
        Console.WriteLine($"\n=== SENDING PASSWORD RESET EMAIL ===");
        Console.WriteLine($"To: {toEmail}");
        
        var smtpHost = _configuration["Email:SmtpHost"];
        var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
        var smtpUsername = _configuration["Email:SmtpUsername"];
        var smtpPassword = _configuration["Email:SmtpPassword"];
        var fromEmail = _configuration["Email:FromEmail"];
        var fromName = _configuration["Email:FromName"] ?? "ClinicNow";
        var enableEmailSending = _configuration["Email:EnableSending"] == "true";

        Console.WriteLine($"SMTP Host: {smtpHost}");
        Console.WriteLine($"SMTP Port: {smtpPort}");
        Console.WriteLine($"From Email: {fromEmail}");
        Console.WriteLine($"Email Sending Enabled: {enableEmailSending}");

        if (!enableEmailSending || string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(smtpUsername) || string.IsNullOrEmpty(smtpPassword))
        {
            _logger.LogWarning("Email sending is disabled or configuration is missing. Reset link: {ResetLink}", resetLink);
            // In development, just log the link instead of sending email
            Console.WriteLine($"\n=== PASSWORD RESET LINK (Console Mode) ===");
            Console.WriteLine($"Email: {toEmail}");
            Console.WriteLine($"Reset Link: {resetLink}");
            Console.WriteLine($"\n✅ Copy the link above and paste it in your browser!");
            Console.WriteLine($"==========================================\n");
            return;
        }

        try
        {
            Console.WriteLine("Attempting to send email using MailKit...");
            
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(fromName, fromEmail ?? smtpUsername));
            message.To.Add(new MailboxAddress("", toEmail));
            message.Subject = "Password Reset Request - ClinicNow";

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = GetEmailBody(resetLink)
            };
            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            
            // Try port 465 with SSL if port is 587, otherwise use StartTLS
            if (smtpPort == 465)
            {
                await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.SslOnConnect);
            }
            else
            {
                await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
            }
            
            await client.AuthenticateAsync(smtpUsername, smtpPassword);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
            
            Console.WriteLine($"✅ Email sent successfully!");
            Console.WriteLine($"Reset Link: {resetLink}");
            Console.WriteLine($"=====================================\n");
            
            _logger.LogInformation("Password reset email sent successfully to {Email}", toEmail);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Email sending failed: {ex.Message}");
            _logger.LogError(ex, "Failed to send password reset email to {Email}", toEmail);
            
            // In development, log the link even if email fails
            Console.WriteLine($"\n=== PASSWORD RESET LINK (Email Failed) ===");
            Console.WriteLine($"Email: {toEmail}");
            Console.WriteLine($"Reset Link: {resetLink}");
            Console.WriteLine($"Error: {ex.Message}");
            Console.WriteLine($"===========================================\n");
        }
    }

    private string GetEmailBody(string resetLink)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
        .content {{ background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }}
        .button {{ 
            display: inline-block; 
            background-color: #4F46E5; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0; 
        }}
        .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Password Reset Request</h1>
        </div>
        <div class='content'>
            <p>Hello,</p>
            <p>We received a request to reset your password for your ClinicNow account.</p>
            <p>Click the button below to reset your password:</p>
            <div style='text-align: center;'>
                <a href='{resetLink}' class='button'>Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style='word-break: break-all; color: #4F46E5;'>{resetLink}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            <p>Best regards,<br>The ClinicNow Team</p>
        </div>
        <div class='footer'>
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>";
    }
}
