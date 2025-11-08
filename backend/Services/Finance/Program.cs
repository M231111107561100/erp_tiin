using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Finance.Data; // FinanceDbContext namespace
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ===== Configuration (env + appsettings) =====
var config = builder.Configuration;

// CORS (liste séparée par des virgules, depuis .env -> CORS_ALLOWED_ORIGINS)
var allowedOrigins = (config["CORS_ALLOWED_ORIGINS"] ?? "").Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

// ===== DbContext (PostgreSQL) =====
var cs = config.GetConnectionString("Default")
         ?? $"Host={Environment.GetEnvironmentVariable("POSTGRES_HOST")};Port={Environment.GetEnvironmentVariable("POSTGRES_PORT")};Database={Environment.GetEnvironmentVariable("POSTGRES_DB")};Username={Environment.GetEnvironmentVariable("POSTGRES_USER")};Password={Environment.GetEnvironmentVariable("POSTGRES_PASSWORD")}";
builder.Services.AddDbContext<FinanceDbContext>(opt =>
    opt.UseNpgsql(cs));

// ===== Auth (JWT Keycloak) =====
var issuer = config["Jwt:Issuer"] ?? Environment.GetEnvironmentVariable("JWT_ISSUER");
var audience = config["Jwt:Audience"] ?? Environment.GetEnvironmentVariable("JWT_AUDIENCE");
var jwksUri = config["Jwt:JwksUri"] ?? Environment.GetEnvironmentVariable("JWT_JWKS_URI");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = issuer;      // ex: http://keycloak:8080/realms/erp_tiin
        options.RequireHttpsMetadata = false;
        options.TokenValidationParameters = new()
        {
            ValidateIssuer = true,
            ValidIssuer = issuer,
            ValidateAudience = true,
            ValidAudience = audience,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true
        };
        options.MetadataAddress = $"{issuer}/.well-known/openid-configuration";
    });

builder.Services.AddAuthorization();

// ===== OpenTelemetry =====
var serviceName = config["OTEL_SERVICE_NAME"] ?? "FinanceService";
var otlpEndpoint = config["OTEL_EXPORTER_OTLP_ENDPOINT"] ?? "http://otel-collector:4317";

builder.Services.AddOpenTelemetry()
    .ConfigureResource(r => r.AddService(serviceName).AddAttributes(new[]
    {
        new KeyValuePair<string, object>("service.namespace", "erp_tiin")
    }))
    .WithTracing(t => t
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddEntityFrameworkCoreInstrumentation()
        .AddOtlpExporter(o => o.Endpoint = new Uri(otlpEndpoint)))
    .WithMetrics(m => m
        .AddAspNetCoreInstrumentation()
        .AddRuntimeInstrumentation()
        .AddHttpClientInstrumentation()
        .AddProcessInstrumentation()
        .AddOtlpExporter(o => o.Endpoint = new Uri(otlpEndpoint)));

builder.Services.AddControllers();

// ===== Swagger (dev) =====
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "ERP Tiin Finance API", Version = "v1" });
    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Bearer via Keycloak"
    };
    c.AddSecurityDefinition("bearerAuth", securityScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { securityScheme, Array.Empty<string>() }
    });
});

// ===== CORS =====
builder.Services.AddCors(options =>
{
    options.AddPolicy("default", policy =>
    {
        if (allowedOrigins.Length > 0)
            policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod().AllowCredentials();
        else
            policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

// ===== Sécurité headers basiques (complément Traefik) =====
app.Use(async (ctx, next) =>
{
    ctx.Response.Headers["X-Content-Type-Options"] = "nosniff";
    ctx.Response.Headers["X-Frame-Options"] = "DENY";
    ctx.Response.Headers["X-XSS-Protection"] = "1; mode=block";
    await next();
});

// ===== HSTS (désactivé si HSTS_ENABLED=false) =====
var hstsEnabled = (config["HSTS_ENABLED"] ?? "false").Equals("true", StringComparison.OrdinalIgnoreCase);
if (hstsEnabled) app.UseHsts();

// ===== Pipeline =====
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("default");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// ===== Endpoints de santé =====
app.MapGet("/health", () => Results.Ok(new { status = "ok" }))
   .AllowAnonymous();

app.MapGet("/ready", async (FinanceDbContext db) =>
{
    try
    {
        await db.Database.ExecuteSqlRawAsync("SELECT 1;");
        return Results.Ok(new { status = "ready" });
    }
    catch
    {
        return Results.StatusCode(503);
    }
}).AllowAnonymous();

// ===== Auto-migration =====
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<FinanceDbContext>();
    db.Database.Migrate();
}

app.Run();
