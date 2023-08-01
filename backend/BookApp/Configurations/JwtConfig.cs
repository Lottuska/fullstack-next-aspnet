namespace BookApp.Configurations
{
    public class JwtConfig
    {
        public string Secret { get; set; }
        public TimeSpan ExpirationTime { get; set; }
    }
}
