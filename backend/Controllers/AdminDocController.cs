using backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Services;


[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminDocController : ControllerBase
{
    private readonly AdminDocServices _adminDocServices;

    public AdminDocController(AdminDocServices adminDocServices)
    {
        _adminDocServices = adminDocServices;
    }


    //create doctor
    [HttpPost("doctorregister")]
    public async Task<IActionResult> DoctorRegister([FromBody] DoctorRegisterDto doctorRegisterDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await _adminDocServices.CreateDoctor(doctorRegisterDto);
            return Ok(new { Message = "Doctor registered successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });


        }
    }


    //get all doctors
    [HttpGet("getalldoctors")]
    public async Task<IActionResult> GetAllDoctors()
    {
        try
        {
            var doctors = await _adminDocServices.GetAllDoctors();
            return Ok(doctors);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    //update a doctor
    [HttpPut("updatedoctor/{id}")]
    public async Task<IActionResult> updateDoctor(string id, [FromBody] DoctorRegisterDto doctorRegisterDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await _adminDocServices.EditDoctor(id, doctorRegisterDto);
            return Ok(new { Message = "Doctor updated successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }


    //delete a docotor
    [HttpDelete("deletedoctor/{id}")]
    public async Task<IActionResult> DeleteDoc(string id)
    {
        try
        {
            await _adminDocServices.DeleteDoctor(id);
            return Ok(new { Message = "Doctor deleted successfully" });
        }catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }



}