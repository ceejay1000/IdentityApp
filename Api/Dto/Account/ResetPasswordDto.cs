using System.ComponentModel.DataAnnotations;

namespace Api.Dto.Account
{
    public class ResetPasswordDto
    {

        [Required]
        public string Email { get; set; }

        [Required]
        public string Token { get; set; } = string.Empty;

        [Required]
        public string NewPassword { get; set; }
    }
}
