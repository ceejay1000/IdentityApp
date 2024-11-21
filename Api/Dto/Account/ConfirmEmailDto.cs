using System.ComponentModel.DataAnnotations;

namespace Api.Dto.Account
{
    public class ConfirmEmailDto
    {
        [Required]
        public string Email { get; set; }

        [Required]
        public string Token { get; set; }
    }
}
