using System.Net;
using System.Text.Json;
using TaskManagement.API.Exceptions;

namespace TaskManagement.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ConflictException exception)
        {
            _logger.LogWarning(exception, exception.Message);

            await WriteResponseAsync(
                context,
                HttpStatusCode.Conflict,
                exception.Message);
        }
        catch (NotFoundException exception)
        {
            _logger.LogWarning(exception, exception.Message);

            await WriteResponseAsync(
                context,
                HttpStatusCode.NotFound,
                exception.Message);
        }
        catch (UnauthorizedException exception)
        {
            _logger.LogWarning(exception, exception.Message);

            await WriteResponseAsync(
                context,
                HttpStatusCode.Unauthorized,
                exception.Message);
        }
        catch (ConfigurationException exception)
        {
            _logger.LogError(exception, exception.Message);

            await WriteResponseAsync(
                context,
                HttpStatusCode.InternalServerError,
                "Application configuration is invalid.");
        }
        catch (InvalidOperationException exception)
        {
            _logger.LogWarning(exception, exception.Message);

            await WriteResponseAsync(
                context,
                HttpStatusCode.BadRequest,
                exception.Message);
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "An unexpected error occurred.");

            await WriteResponseAsync(
                context,
                HttpStatusCode.InternalServerError,
                "An unexpected error occurred.");
        }
    }

    private static async Task WriteResponseAsync(
        HttpContext context,
        HttpStatusCode statusCode,
        string message)
    {
        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/json";

        var response = new
        {
            statusCode = (int)statusCode,
            message
        };

        await context.Response.WriteAsync(
            JsonSerializer.Serialize(response));
    }
}