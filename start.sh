#!/bin/bash

echo "🚀 Iniciando GraphManager..."

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

# Verificar se o Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

echo "✅ Docker e Docker Compose encontrados"

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down

# Construir e iniciar containers
echo "🔨 Construindo e iniciando containers..."
docker-compose up --build -d

# Aguardar os serviços iniciarem
echo "⏳ Aguardando serviços iniciarem..."
sleep 30

# Verificar status dos containers
echo "📊 Status dos containers:"
docker-compose ps

echo ""
echo "🎉 GraphManager iniciado com sucesso!"
echo ""
echo "📱 Acesse as aplicações em:"
echo "   • Frontend: http://localhost:5173"
echo "   • Backend API: http://localhost:3001"
echo "   • ArangoDB Web UI: http://localhost:8529"
echo ""
echo "🔧 Para parar os serviços, execute: docker-compose down"
echo "📝 Para ver os logs, execute: docker-compose logs -f" 