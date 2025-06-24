const express = require('express');
const { db } = require('../config/database');
const router = express.Router();

// GET - Retornar dados do grafo para visualização
router.get('/', async (req, res) => {
  try {
    // Buscar todos os vertices (usuarios e temas)
    const [usuariosCursor, temasCursor] = await Promise.all([
      db.query(`
        FOR u IN usuarios
          RETURN u
      `),
      db.query(`
        FOR t IN temas
          RETURN t
      `)
    ]);
    
    const usuariosList = await usuariosCursor.all();
    const temasList = await temasCursor.all();
    
    // Buscar todas as edges (conexões)
    const [interesseCursor, conheceCursor] = await Promise.all([
      db.query(`
        FOR edge IN interesse_em
          RETURN edge
      `),
      db.query(`
        FOR edge IN conhece
          RETURN edge
      `)
    ]);
    
    const interesseList = await interesseCursor.all();
    const conheceList = await conheceCursor.all();
    
    // Formatar dados para visualização
    const nodes = [
      // Usuários como nodes
      ...usuariosList.map(usuario => ({
        id: usuario._id,
        label: usuario.nome,
        group: 'usuarios',
        title: `${usuario.nome}<br>Email: ${usuario.email}<br>Idade: ${usuario.idade}`,
        data: usuario
      })),
      // Temas como nodes
      ...temasList.map(tema => ({
        id: tema._id,
        label: tema.nome,
        group: 'temas',
        title: `${tema.nome}<br>Descrição: ${tema.descricao}`,
        data: tema
      }))
    ];
    
    const edges = [
      // Conexões de interesse
      ...interesseList.map(edge => ({
        id: edge._id,
        from: edge._from,
        to: edge._to,
        label: 'interesse_em',
        arrows: 'to',
        color: { color: '#ff6b6b', highlight: '#ff5252' },
        title: 'Interesse em'
      })),
      // Conexões de conhecimento
      ...conheceList.map(edge => ({
        id: edge._id,
        from: edge._from,
        to: edge._to,
        label: 'conhece',
        arrows: 'to',
        color: { color: '#4ecdc4', highlight: '#26a69a' },
        title: 'Conhece'
      }))
    ];
    
    // Estatísticas do grafo
    const stats = {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      usuarios: usuariosList.length,
      temas: temasList.length,
      interesse_em: interesseList.length,
      conhece: conheceList.length
    };
    
    res.json({
      success: true,
      data: {
        nodes,
        edges,
        stats
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dados do grafo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET - Buscar grafo filtrado por tipo de node
router.get('/filter/:type', async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['usuarios', 'temas'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo inválido. Use "usuarios" ou "temas"'
      });
    }
    
    // Buscar nodes do tipo especificado
    const nodesCursor = await db.query(`
      FOR node IN ${type}
        RETURN node
    `);
    const nodesList = await nodesCursor.all();
    
    // Buscar edges que envolvem esses nodes
    const nodeIds = nodesList.map(node => node._id);
    
    const [interesseEdges, conheceEdges] = await Promise.all([
      db.query(`
        FOR edge IN interesse_em
          FILTER edge._from IN @nodeIds OR edge._to IN @nodeIds
          RETURN edge
      `, { nodeIds }),
      db.query(`
        FOR edge IN conhece
          FILTER edge._from IN @nodeIds OR edge._to IN @nodeIds
          RETURN edge
      `, { nodeIds })
    ]);
    
    const interesseList = await interesseEdges.all();
    const conheceList = await conheceEdges.all();
    
    // Buscar nodes relacionados
    const relatedNodeIds = new Set();
    [...interesseList, ...conheceList].forEach(edge => {
      relatedNodeIds.add(edge._from);
      relatedNodeIds.add(edge._to);
    });
    
    const [relatedUsuarios, relatedTemas] = await Promise.all([
      db.query(`
        FOR usuario IN usuarios
          FILTER usuario._id IN @nodeIds
          RETURN usuario
      `, { nodeIds: Array.from(relatedNodeIds) }),
      db.query(`
        FOR tema IN temas
          FILTER tema._id IN @nodeIds
          RETURN tema
      `, { nodeIds: Array.from(relatedNodeIds) })
    ]);
    
    const relatedUsuariosList = await relatedUsuarios.all();
    const relatedTemasList = await relatedTemas.all();
    
    // Formatar dados
    const allNodes = [
      ...relatedUsuariosList.map(usuario => ({
        id: usuario._id,
        label: usuario.nome,
        group: 'usuarios',
        title: `${usuario.nome}<br>Email: ${usuario.email}<br>Idade: ${usuario.idade}`,
        data: usuario
      })),
      ...relatedTemasList.map(tema => ({
        id: tema._id,
        label: tema.nome,
        group: 'temas',
        title: `${tema.nome}<br>Descrição: ${tema.descricao}`,
        data: tema
      }))
    ];
    
    const allEdges = [
      ...interesseList.map(edge => ({
        id: edge._id,
        from: edge._from,
        to: edge._to,
        label: 'interesse_em',
        arrows: 'to',
        color: { color: '#ff6b6b', highlight: '#ff5252' },
        title: 'Interesse em'
      })),
      ...conheceList.map(edge => ({
        id: edge._id,
        from: edge._from,
        to: edge._to,
        label: 'conhece',
        arrows: 'to',
        color: { color: '#4ecdc4', highlight: '#26a69a' },
        title: 'Conhece'
      }))
    ];
    
    res.json({
      success: true,
      data: {
        nodes: allNodes,
        edges: allEdges,
        filter: type
      }
    });
  } catch (error) {
    console.error('Erro ao buscar grafo filtrado:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router; 