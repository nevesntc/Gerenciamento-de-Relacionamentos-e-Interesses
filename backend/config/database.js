const { Database } = require('arangojs');

// Configuração do ArangoDB
const config = {
  url: process.env.ARANGO_URL || 'http://localhost:8529',
  databaseName: process.env.ARANGO_DB || 'graphmanager',
  auth: {
    username: process.env.ARANGO_USERNAME || 'root',
    password: process.env.ARANGO_PASSWORD || '20022012'
  }
};

// Criar instância do banco (forma correta para arangojs >=7)
const db = new Database({
  url: config.url,
  auth: config.auth,
  databaseName: config.databaseName
});

// Função para inicializar o banco de dados
async function initializeDatabase() {
  try {
    console.log('🔌 Conectando ao ArangoDB...');
    
    // Primeiro, conectar ao banco de dados do sistema para criar nosso banco
    const systemDb = new Database({
      url: config.url,
      auth: config.auth,
      databaseName: '_system'
    });
    
    // Verificar se o banco existe, se não, criar
    const databases = await systemDb.listDatabases();
    if (!databases.includes(config.databaseName)) {
      console.log(`📦 Criando banco de dados: ${config.databaseName}`);
      await systemDb.createDatabase(config.databaseName);
    }
    
    // Agora conectar ao nosso banco de dados
    console.log(`🔗 Conectando ao banco: ${config.databaseName}`);
    
    // Criar collections se não existirem
    await createCollections();
    
    // Criar grafo se não existir
    await createGraph();
    
    console.log('✅ Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    throw error;
  }
}

// Função para criar as collections
async function createCollections() {
  const collections = [
    { name: 'usuarios', type: 'document' },
    { name: 'temas', type: 'document' },
    { name: 'interesse_em', type: 'edge' },
    { name: 'conhece', type: 'edge' }
  ];

  for (const collection of collections) {
    try {
      const exists = await db.collection(collection.name).exists();
      if (!exists) {
        console.log(`📁 Criando collection: ${collection.name}`);
        await db.createCollection(collection.name, { type: collection.type });
      }
    } catch (error) {
      console.error(`Erro ao criar collection ${collection.name}:`, error);
    }
  }
}

// Função para criar o grafo
async function createGraph() {
  try {
    const graphName = 'graph_usuarios';
    const exists = await db.graph(graphName).exists();
    
    if (!exists) {
      console.log(`🕸️ Criando grafo: ${graphName}`);
      
      const graph = db.graph(graphName);
      await graph.create({
        edgeDefinitions: [
          {
            collection: 'interesse_em',
            from: ['usuarios'],
            to: ['temas']
          },
          {
            collection: 'conhece',
            from: ['usuarios'],
            to: ['usuarios']
          }
        ]
      });
      
      console.log(`✅ Grafo ${graphName} criado com sucesso!`);
    }
  } catch (error) {
    console.error('Erro ao criar grafo:', error);
  }
}

module.exports = {
  db,
  initializeDatabase,
  config
}; 