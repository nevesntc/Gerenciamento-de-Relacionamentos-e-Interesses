const { Database } = require('arangojs');

// Configuração igual ao backend
const config = {
  url: process.env.ARANGO_URL || 'http://localhost:8529',
  databaseName: process.env.ARANGO_DB || 'graphmanager',
  auth: {
    username: process.env.ARANGO_USERNAME || 'root',
    password: process.env.ARANGO_PASSWORD || '20022012'
  }
};

const db = new Database({
  url: config.url,
  auth: config.auth,
  databaseName: config.databaseName
});

async function fixCreatedAt(collectionName) {
  const now = new Date().toISOString();
  const cursor = await db.query(`
    FOR doc IN ${collectionName}
      FILTER !HAS(doc, 'createdAt')
      UPDATE doc WITH { createdAt: @now } IN ${collectionName}
      RETURN NEW
  `, { now });
  const updated = await cursor.all();
  console.log(`✅ ${updated.length} documentos atualizados em ${collectionName}`);
}

(async () => {
  try {
    await fixCreatedAt('usuarios');
    await fixCreatedAt('temas');
    console.log('🎉 Atualização concluída!');
    process.exit(0);
  } catch (err) {
    console.error('Erro ao atualizar:', err);
    process.exit(1);
  }
})(); 