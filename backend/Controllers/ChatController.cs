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


    [HttpGet("history/{conversationId}")]
    public async Task<ActionResult<IEnumerable<Message>>> GetChatHistory(int conversationId)
    {
        var userId = User.Identity.Name;
        var messages = await _context.Messages
            .Where(m => m.ConversationId == conversationId && (m.SenderId == userId || m.ReceiverId == userId))
            .OrderBy(m => m.Timestamp)
            .ToListAsync();
        return Ok(messages);
    }
    
}