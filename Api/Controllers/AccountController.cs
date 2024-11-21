using Api.Dto.Account;
using Api.Models;
using Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly JWTService jwtService;
        private readonly EmailService emailService;
        private readonly SignInManager<User> signInManager;
        private readonly UserManager<User> userManager;
        private readonly IConfiguration configuration;

        public AccountController(JWTService jwtService,EmailService emailService, SignInManager<User> signInManager, UserManager<User> userManager, IConfiguration configuration)
        {
            this.jwtService = jwtService;
            this.emailService = emailService;
            this.signInManager = signInManager;
            this.userManager = userManager;
            this.configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto model)
        {
            var user = await userManager.FindByNameAsync(model.UserName);   

            if (user == null)
            {
                return Unauthorized("Invalid username or password");
            }

            if (user.EmailConfirmed == false)
            {
                return Unauthorized("Please confirm your email");
            }

            var result = await signInManager.CheckPasswordSignInAsync(user, model.Password, false);

            if (!result.Succeeded)
            {
                return Unauthorized("Invalid username or password");
            }

            return CreateApplicationUserDto(user);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto model)
        {
            if (await CheckEmailExistAsync(model.Email))
            {
                return BadRequest($"An existing account is using the {model.Email}, email address. Please try with another address");
            }

            var userToAdd = new User 
            { 
                Email = model.Email.ToLower(), 
                FirstName = model.FirstName.ToLower(),
                LastName = model.LastName.ToLower(),
                //EmailConfirmed = true,
                UserName = model.Email.ToLower()
            };

            var result = await userManager.CreateAsync(userToAdd, model.Password);

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            try
            {
                if (await SendConfirmEmailAsync(userToAdd))
                {
                    // return Ok("Your account has been created, you can login");
                    return Ok(new JsonResult(new { title = "Account Created", message = "Your account has been created, please confirm your email address" }));
                }
            }
            catch (Exception)
            {
                return BadRequest("Failed to send email. Please contact admin");
            }

                return BadRequest("Failed to send email. Please contact admin");

        }

        private async Task<bool> SendConfirmEmailAsync(User userToAdd)
        {
            var token = await userManager.GenerateEmailConfirmationTokenAsync(userToAdd);
            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            var url = $"{configuration["JWT:clientUrl"]}/{configuration["Email:confirmEmailPath"]}?token={token}&email={userToAdd.Email}";

            var body = $"<p>Hello {userToAdd.FirstName}  {userToAdd.LastName}</p>" + 
                        "<p>Please confirm your email address by clicking on the following link.</p>" + 
                        $"<p><a href=\"{url}\">Click here</a></p>" + 
                        "<p>Thank you</p>" +
                        $"<br>{configuration["Email:applicationName"]}</br>";

            var emailSend = new EmailSendDto(userToAdd.Email, "Confirm your email", body);

            return await this.emailService.SendEmailAsync(emailSend);   

        }

        [HttpPost("resend-email")]
        public async Task<IActionResult> EmailConfirmationLink(string email)
        {
          //  var user = await userManager.FindByEmailAsync(email);
            if (string.IsNullOrEmpty(email)) return BadRequest("Inavlid Email");
            var user = await userManager.FindByEmailAsync(email);    

            if (user == null) return Unauthorized("Invalid Email");
            if (user.EmailConfirmed == true) return BadRequest("Email already confirmed");

            try
            {
                if (await SendConfirmEmailAsync(user))
                {
                    return Ok(new JsonResult(new { title = "Account Created", message = "Your account has been created, please confirm your email address" }));

                }

                return BadRequest("Failed to send email");
            }
            catch (Exception)
            {
                return BadRequest("Failed to send email");

            }
        }

        [HttpPost("forgot-username-or-password")]
        public async Task<IActionResult> ForgotUsernameOrPassword(string email)
        {
            if (string.IsNullOrEmpty(email)) return BadRequest("Inavlid Email");
            var user = await userManager.FindByEmailAsync(email);

            if (user == null) return Unauthorized("Email not verified");
            if (user.EmailConfirmed == true) return BadRequest("Email already confirmed");

            try
            {
                if (await SendForgotUsernameOrPasswordEmail(user))
                {
                    return Ok(new JsonResult(new { title = "Forgot username or password email", message = "Please check yout email" }));

                }

                return BadRequest("Failed to send email,");
            }
            catch(Exception) 
            {
                return BadRequest("Failed to send email,");

            }

        }

        [HttpPut("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto model)
        {
            var user = await userManager.FindByEmailAsync(model.Email);
            if (user == null) return Unauthorized("Email not verified");
            if (user.EmailConfirmed == true) return BadRequest("Email already confirmed");

            try
            {
                var decodedTokenBytes = WebEncoders.Base64UrlDecode(model.Token);
                var decodedToken = Encoding.UTF8.GetString(decodedTokenBytes);

                var result = await userManager.ResetPasswordAsync(user, decodedToken, model.NewPassword);

                if (result.Succeeded)
                {
                    return Ok(new JsonResult(new { title = "Password reset success", message = "Password reset successfully!" }));
                }

                return BadRequest("Invalid token. Please try again");
            }
            catch (Exception)
            {
                return BadRequest("Invalid token. Please try again");

            }
        }

        [HttpPut("confirm-email")]
        public async Task<IActionResult> ConfirmEmail(ConfirmEmailDto model)
        {
            var user = await userManager.FindByEmailAsync(model.Email);

            if (user == null)
            {
                return Unauthorized("Email has not been registered yet");
            }

            if (user.EmailConfirmed == true)
            {
                return BadRequest("Your email was confirmed before. Please login to your account.");
            }

            try
            {
                var decodedTokenBytes = WebEncoders.Base64UrlDecode(model.Token);
                var decodedToken = Encoding.UTF8.GetString(decodedTokenBytes);

                var result = await userManager.ConfirmEmailAsync(user, decodedToken);

                if (result.Succeeded)
                {
                    return Ok(new JsonResult(new { title = "Email confirmed", message = "Your email address is confirmed. You can login now"}));
                }

                return BadRequest("Invalid token. Please try again");
            }
            catch (Exception)
            {
                return BadRequest("Invalid token. Please try again");

            }
        }


        [Authorize]
        [HttpGet("refresh-user-token")]
        public async Task<ActionResult<UserDto>> RefreshUserToken()
        {
            var user = await userManager.FindByNameAsync(User.FindFirst(ClaimTypes.Email)?.Value!);
            return CreateApplicationUserDto(user!);
        }

        private async Task<bool> SendForgotUsernameOrPasswordEmail(User user)
        {
            var token = await userManager.GenerateEmailConfirmationTokenAsync(user);
            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            var url = $"{configuration["JWT:clientUrl"]}/{configuration["Email:resetPasswordPath"]}?token={token}&email={user.Email}";


            var body = $"<p>Hello {user.FirstName}  {user.LastName}</p>" +
                        "<p>Please reset your password by clicking on the following link.</p>" +
                        $"<p><a href=\"{url}\">Click here</a></p>" +
                        "<p>Thank you</p>" +
                        $"<br>{configuration["Email:applicationName"]}</br>";

            var emailSend = new EmailSendDto(user.Email, "Confirm your email", body);

            return await this.emailService.SendEmailAsync(emailSend);
        }

        private async Task<bool> CheckEmailExistAsync(string email)
        {
            return await userManager.Users.AnyAsync(x => x.Email == email.ToLower());
        }

        #region Private Helper Methods
        private UserDto CreateApplicationUserDto(User user)
        {
            return new UserDto { FirstName = user.FirstName, LastName = user.LastName, JWT = jwtService.CreateJWT(user) };
        }
        #endregion
    }
}
