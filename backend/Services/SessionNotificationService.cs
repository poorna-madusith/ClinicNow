using backend.Data;
using backend.Hubs;
using backend.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class SessionNotificationService
{
    private readonly ApplicationDBContext _context;
    private readonly IHubContext<ChatHub> _chatHubContext;

    public SessionNotificationService(ApplicationDBContext context, IHubContext<ChatHub> chatHubContext)
    {
        _context = context;
        _chatHubContext = chatHubContext;
    }

    /// <summary>
    /// Sends automated messages to all patients who booked a session
    /// </summary>
    /// <param name="sessionId">The session ID</param>
    /// <param name="messageType">"cancelled" or "started"</param>
    public async Task NotifyPatientsAboutSessionStatus(int sessionId, string messageType)
    {
        // Get the session with bookings
        var session = await _context.Sessions
            .Include(s => s.Doctor)
            .Include(s => s.Bookings)
                .ThenInclude(b => b.Patient)
            .FirstOrDefaultAsync(s => s.Id == sessionId);

        if (session == null)
        {
            throw new Exception("Session not found");
        }

        // If no bookings, nothing to notify
        if (session.Bookings == null || !session.Bookings.Any())
        {
            return;
        }

        // Format the date and time for the message
        var sessionDate = session.Date.ToString("MMMM dd, yyyy");
        var sessionTime = $"{session.StartTime:hh\\:mm} - {session.EndTime:hh\\:mm}";
        var doctorName = $"Dr. {session.Doctor.FirstName} {session.Doctor.LastName}";

        // Create the appropriate message based on type
        string messageContent;
        if (messageType.ToLower() == "cancelled")
        {
            messageContent = $"⚠️ Session Update: Your appointment with {doctorName} on {sessionDate} at {sessionTime} has been cancelled. Please contact the doctor or book a new session.";
        }
        else if (messageType.ToLower() == "started")
        {
            messageContent = $"✅ Session Update: Your appointment with {doctorName} on {sessionDate} at {sessionTime} has started. Please be ready for your turn.";
        }
        else
        {
            throw new ArgumentException("Invalid message type. Use 'cancelled' or 'started'");
        }

        // Send message to each patient who booked the session
        foreach (var booking in session.Bookings)
        {
            try
            {
                await SendAutomatedMessage(
                    session.DoctorId,
                    booking.PatientId,
                    messageContent
                );
            }
            catch (Exception ex)
            {
                // Log the error but continue with other notifications
                Console.WriteLine($"Error sending notification to patient {booking.PatientId}: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Sends an automated message from doctor to patient
    /// </summary>
    private async Task SendAutomatedMessage(string doctorId, string patientId, string content)
    {
        // Check if conversation exists between doctor and patient
        var conversation = await _context.Conversations
            .FirstOrDefaultAsync(c => 
                (c.DoctorId == doctorId && c.PatientId == patientId));

        // If conversation doesn't exist, create it
        if (conversation == null)
        {
            conversation = new Conversation
            {
                DoctorId = doctorId,
                PatientId = patientId
            };
            _context.Conversations.Add(conversation);
            await _context.SaveChangesAsync();
        }

        // Create and save the message
        var message = new Message
        {
            ConversationId = conversation.Id,
            SenderId = doctorId,
            ReceiverId = patientId,
            Content = content,
            Timestamp = DateTime.UtcNow,
            IsRead = false
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        // Send real-time notification via SignalR
        try
        {
            // Send to the conversation group
            await _chatHubContext.Clients.Group($"chat-{conversation.Id}")
                .SendAsync("ReceiveMessage", message);

            // Send directly to the patient user
            await _chatHubContext.Clients.User(patientId)
                .SendAsync("ReceiveMessage", message);

            // Also send to doctor (so they can see it in their chat)
            await _chatHubContext.Clients.User(doctorId)
                .SendAsync("ReceiveMessage", message);
        }
        catch (Exception ex)
        {
            // If SignalR fails, the message is still saved in DB
            Console.WriteLine($"SignalR notification failed: {ex.Message}");
        }
    }
}
