using System.ComponentModel.DataAnnotations;

namespace BookApp.Models.Dtos
{
    public class UserLogoutRequestDto
    {
        [Required]
        public string RefreshToken { get; set; }
    }
}
