using backend.Models;

namespace backend.DTOs;

public class ChatParticipantDto
{
    public string Id { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public RoleEnum Role { get; set; }
    public string? ProfileImageUrl { get; set; }
}

public class ConversationDto
{
    public int Id { get; set; }
    public ChatParticipantDto Participant { get; set; } = null!;
    public Message? LastMessage { get; set; }
    public int UnreadCount { get; set; }
}
