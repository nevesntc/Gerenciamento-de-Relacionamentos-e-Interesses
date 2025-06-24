const express = require('express');
const { db } = require('../config/database');
const { validate } = require('../middleware/validation');
const router = express.Router();

// GET - Listar todas as conexões
router.get('/', async (req, res) => {
  try {
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
    
    const interesse = await interesseCursor.all();
    const conhece = await conheceCursor.all();
    
    res.json({
      success: true,
      data: {
        interesse_em: interesse,
        conhece: conhece
      },
      count: {
        interesse_em: interesse.length,
        conhece: conhece.length,
        total: interesse.length + conhece.length
      }
    });
  } catch (error) {
    console.error('Erro ao listar conexões:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// POST - Criar nova conexão
router.post('/', validate('conexao'), async (req, res) => {
  try {
    const { tipo, de, para } = req.validatedData;
    
    // Verificar se os nodes existem
    const [deCollection, deId] = de.split('/');
    const [paraCollection, paraId] = para.split('/');
    
    const [deCursor, paraCursor] = await Promise.all([
      db.query(`
        FOR node IN ${deCollection}
          FILTER node._key == @id
          RETURN node
      `, { id: deId }),
      db.query(`
        FOR node IN ${paraCollection}
          FILTER node._key == @id
          RETURN node
      `, { id: paraId })
    ]);
    
    const [deNode, paraNode] = await Promise.all([
      deCursor.next(),
      paraCursor.next()
    ]);
    
    if (!deNode || !paraNode) {
      return res.status(400).json({
        success: false,
        error: 'Um ou ambos os nodes não existem'
      });
    }
    
    // Verificar se a conexão já existe
    const checkCursor = await db.query(`
      FOR edge IN ${tipo}
        FILTER edge._from == @de AND edge._to == @para
        RETURN edge
    `, { de, para });
    
    const existingEdge = await checkCursor.next();
    if (existingEdge) {
      return res.status(400).json({
        success: false,
        error: 'Esta conexão já existe'
      });
    }
    
    // Criar a conexão
    const insertCursor = await db.query(`
      INSERT { _from: @de, _to: @para } INTO ${tipo}
      RETURN NEW
    `, { de, para });
    
    const result = await insertCursor.next();
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'Conexão criada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar conexão:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// DELETE - Remover conexão
router.delete('/:tipo/:id', async (req, res) => {
  try {
    const { tipo, id } = req.params;
    
    if (!['interesse_em', 'conhece'].includes(tipo)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de conexão inválido'
      });
    }
    
    // Verificar se a conexão existe
    const checkCursor = await db.query(`
      FOR edge IN ${tipo}
        FILTER edge._key == @id
        RETURN edge
    `, { id });
    
    const existingEdge = await checkCursor.next();
    if (!existingEdge) {
      return res.status(404).json({
        success: false,
        error: 'Conexão não encontrada'
      });
    }
    
    // Remover a conexão
    await db.query(`
      FOR edge IN ${tipo}
        FILTER edge._key == @id
        REMOVE edge IN ${tipo}
    `, { id });
    
    res.json({
      success: true,
      message: 'Conexão removida com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover conexão:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET - Buscar conexões de um node específico
router.get('/node/:collection/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;
    const nodeId = `${collection}/${id}`;
    
    // Buscar conexões onde o node é origem ou destino
    const [interesseFrom, interesseTo, conheceFrom, conheceTo] = await Promise.all([
      db.query(`
        FOR edge IN interesse_em
          FILTER edge._from == @nodeId
          RETURN edge
      `, { nodeId }),
      db.query(`
        FOR edge IN interesse_em
          FILTER edge._to == @nodeId
          RETURN edge
      `, { nodeId }),
      db.query(`
        FOR edge IN conhece
          FILTER edge._from == @nodeId
          RETURN edge
      `, { nodeId }),
      db.query(`
        FOR edge IN conhece
          FILTER edge._to == @nodeId
          RETURN edge
      `, { nodeId })
    ]);
    
    const interesseFromEdges = await interesseFrom.all();
    const interesseToEdges = await interesseTo.all();
    const conheceFromEdges = await conheceFrom.all();
    const conheceToEdges = await conheceTo.all();
    
    res.json({
      success: true,
      data: {
        interesse_em: {
          from: interesseFromEdges,
          to: interesseToEdges
        },
        conhece: {
          from: conheceFromEdges,
          to: conheceToEdges
        }
      },
      count: {
        interesse_em: interesseFromEdges.length + interesseToEdges.length,
        conhece: conheceFromEdges.length + conheceToEdges.length
      }
    });
  } catch (error) {
    console.error('Erro ao buscar conexões do node:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router; 