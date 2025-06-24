# 🚀 GraphManager - Início Rápido

## Opção 1: Docker (Recomendado)

### Pré-requisitos
- Docker
- Docker Compose

### Passos
1. **Clone o repositório**
```bash
git clone <repository-url>
cd graphmanager
```

2. **Execute o script de inicialização**
```bash
# Windows
start.bat

# Linux/Mac
chmod +x start.sh
./start.sh
```

3. **Acesse as aplicações**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- ArangoDB Web UI: http://localhost:8529

## Opção 2: Desenvolvimento Local

### Pré-requisitos
- Node.js 16+
- ArangoDB instalado e rodando

### Passos
1. **Instale as dependências**
```bash
npm run install:all
```

2. **Configure o ArangoDB**
- Inicie o ArangoDB
- **Credenciais**: root / 20022012
- Crie um banco chamado `graphmanager`
- Ou copie `backend/env.example` para `backend/.env`

3. **Inicie o backend**
```bash
cd backend
npm run dev
```

4. **Inicie o frontend**
```bash
cd frontend
npm run dev
```

5. **Popule com dados de exemplo (opcional)**
```bash
cd backend
npm run seed
```

## 🎯 Primeiros Passos

1. **Acesse o Dashboard** em http://localhost:5173
2. **Crie alguns usuários** na aba "Usuários"
3. **Crie alguns temas** na aba "Temas"
4. **Crie conexões** na aba "Conexões"
5. **Visualize o grafo** na aba "Visualizar Grafo"

## 📊 Funcionalidades

- ✅ **Dashboard** com estatísticas em tempo real
- ✅ **CRUD completo** de usuários e temas
- ✅ **Gerenciamento de conexões** entre nodes
- ✅ **Visualização interativa** do grafo
- ✅ **Filtros e controles** de visibilidade
- ✅ **Interface responsiva** com modo escuro
- ✅ **API REST completa** com validação

## 🔧 Comandos Úteis

```bash
# Parar todos os serviços
docker-compose down

# Ver logs
docker-compose logs -f

# Reconstruir containers
docker-compose up --build

# Acessar container do backend
docker exec -it graphmanager-backend sh

# Executar seed de dados
docker exec -it graphmanager-backend npm run seed
```

## 🆘 Solução de Problemas

### Erro de conexão com ArangoDB
- Verifique se o ArangoDB está rodando
- Confirme as credenciais: **root** / **20022012**
- Confirme a configuração em `backend/config/database.js`

### Frontend não carrega
- Verifique se o backend está rodando na porta 3001
- Confirme a URL da API em `frontend/src/services/api.js`

### Erro de CORS
- Verifique se o backend está configurado para aceitar requisições do frontend
- Confirme as configurações CORS em `backend/server.js`

## 🔐 Credenciais do ArangoDB

- **Usuário**: `root`
- **Senha**: `20022012`
- **URL**: `http://localhost:8529`
- **Banco**: `graphmanager`

## 📝 Próximos Níveis (Escalável)

Adicionar autenticação (JWT)

Filtrar grafos (ex.: mostrar só conexões de um tema específico)

Exportar dados do grafo

Dashboard com estatísticas (número de conexões, usuários ativos, etc.)

## 🏗️ Resumo do Stack:

Frontend: React + TailwindCSS + vis-network (ou Cytoscape.js)

Backend: Node.js + Express + arangojs

Banco: ArangoDB

Deploy: Docker, Railway, Vercel (frontend), Render (backend)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes. 