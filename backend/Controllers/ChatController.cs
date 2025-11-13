using System.Linq;
using System.Security.Claims;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;


[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{

    private readonly ApplicationDBContext _context;

    public ChatController(ApplicationDBContext context)
    {
        _context = context;
    }

    private string? GetCurrentUserId()
    {
        return User.FindFirst("id")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }

    private ConversationDto ToConversationDto(Conversation conversation, string currentUserId)
    {
        var participant = conversation.PatientId == currentUserId ? conversation.Doctor : conversation.Patient;
        var unreadCount = conversation.Messages
            .Count(m => m.ReceiverId == currentUserId && !m.IsRead);

        return new ConversationDto
        {
            Id = conversation.Id,
            Participant = new ChatParticipantDto
            {
                Id = participant.Id,
                FirstName = participant.FirstName,
                LastName = participant.LastName,
                Role = participant.Role,
                ProfileImageUrl = participant.ProfileImageUrl
            },
            LastMessage = conversation.Messages
                .OrderByDescending(m => m.Timestamp)
                .FirstOrDefault(),
            UnreadCount = unreadCount
        };
    }

    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<UserDetailsDto>>> GetUsersForChat()
    {
        var currentUserId = GetCurrentUserId();
        if (string.IsNullOrEmpty(currentUserId))
        {
            return Unauthorized();
        }
        var currentUser = await _context.Users.FindAsync(currentUserId);

        if (currentUser == null)
        {
            return NotFound("User not found.");
        }

        IQueryable<ApplicationUser> usersQuery = _context.Users
            .AsNoTracking()
            .Where(u => u.Id != currentUserId);

        if (currentUser.Role == RoleEnum.Patient)
        {
            // Patients can only chat with doctors
            usersQuery = usersQuery.Where(u => u.Role == RoleEnum.Doctor);
        }
        else if (currentUser.Role == RoleEnum.Doctor)
        {
            // Doctors can only chat with patients
            usersQuery = usersQuery.Where(u => u.Role == RoleEnum.Patient);
        }


        var users = await usersQuery
            .OrderBy(u => u.FirstName)
            .Select(u => new UserDetailsDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                Role = u.Role,
                ProfileImageUrl = u.ProfileImageUrl
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpPost("conversations/{participantId}")]
    public async Task<ActionResult<ConversationDto>> CreateConversation(string participantId)
    {
        var currentUserId = GetCurrentUserId();
        if (string.IsNullOrEmpty(currentUserId))
        {
            return Unauthorized();
        }
        var currentUser = await _context.Users.FindAsync(currentUserId);
        var participant = await _context.Users.FindAsync(participantId);

        if (currentUser == null || participant == null)
        {
            return NotFound("User or participant not found.");
        }

        string patientId, doctorId;

        if (currentUser.Role == RoleEnum.Patient && participant.Role == RoleEnum.Doctor)
        {
            patientId = currentUserId;
            doctorId = participantId;
        }
        else if (currentUser.Role == RoleEnum.Doctor && participant.Role == RoleEnum.Patient)
        {
            patientId = participantId;
            doctorId = currentUserId;
        }
        else
        {
            return BadRequest("Invalid conversation participants.");
        }

        var conversation = await _context.Conversations
            .AsNoTracking()
            .Include(c => c.Patient)
            .Include(c => c.Doctor)
            .Include(c => c.Messages)
            .FirstOrDefaultAsync(c =>
                c.PatientId == patientId && c.DoctorId == doctorId);

        if (conversation == null)
        {
            conversation = new Conversation
            {
                PatientId = patientId,
                DoctorId = doctorId
            };
            _context.Conversations.Add(conversation);
            await _context.SaveChangesAsync();

            conversation = await _context.Conversations
                .AsNoTracking()
                .Include(c => c.Patient)
                .Include(c => c.Doctor)
                .Include(c => c.Messages)
                .FirstAsync(c => c.Id == conversation.Id);
        }

        return Ok(ToConversationDto(conversation, currentUserId));
    }

    [HttpGet("conversations")]
    public async Task<ActionResult<IEnumerable<ConversationDto>>> GetConversations()
    {
        var currentUserId = GetCurrentUserId();
        if (string.IsNullOrEmpty(currentUserId))
        {
            return Unauthorized();
        }
        var conversations = await _context.Conversations
            .AsNoTracking()
            .Where(c => c.PatientId == currentUserId || c.DoctorId == currentUserId)
        .Include(c => c.Patient)
        .Include(c => c.Doctor)
        .Include(c => c.Messages)
        .ToListAsync();

        return Ok(conversations
            .Select(c => ToConversationDto(c, currentUserId))
            .OrderByDescending(dto => dto.LastMessage?.Timestamp)
            .ToList());
    }

    [HttpGet("history/{conversationId}")]
    public async Task<ActionResult<IEnumerable<Message>>> GetChatHistory(int conversationId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }
        var conversationExists = await _context.Conversations
            .AnyAsync(c => c.Id == conversationId && (c.PatientId == userId || c.DoctorId == userId));

        if (!conversationExists)
        {
            return Forbid();
        }
        var messages = await _context.Messages
            .Where(m => m.ConversationId == conversationId)
            .OrderBy(m => m.Timestamp)
            .ToListAsync();

        // Mark messages as read
        var unreadMessages = messages.Where(m => m.ReceiverId == userId && !m.IsRead).ToList();
        foreach (var msg in unreadMessages)
        {
            msg.IsRead = true;
        }
        if (unreadMessages.Any())
        {
            await _context.SaveChangesAsync();
        }

        return Ok(messages);
    }

    [HttpPost("mark-read/{conversationId}")]
    public async Task<IActionResult> MarkMessagesAsRead(int conversationId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var conversationExists = await _context.Conversations
            .AnyAsync(c => c.Id == conversationId && (c.PatientId == userId || c.DoctorId == userId));

        if (!conversationExists)
        {
            return Forbid();
        }

        var unreadMessages = await _context.Messages
            .Where(m => m.ConversationId == conversationId && m.ReceiverId == userId && !m.IsRead)
            .ToListAsync();

        foreach (var msg in unreadMessages)
        {
            msg.IsRead = true;
        }

        if (unreadMessages.Any())
        {
            await _context.SaveChangesAsync();
        }

        return Ok(new { markedCount = unreadMessages.Count });
    }


    [HttpGet("getAllchats")]
    public async Task<ActionResult<IEnumerable<Message>>> GetAllChats()
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }
        var messages = await _context.Messages
            .Where(m => m.SenderId == userId || m.ReceiverId == userId)
            .OrderBy(m => m.Timestamp)
            .ToListAsync();
        return Ok(messages);
    }

}