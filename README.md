# GraphManager - CRUD com ArangoDB e Visualização de Grafos

Um projeto fullstack completo que utiliza Node.js (Express) no backend e React (Vite) no frontend, com o banco de dados ArangoDB para gerenciamento e visualização de grafos.

## 🚀 Funcionalidades

- **Backend**: API REST completa com ArangoDB
- **Frontend**: Interface moderna com React + Vite
- **Banco de Dados**: ArangoDB com grafos automáticos
- **Visualização**: Grafo interativo com vis-network
- **Design**: Interface responsiva com TailwindCSS

## 📦 Pré-requisitos

- Node.js (versão 16 ou superior)
- ArangoDB (instalado e rodando na porta 8529)
- npm ou yarn

## 🛠️ Instalação

### Opção 1: Docker (Recomendado)

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

### Opção 2: Desenvolvimento Local

1. **Clone o repositório**
```bash
git clone <repository-url>
cd graphmanager
```

2. **Configure o ArangoDB**
- Certifique-se de que o ArangoDB está rodando em `http://localhost:8529`
- Use as credenciais: **root** / **20022012**
- Crie um banco de dados chamado `graphmanager`
- Ou copie o arquivo `backend/env.example` para `backend/.env` e ajuste as configurações

3. **Instale as dependências**
```bash
npm run install:all
```

4. **Inicie o projeto**
```bash
# Desenvolvimento
npm run dev

# Ou individualmente:
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

5. **Popule com dados de exemplo (opcional)**
```bash
cd backend && npm run seed
```

## 🏗️ Estrutura do Projeto

```
graphmanager/
├── backend/           # API Node.js + Express
├── frontend/          # React + Vite
├── package.json       # Scripts principais
└── README.md
```

## 📊 Modelo de Dados

### Collections (Documentos)
- **usuarios**: `{ _key, nome, email, idade }`
- **temas**: `{ _key, nome, descricao }`

### Edges (Conexões)
- **interesse_em**: usuário → tema
- **conhece**: usuário → usuário

### Grafo
- **Nome**: `graph_usuarios`
- **Vertices**: usuarios, temas
- **Edges**: interesse_em, conhece

## 🔧 API Endpoints

### Usuários
- `POST /usuarios` - Criar usuário
- `GET /usuarios` - Listar usuários
- `PUT /usuarios/:id` - Atualizar usuário
- `DELETE /usuarios/:id` - Remover usuário

### Temas
- `POST /temas` - Criar tema
- `GET /temas` - Listar temas
- `PUT /temas/:id` - Atualizar tema
- `DELETE /temas/:id` - Remover tema

### Conexões
- `POST /conexoes` - Criar conexão entre nodes

### Grafo
- `GET /grafo` - Retorna dados do grafo para visualização

## 🎨 Interface

- **Dashboard**: Visão geral com cards de usuários e temas
- **Usuários**: CRUD completo de usuários
- **Temas**: CRUD completo de temas
- **Conexões**: Criar relações entre nodes
- **Grafo**: Visualização interativa do grafo

## 🔐 Configuração do ArangoDB

### Credenciais Padrão
- **Usuário**: `root`
- **Senha**: `20022012`
- **URL**: `http://localhost:8529`
- **Banco**: `graphmanager`

### Configuração Manual
1. Acesse o ArangoDB Web UI: http://localhost:8529
2. Faça login com as credenciais acima
3. Crie um novo banco de dados chamado `graphmanager`
4. O sistema criará automaticamente as collections e o grafo

## 🐳 Docker (Opcional)

Para usar com Docker:

```bash
docker-compose up -d
```

## 📝 Licença

MIT 