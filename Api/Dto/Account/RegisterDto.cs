using System.ComponentModel.DataAnnotations;

namespace Api.Dto.Account
{
    public class RegisterDto
    {

        [Required]
        [StringLength(15, MinimumLength = 3, ErrorMessage = "Last name must be at least (2) and maximum (15) characters")]
        public string FirstName { get; set; }

        public string LastName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [StringLength(15, MinimumLength = 3, ErrorMessage = "Password name must be at least (2) and maximum (15) characters")]
        public string Password { get; set; }
    }
}
