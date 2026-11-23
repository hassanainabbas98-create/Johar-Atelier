# ==============================================================================
# Johar Atelier Archival Sanctuary - Production ASP.NET Core Container
# Multi-stage build targeting .NET 9.0 Runtime
# ==============================================================================

# Stage 1: Build & Publish
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copy project files preserving directory structure for caching
COPY ["src/Johar.Data/Johar.Data.csproj", "src/Johar.Data/"]
COPY ["src/Johar.Services/Johar.Services.csproj", "src/Johar.Services/"]
COPY ["src/Johar.Api/Johar.Api.csproj", "src/Johar.Api/"]

# Restore dependencies
RUN dotnet restore "src/Johar.Api/Johar.Api.csproj"

# Copy the entire source tree
COPY src/ src/

# Publish Release build
WORKDIR "/app/src/Johar.Api"
RUN dotnet publish "Johar.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Production Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Standard cloud port binding (Render, Koyeb, Railway, Fly.io)
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=build /app/publish .

# Persist uploaded artworks volume
VOLUME /app/wwwroot/uploads

ENTRYPOINT ["dotnet", "Johar.Api.dll"]
