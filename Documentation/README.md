# task-management-system

A web-based personal task management system built with .NET 8 Web API, Angular, PostgreSQL, Entity Framework Core, and JWT authentication.

## Development secrets

Run these commands inside `Backend/TaskManagement.API`:

```bash
dotnet user-secrets set "ConnectionStrings:PostgreSQLConnection" "..."
dotnet user-secrets set "ConnectionStrings:OracleConnection" "..."
dotnet user-secrets set "Jwt:SecretKey" "..."
```
