using BookApp.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

namespace BookApp.Middlewares
{
    public class TokenValidationMiddleware
    {
        private readonly TokenValidationParameters _tokenValidationParameters;
        private readonly RequestDelegate _next;
        private readonly IServiceProvider _serviceProvider;

        public TokenValidationMiddleware(
            TokenValidationParameters tokenValidationParameters,
            RequestDelegate next,
            IServiceProvider serviceProvider
        )
        {
            _tokenValidationParameters = tokenValidationParameters;
            _next = next;
            _serviceProvider = serviceProvider;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var token = context.Request.Headers["Authorization"]
                .FirstOrDefault()
                ?.Split(" ")
                .Last();

            var jwtTokenHandler = new JwtSecurityTokenHandler();

            try
            {
                if (token != null)
                {
                    var tokenInValidation = jwtTokenHandler.ValidateToken(
                        token,
                        _tokenValidationParameters,
                        out var validatedToken
                    );

                    var tokenIdentifier = tokenInValidation.Claims
                        .FirstOrDefault(x => x.Type == JwtRegisteredClaimNames.Jti)
                        .Value;

                    var isTokenRevoked = await IsTokenRevoked(tokenIdentifier);

                    if (isTokenRevoked)
                    {
                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        return;
                    }

                    // Successful authentication
                    context.User = tokenInValidation;
                }
            }
            catch (SecurityTokenException)
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return;
            }

            await _next(context);
        }

        private async Task<bool> IsTokenRevoked(string tokenIdentifier)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var currentToken = await context.RefreshTokens
                    .OrderBy(o => o.CreatedTime)
                    .LastOrDefaultAsync(x => x.JwtId == tokenIdentifier);

                if (currentToken == null)
                {
                    return true; // Token not found, can't make a request
                }

                if (currentToken.IsRevoked)
                {
                    return true; // Token has already been revoked, cant't make a request
                }

                if (currentToken.ExpirationDate < DateTime.UtcNow)
                {
                    return true; // Token is expired, cant't make a request
                }

                if (!currentToken.IsUsed)
                {
                    currentToken.IsUsed = true;

                    context.RefreshTokens.Update(currentToken);
                    await context.SaveChangesAsync();
                }
            }

            // Token is not revoked can still be used, can make a request
            return false;
        }
    }

    public static class TokenValidationMiddlewareExtensions
    {
        public static IApplicationBuilder UseTokenValidationMiddleware(
            this IApplicationBuilder builder
        )
        {
            return builder.UseMiddleware<TokenValidationMiddleware>();
        }
    }
}
