using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HR.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [AllowAnonymous]
    [HttpGet("ping")]
    public IActionResult Ping() => Ok(new { pong = true, service = "hr" });
}
