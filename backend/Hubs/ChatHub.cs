using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs;

public class ChatHub : Hub
{

    private readonly ApplicationDBContext _context;

    public ChatHub(ApplicationDBContext context)
    {
        _context = context;
    }

    public async Task SendMessage(int conversationId, string receiverId, string content)
    {
        var senderId = Context.User.Identity.Name;
        if (string.IsNullOrEmpty(senderId)) return;

        // Save to DB
        var message = new Message
        {
            ConversationId = conversationId,
            SenderId = senderId,
            ReceiverId = receiverId,
            Content = content
        };
        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        // Send to receiver's group
        await Clients.Group($"chat-{conversationId}").SendAsync("ReceiveMessage", message);
    }


    public async Task JoinChat(int conversationId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"chat-{conversationId}");
    }

    public async Task LeaveChat(int conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"chat-{conversationId}");
    }
    
}