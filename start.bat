@echo off
echo 🚀 Iniciando GraphManager...

REM Verificar se o Docker está instalado
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker não está instalado. Por favor, instale o Docker primeiro.
    pause
    exit /b 1
)

REM Verificar se o Docker Compose está instalado
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro.
    pause
    exit /b 1
)

echo ✅ Docker e Docker Compose encontrados

REM Parar containers existentes
echo 🛑 Parando containers existentes...
docker-compose down

REM Construir e iniciar containers
echo 🔨 Construindo e iniciando containers...
docker-compose up --build -d

REM Aguardar os serviços iniciarem
echo ⏳ Aguardando serviços iniciarem...
timeout /t 30 /nobreak >nul

REM Verificar status dos containers
echo 📊 Status dos containers:
docker-compose ps

echo.
echo 🎉 GraphManager iniciado com sucesso!
echo.
echo 📱 Acesse as aplicações em:
echo    • Frontend: http://localhost:5173
echo    • Backend API: http://localhost:3001
echo    • ArangoDB Web UI: http://localhost:8529
echo.
echo 🔧 Para parar os serviços, execute: docker-compose down
echo 📝 Para ver os logs, execute: docker-compose logs -f
echo.
pause 