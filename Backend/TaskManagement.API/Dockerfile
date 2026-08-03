# Base image for runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

# Base image for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["TaskManagement.API.csproj", "./"]
RUN dotnet restore "./TaskManagement.API.csproj"
COPY . .
RUN dotnet build "TaskManagement.API.csproj" -c Release -o /app/build

# Publish the app
FROM build AS publish
RUN dotnet publish "TaskManagement.API.csproj" -c Release -o /app/publish

# Final image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TaskManagement.API.dll"]
