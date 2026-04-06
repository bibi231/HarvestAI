# HarvestAI Startup Script — Starts both Client and Server concurrently

Write-Host "🚀 Launching HarvestAI Development Environment..." -ForegroundColor Yellow

# Function to start a process in a new window
function Start-Dev($dir, $name, $color) {
    Write-Host "Starting $name in $dir..." -ForegroundColor $color
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $dir; npm install; npm run dev"
}

# Start Server (Port 4000)
Start-Dev "server" "Express API" "Cyan"

# Start Client (Port 5173)
Start-Dev "client" "Vite Frontend" "Green"

Write-Host "✅ Both processes are starting in separate windows." -ForegroundColor Green
Write-Host "- API: http://localhost:4000"
Write-Host "- App: http://localhost:5173"
