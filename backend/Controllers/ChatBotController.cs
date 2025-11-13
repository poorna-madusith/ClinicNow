using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Mscc.GenerativeAI;

namespace backend.Controllers;



[ApiController]
[Route("api/[controller]")]
public class ChatBotController : ControllerBase
{
    private readonly IConfiguration _config;

    public ChatBotController(IConfiguration config)
    {
        _config = config;
    }

    [HttpPost]
    public async Task<IActionResult> PostChatMessage([FromBody] ChatRequestDto chatRequest)
    {
        try
        {
            // Get Gemini API key from configuration
            var apiKey = _config["Gemini:ApiKey"];

            if (string.IsNullOrEmpty(apiKey) || apiKey == "YOUR_GEMINI_API_KEY_HERE")
            {
                return BadRequest(new { Error = "Gemini API key is not configured. Please add your API key to appsettings.Development.json" });
            }

            // Initialize Gemini client
            var googleAI = new GoogleAI(apiKey: apiKey);
            var model = googleAI.GenerativeModel(model: Model.GeminiPro);

            // Create the system prompt as part of the message
            var fullPrompt =
                "You are a professional medical AI assistant for ClinicNow, a healthcare management platform. " +
                "Your role is to provide accurate, evidence-based medical information and support to patients and healthcare providers. " +
                "Always maintain medical ethics and confidentiality. " +
                "Provide clear, concise responses in the user's preferred language. " +
                "When addressing health concerns: " +
                "1. Acknowledge the user's symptoms or concerns with empathy. " +
                "2. Provide relevant medical information based on established medical guidelines. " +
                "3. Recommend when professional medical consultation is necessary. " +
                "4. Do NOT provide a definitive diagnosis or replace professional medical advice. " +
                "5. Suggest preventive measures and healthy lifestyle choices when appropriate. " +
                "Always encourage users to consult with licensed healthcare professionals for serious health concerns. " +
                "Maintain a professional, compassionate tone while prioritizing user safety and well-being.\n\n" +
                $"User message: {chatRequest.Message}";

            // Generate response from Gemini
            var response = await model.GenerateContent(fullPrompt);

            // Extract the reply text
            var reply = response.Text;

            return Ok(new { Reply = reply });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Error = $"An error occurred: {ex.Message}" });
        }
    }
}