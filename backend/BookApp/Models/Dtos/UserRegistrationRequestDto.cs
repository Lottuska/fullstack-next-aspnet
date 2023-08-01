using System.ComponentModel.DataAnnotations;

namespace BookApp.Models.Dtos
{
    public class UserRegistrationRequestDto
    {
        [Required]
        public string Name { get; set; }

        [Required]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }
    }
}
