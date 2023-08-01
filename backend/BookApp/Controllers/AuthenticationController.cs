using BookApp.Configurations;
using BookApp.Data;
using BookApp.Models;
using BookApp.Models.Dtos;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Sockets;
using System.Security.Claims;
using System.Text;

namespace BookApp.Controllers
{
    [EnableCors]
    [Route("api/[controller]")] // api/authentication
    [ApiController]
    public class AuthenticationController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly TokenValidationParameters _tokenValidationParameters;
        private readonly AppDbContext _context;

        public AuthenticationController(
            UserManager<IdentityUser> userManager,
            IConfiguration configuration,
            TokenValidationParameters tokenValidationParameters,
            AppDbContext context
        )
        {
            _context = context;
            _userManager = userManager;
            _configuration = configuration;
            _tokenValidationParameters = tokenValidationParameters;
        }

        [HttpPost]
        [Route("Register")]
        public async Task<IActionResult> Register([FromBody] UserRegistrationRequestDto requestDto)
        {
            if (ModelState.IsValid)
            {
                var userExists = await _userManager.FindByEmailAsync(requestDto.Email);

                if (userExists != null)
                {
                    return BadRequest(
                        new AuthResult()
                        {
                            Result = false,
                            Errors = new List<string>() { "Email already exists." }
                        }
                    );
                }

                var newPasswordValidator = new PasswordValidator<IdentityUser>();
                var passwordValidationResult = await newPasswordValidator.ValidateAsync(_userManager, null, requestDto.Password);

                if (!passwordValidationResult.Succeeded)
                {
                    var errors = passwordValidationResult.Errors.Select(error => error.Description);
                    return BadRequest(new AuthResult()
                    {
                        Result = false,
                        Errors = errors.ToList()
                    });
                }

                var newUser = new IdentityUser()
                {
                    Email = requestDto.Email,
                    UserName = requestDto.Email
                };

                var isCreated = await _userManager.CreateAsync(newUser, requestDto.Password);

                if (isCreated.Succeeded)
                {
                    var token = await GenerateJwtToken(newUser);

                    return Ok(token);
                }

                return BadRequest(
                    new AuthResult()
                    {
                        Result = false,
                        Errors = new List<string>() { "Server error." }
                    }
                );
            }

            return BadRequest();
        }

        [HttpPost]
        [Route("Login")]
        public async Task<IActionResult> Login([FromBody] UserLoginRequestDto requestDto)
        {
            if (ModelState.IsValid)
            {
                var userExists = await _userManager.FindByEmailAsync(requestDto.Email);

                if (userExists == null)
                {
                    return BadRequest(
                        new AuthResult()
                        {
                            Result = false,
                            Errors = new List<string>() { "User does not exist." }
                        }
                    );
                }

                var isCorrect = await _userManager.CheckPasswordAsync(
                    userExists,
                    requestDto.Password
                );

                if (!isCorrect)
                {
                    return BadRequest(
                        new AuthResult()
                        {
                            Result = false,
                            Errors = new List<string>() { "Invalid password." }
                        }
                    );
                }

                var jwtToken = await GenerateJwtToken(userExists);

                return Ok(jwtToken);
            }

            return BadRequest(
                new AuthResult()
                {
                    Result = false,
                    Errors = new List<string>() { "Invalid payload." }
                }
            );
        }

        [HttpPost]
        [Route("Logout")]
        public async Task<IActionResult> Logout([FromBody] UserLogoutRequestDto requestDto)
        {
            if (ModelState.IsValid)
            {
                var currentToken = await _context.RefreshTokens
                    .OrderBy(o => o.CreatedTime)
                    .LastOrDefaultAsync(x => x.Token == requestDto.RefreshToken);

                if (currentToken == null)
                {
                    return BadRequest(
                        new AuthResult()
                        {
                            Result = false,
                            Errors = new List<string>() { "Invalid tokens, token null." }
                        }
                    );
                }

                if (currentToken.IsRevoked == true)
                {
                    return Ok("User is already logged out.");
                }

                currentToken.IsUsed = true;
                currentToken.IsRevoked = true;
                _context.RefreshTokens.Update(currentToken);
                await _context.SaveChangesAsync();

                return Ok("Logout successful.");
            }

            return BadRequest(
                new AuthResult()
                {
                    Result = false,
                    Errors = new List<string>() { "Invalid payload." }
                }
            );
        }

        [HttpPost]
        [Route("RefreshToken")]
        public async Task<IActionResult> RefreshToken([FromBody] TokenRequest request)
        {
            if (ModelState.IsValid)
            {
                var result = await VerifyAndGenerateToken(request);

                if (result == null)
                {
                    return BadRequest(
                        new AuthResult()
                        {
                            Result = false,
                            Errors = new List<string>() { "Invalid tokens, couldn't verify and generate token." }
                        }
                    );
                }

                return Ok(result);
            }

            return BadRequest(
                new AuthResult()
                {
                    Result = false,
                    Errors = new List<string>() { "Invalid parameters." }
                }
            );
        }

        private async Task<AuthResult> GenerateJwtToken(IdentityUser user)
        {
            var jwtTokenHandler = new JwtSecurityTokenHandler();

            var key = Encoding.UTF8.GetBytes(_configuration.GetSection("JwtConfig:Secret").Value);

            var tokenDescriptor = new SecurityTokenDescriptor()
            {
                Subject = new ClaimsIdentity(
                    new[]
                    {
                        new Claim("Id", user.Id),
                        new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                        new Claim(JwtRegisteredClaimNames.Email, user.Email),
                        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                        new Claim(
                            JwtRegisteredClaimNames.Iat,
                            DateTime.Now.ToUniversalTime().ToString()
                        ),
                    }
                ),
                Expires = DateTime.UtcNow.Add(
                    TimeSpan.Parse(
                        _configuration.GetSection("JwtConfig:AccessTokenExpirationTime").Value
                    )
                ),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256
                )
            };

            var token = jwtTokenHandler.CreateToken(tokenDescriptor);
            var jwtToken = jwtTokenHandler.WriteToken(token);

            // If there is a valid RefreshToken for current user, use it
            var currentRefreshToken = await _context.RefreshTokens
                .OrderBy(o => o.CreatedTime)
                .LastOrDefaultAsync(x => x.UserId == user.Id);
            if (
                currentRefreshToken != null
                && currentRefreshToken.ExpirationDate > DateTime.UtcNow
                && !currentRefreshToken.IsRevoked
            )
            {
                currentRefreshToken.JwtId = token.Id;
                await _context.SaveChangesAsync();

                return new AuthResult()
                {
                    Token = jwtToken,
                    RefreshToken = currentRefreshToken.Token,
                    Result = true
                };
            }

            // If not, generate a new RefreshToken
            var refreshToken = new RefreshToken()
            {
                JwtId = token.Id,
                Token = RandomStringGenerator(25),
                CreatedTime = DateTime.UtcNow,
                ExpirationDate = DateTime.UtcNow.Add(
                    TimeSpan.Parse(
                        _configuration.GetSection("JwtConfig:RefreshTokenExpirationTime").Value
                    )
                ),
                IsRevoked = false,
                IsUsed = false,
                UserId = user.Id
            };

            await _context.RefreshTokens.AddAsync(refreshToken);
            await _context.SaveChangesAsync();

            return new AuthResult()
            {
                Token = jwtToken,
                RefreshToken = refreshToken.Token,
                Result = true
            };
        }

        private async Task<AuthResult> VerifyAndGenerateToken(TokenRequest tokenRequest)
        {
            var jwtTokenHandler = new JwtSecurityTokenHandler();

            try
            {
                _tokenValidationParameters.ValidateLifetime = false;

                var tokenInVerification = jwtTokenHandler.ValidateToken(
                    tokenRequest.Token,
                    _tokenValidationParameters,
                    out var validatedToken
                );

                if (validatedToken is JwtSecurityToken jwtSecurityToken)
                {
                    var result = jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256);

                    if (result == false)
                    {
                        return null;
                    }
                }

                var storedToken = await _context.RefreshTokens.FirstOrDefaultAsync(
                    x => x.Token == tokenRequest.RefreshToken
                );

                if (storedToken == null)
                {
                    return new AuthResult()
                    {
                        Result = false,
                        Errors = new List<string>() { "Invalid tokens, couldn't find token." }
                    };
                }

                if (storedToken.IsRevoked)
                {
                    return new AuthResult()
                    {
                        Result = false,
                        Errors = new List<string>() { "Invalid tokens, token is revoked." }
                    };
                }

                var jti = tokenInVerification.Claims
                    .FirstOrDefault(x => x.Type == JwtRegisteredClaimNames.Jti)
                    .Value;

                if (storedToken.JwtId != jti)
                {
                    return new AuthResult()
                    {
                        Result = false,
                        Errors = new List<string>() { "Invalid tokens, jti doesn't match." }
                    };
                }

                if (storedToken.ExpirationDate < DateTime.UtcNow)
                {
                    return new AuthResult()
                    {
                        Result = false,
                        Errors = new List<string>() { "Expired tokens." }
                    };
                }

                storedToken.IsUsed = true;
                _context.RefreshTokens.Update(storedToken);
                await _context.SaveChangesAsync();

                var user = await _userManager.FindByIdAsync(storedToken.UserId);
                return await GenerateJwtToken(user);
            }
            catch (Exception ex)
            {
                return new AuthResult()
                {
                    Result = false,
                    Errors = new List<string>() { "Server error." }
                };
            }
        }

        private string RandomStringGenerator(int length)
        {
            var random = new Random();
            var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            return new string(
                Enumerable.Repeat(chars, length).Select(s => s[random.Next(s.Length)]).ToArray()
            );
        }
    }
}
