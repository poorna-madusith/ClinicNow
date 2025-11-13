using System;
using System.Security.Claims;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace backend.Hubs;

public class ChatHub : Hub
{

    private readonly ApplicationDBContext _context;

    public ChatHub(ApplicationDBContext context)
    {
        _context = context;
    }

    public async Task SendMessage(int conversationId, string content)
    {
        var senderId = Context.User?.FindFirst("id")?.Value ?? Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(senderId)) return;

        var conversation = await _context.Conversations
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == conversationId);

        if (conversation == null) return;

        var receiverId = conversation.PatientId == senderId ? conversation.DoctorId : conversation.DoctorId == senderId ? conversation.PatientId : null;

        if (string.IsNullOrEmpty(receiverId)) return;

        // Save to DB
        var message = new Message
        {
            ConversationId = conversationId,
            SenderId = senderId,
            ReceiverId = receiverId,
            Content = content,
            Timestamp = DateTime.UtcNow
        };
        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        // Send to receiver's group
        await Clients.Group($"chat-{conversationId}").SendAsync("ReceiveMessage", message);
        await Clients.User(receiverId).SendAsync("ReceiveMessage", message);
        await Clients.User(senderId).SendAsync("ReceiveMessage", message);
    }


    public async Task JoinChat(int conversationId)
    {
        var userId = Context.User?.FindFirst("id")?.Value ?? Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return;

        var isParticipant = await _context.Conversations
            .AnyAsync(c => c.Id == conversationId && (c.PatientId == userId || c.DoctorId == userId));

        if (!isParticipant) return;

        await Groups.AddToGroupAsync(Context.ConnectionId, $"chat-{conversationId}");
    }

    public async Task LeaveChat(int conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"chat-{conversationId}");
    }

}