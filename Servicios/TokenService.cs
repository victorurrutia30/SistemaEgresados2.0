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
using System.Runtime.Caching;

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
        public string GenerarTokenRegistroEmpresa(string email, string nombreEmpresa = null, int horasValidez = 48)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_secretKey);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Email, email),
                    new Claim("nombreEmpresa", nombreEmpresa ?? ""),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new Claim("tipo", "registro_empresa"),
                    new Claim("usado", "false"),
                    new Claim("iat", DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString())
                }),
                Expires = DateTime.UtcNow.AddHours(horasValidez),
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
        public Resultado ValidarTokenRegistroEmpresa(string token)
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

                var tipoClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == "tipo");
                if (tipoClaim == null || tipoClaim.Value != "registro_empresa")
                    return Resultado.error("Token inválido para registro de empresa");

                var usadoClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == "usado");
                if (usadoClaim != null && usadoClaim.Value == "true")
                    return Resultado.error("Este token ya ha sido utilizado");

                var emailClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == "email");
                var nombreEmpresaClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == "nombreEmpresa");
                var jtiClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == JwtRegisteredClaimNames.Jti);

                if (emailClaim == null)
                    return Resultado.error("Token no contiene información de email");

                return Resultado.exito("Token válido", new
                {
                    Email = emailClaim.Value,
                    NombreEmpresa = nombreEmpresaClaim?.Value,
                    TokenId = jtiClaim?.Value
                });
            }
            catch (SecurityTokenExpiredException)
            {
                return Resultado.error("El token ha expirado. Debe solicitar un nuevo enlace de registro.");
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
        public Resultado VerificarYMarcarTokenUsado(string token, string ipCliente)
        {
            try
            {
                var validacion = ValidarTokenRegistroEmpresa(token);
                if (!validacion.Exito)
                    return validacion;

                var tokenHandler = new JwtSecurityTokenHandler();
                var jwtToken = tokenHandler.ReadJwtToken(token);
                var jtiClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == JwtRegisteredClaimNames.Jti);

                if (jtiClaim == null)
                    return Resultado.error("Token no contiene identificador único");

                string tokenId = jtiClaim.Value;
                MemoryCache cache = MemoryCache.Default;

                string cacheKeyUsado = $"token_usado_{tokenId}";
                if (cache.Contains(cacheKeyUsado))
                {
                    return Resultado.error("Este token ya ha sido utilizado. El registro ya fue completado.");
                }

                string cacheKeyIP = $"token_ip_{tokenId}";
                string ipAlmacenada = cache.Get(cacheKeyIP) as string;

                if (ipAlmacenada != null && ipAlmacenada != ipCliente)
                {
                    cache.Set(cacheKeyUsado, true, DateTimeOffset.UtcNow.AddDays(7));
                    return Resultado.error("Sesión activa detectada desde otra ubicación. Por seguridad, el token ha sido bloqueado.");
                }

                if (ipAlmacenada == null)
                {
                    var expiracion = jwtToken.ValidTo;
                    cache.Set(cacheKeyIP, ipCliente, new DateTimeOffset(expiracion));
                }

                return validacion;
            }
            catch (Exception ex)
            {
                return Resultado.error("Error al verificar token: " + ex.Message);
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