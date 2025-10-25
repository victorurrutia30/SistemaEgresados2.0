using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using SistemaEgresados.DTO;

namespace SistemaEgresados.Servicios
{
    public class TokenService
    {
        private readonly string _secretKey;
        private readonly string _issuer;
        private readonly string _audience;

        public TokenService()
        {
            _secretKey = "SISTEMA@EG3S4D@SPORT4LUT3CSSL45863!!";
            _issuer = "SistemaEgresadosUTEC";
            _audience = "EgresadosUTEC";
        }

        public string GenerarTokenRecuperacion(string email, int minutosExpiracion = 30)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_secretKey);

            var tokenDescriptor = new Microsoft.IdentityModel.Tokens.SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Email, email),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new Claim("tipo", "recuperacion_contrasena")
                }),
                Expires = DateTime.UtcNow.AddMinutes(minutosExpiracion),
                Issuer = _issuer,
                Audience = _audience,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
        public string GenerarToken(string email, int minutosExpiracion = 60)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_secretKey);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Email, email),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new Claim("tipo", "autenticacion")
                }),
                Expires = DateTime.UtcNow.AddMinutes(minutosExpiracion),
                Issuer = _issuer,
                Audience = _audience,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }


        public Resultado ValidarTokenRecuperacion(string token,string emailVal)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();

                if (!tokenHandler.CanReadToken(token))
                    return Resultado.error("Token con formato inválido");

                var key = Encoding.ASCII.GetBytes(_secretKey);

                var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _issuer,
                    ValidateAudience = true,
                    ValidAudience = _audience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;

                var emailClaim = jwtToken.Claims.FirstOrDefault(x =>
                    x.Type == "email" && x.Value == emailVal);
                var tipoClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == "tipo");

                if (emailClaim == null)
                    return Resultado.error("Token no contiene información de email");

                if (tipoClaim == null || tipoClaim.Value != "recuperacion_contrasena")
                    return Resultado.error("Token inválido para recuperación de contraseña");

                string email = emailClaim.Value;

                return Resultado.exito("Token válido", email); 
            }
            catch (SecurityTokenExpiredException)
            {
                return Resultado.error("El token ha expirado");
            }
            catch (SecurityTokenException stex)
            {
                return Resultado.error("Token de seguridad inválido: " + stex.Message);
            }
            catch (Exception ex)
            {
                return Resultado.error("Token inválido: " + ex.Message);
            }
        }
        public Resultado ValidarTokenAutenticacion(string token,string emailVal)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();

                if (!tokenHandler.CanReadToken(token))
                    return Resultado.error("Token con formato inválido");

                var key = Encoding.ASCII.GetBytes(_secretKey);

                var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _issuer,
                    ValidateAudience = true,
                    ValidAudience = _audience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;

                var emailClaim = jwtToken.Claims.FirstOrDefault(x =>
                    x.Type == "email" && x.Value == emailVal);
                var tipoClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == "tipo");

                if (emailClaim == null)
                    return Resultado.error("Token no contiene información de email");

                if (tipoClaim == null || tipoClaim.Value != "autenticacion")
                    return Resultado.error("Token inválido para autenticacion");

                string email = emailClaim.Value;

                return Resultado.exito("Token válido", email); 
            }
            catch (SecurityTokenExpiredException)
            {
                return Resultado.error("El token ha expirado");
            }
            catch (SecurityTokenException stex)
            {
                return Resultado.error("Token de seguridad inválido: " + stex.Message);
            }
            catch (Exception ex)
            {
                return Resultado.error("Token inválido: " + ex.Message);
            }
        }

        public string GenerarTokenUnico()
        {
            using (var rng = new RNGCryptoServiceProvider())
            {
                var tokenData = new byte[32];
                rng.GetBytes(tokenData);
                return Convert.ToBase64String(tokenData)
                    .Replace('+', '-')
                    .Replace('/', '_')
                    .Replace("=", "");
            }
        }
    }
}