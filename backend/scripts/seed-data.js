const { db } = require('../config/database');

async function seedData() {
  try {
    console.log('🌱 Iniciando seed de dados...');

    // Dados de exemplo para usuários
    const usuarios = [
      { nome: 'João Silva', email: 'joao@email.com', idade: 28 },
      { nome: 'Maria Santos', email: 'maria@email.com', idade: 32 },
      { nome: 'Pedro Costa', email: 'pedro@email.com', idade: 25 },
      { nome: 'Ana Oliveira', email: 'ana@email.com', idade: 29 },
      { nome: 'Carlos Ferreira', email: 'carlos@email.com', idade: 35 }
    ];

    // Dados de exemplo para temas
    const temas = [
      { nome: 'Programação', descricao: 'Desenvolvimento de software e linguagens de programação' },
      { nome: 'Design', descricao: 'Design gráfico, UX/UI e criatividade' },
      { nome: 'Marketing', descricao: 'Marketing digital, SEO e estratégias de negócio' },
      { nome: 'Ciência de Dados', descricao: 'Análise de dados, machine learning e IA' },
      { nome: 'Gestão de Projetos', descricao: 'Metodologias ágeis e gestão de equipes' }
    ];

    // Inserir usuários
    console.log('👥 Inserindo usuários...');
    const usuariosIds = [];
    const now = new Date().toISOString();
    for (const usuario of usuarios) {
      const result = await db.collection('usuarios').save({ ...usuario, createdAt: now });
      usuariosIds.push(result._id);
      console.log(`   ✅ Usuário criado: ${usuario.nome}`);
    }

    // Inserir temas
    console.log('🏷️ Inserindo temas...');
    const temasIds = [];
    for (const tema of temas) {
      const result = await db.collection('temas').save({ ...tema, createdAt: now });
      temasIds.push(result._id);
      console.log(`   ✅ Tema criado: ${tema.nome}`);
    }

    // Criar conexões de interesse
    console.log('🔗 Criando conexões de interesse...');
    const interesses = [
      { de: usuariosIds[0], para: temasIds[0] }, // João -> Programação
      { de: usuariosIds[0], para: temasIds[2] }, // João -> Marketing
      { de: usuariosIds[1], para: temasIds[1] }, // Maria -> Design
      { de: usuariosIds[1], para: temasIds[3] }, // Maria -> Ciência de Dados
      { de: usuariosIds[2], para: temasIds[0] }, // Pedro -> Programação
      { de: usuariosIds[2], para: temasIds[4] }, // Pedro -> Gestão de Projetos
      { de: usuariosIds[3], para: temasIds[1] }, // Ana -> Design
      { de: usuariosIds[3], para: temasIds[2] }, // Ana -> Marketing
      { de: usuariosIds[4], para: temasIds[3] }, // Carlos -> Ciência de Dados
      { de: usuariosIds[4], para: temasIds[4] }  // Carlos -> Gestão de Projetos
    ];

    for (const interesse of interesses) {
      await db.collection('interesse_em').save({
        _from: interesse.de,
        _to: interesse.para
      });
      console.log(`   ✅ Interesse criado: ${interesse.de} -> ${interesse.para}`);
    }

    // Criar conexões de conhecimento
    console.log('🤝 Criando conexões de conhecimento...');
    const conhecimentos = [
      { de: usuariosIds[0], para: usuariosIds[1] }, // João conhece Maria
      { de: usuariosIds[0], para: usuariosIds[2] }, // João conhece Pedro
      { de: usuariosIds[1], para: usuariosIds[3] }, // Maria conhece Ana
      { de: usuariosIds[2], para: usuariosIds[4] }, // Pedro conhece Carlos
      { de: usuariosIds[3], para: usuariosIds[0] }, // Ana conhece João
      { de: usuariosIds[4], para: usuariosIds[1] }  // Carlos conhece Maria
    ];

    for (const conhecimento of conhecimentos) {
      await db.collection('conhece').save({
        _from: conhecimento.de,
        _to: conhecimento.para
      });
      console.log(`   ✅ Conhecimento criado: ${conhecimento.de} -> ${conhecimento.para}`);
    }

    console.log('🎉 Seed de dados concluído com sucesso!');
    console.log(`📊 Resumo:`);
    console.log(`   • ${usuarios.length} usuários criados`);
    console.log(`   • ${temas.length} temas criados`);
    console.log(`   • ${interesses.length} interesses criados`);
    console.log(`   • ${conhecimentos.length} conhecimentos criados`);

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  seedData()
    .then(() => {
      console.log('✅ Script finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script falhou:', error);
      process.exit(1);
    });
}

module.exports = { seedData }; 