const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { initializeDatabase } = require('./config/database');

// Importar rotas
const usuariosRoutes = require('./routes/usuarios');
const temasRoutes = require('./routes/temas');
const conexoesRoutes = require('./routes/conexoes');
const grafoRoutes = require('./routes/grafo');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'GraphManager API está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rotas da API
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/temas', temasRoutes);
app.use('/api/conexoes', conexoesRoutes);
app.use('/api/grafo', grafoRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'GraphManager API',
    version: '1.0.0',
    endpoints: {
      usuarios: '/api/usuarios',
      temas: '/api/temas',
      conexoes: '/api/conexoes',
      grafo: '/api/grafo',
      health: '/health'
    }
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
    path: req.originalUrl
  });
});

// Inicializar servidor
async function startServer() {
  try {
    // Inicializar banco de dados
    await initializeDatabase();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 API disponível em: http://localhost:${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Iniciar servidor
startServer(); 