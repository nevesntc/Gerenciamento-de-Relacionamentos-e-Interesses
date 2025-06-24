const express = require('express');
const { db } = require('../config/database');
const { validate } = require('../middleware/validation');
const { DateTime } = require('luxon');
const router = express.Router();

const getSaoPauloISOString = () => {
  return DateTime.now().setZone('America/Sao_Paulo').toISO();
};

// GET - Listar todos os temas
router.get('/', async (req, res) => {
  try {
    const cursor = await db.query(`
      FOR t IN temas
        RETURN t
    `);
    const temas = await cursor.all();
    
    res.json({
      success: true,
      data: temas,
      count: temas.length
    });
  } catch (error) {
    console.error('Erro ao listar temas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET - Buscar tema por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const cursor = await db.query(`
      FOR t IN temas
        FILTER t._key == @id
        RETURN t
    `, { id });
    
    const tema = await cursor.next();
    
    if (!tema) {
      return res.status(404).json({
        success: false,
        error: 'Tema não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: tema
    });
  } catch (error) {
    console.error('Erro ao buscar tema:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// POST - Criar novo tema
router.post('/', validate('tema'), async (req, res) => {
  try {
    const temaData = {
      ...req.validatedData,
      createdAt: getSaoPauloISOString()
    };
    
    // Verificar se nome já existe
    const cursor = await db.query(`
      FOR t IN temas
        FILTER t.nome == @nome
        RETURN t
    `, { nome: temaData.nome });
    
    const existingTema = await cursor.next();
    if (existingTema) {
      return res.status(400).json({
        success: false,
        error: 'Tema com este nome já existe'
      });
    }
    
    // Inserir novo tema
    const insertCursor = await db.query(`
      INSERT @tema INTO temas
      RETURN NEW
    `, { tema: temaData });
    
    const result = await insertCursor.next();
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'Tema criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar tema:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// PUT - Atualizar tema
router.put('/:id', validate('tema'), async (req, res) => {
  try {
    const { id } = req.params;
    const temaData = req.validatedData;
    
    // Verificar se tema existe
    const checkCursor = await db.query(`
      FOR t IN temas
        FILTER t._key == @id
        RETURN t
    `, { id });
    
    const existingTema = await checkCursor.next();
    if (!existingTema) {
      return res.status(404).json({
        success: false,
        error: 'Tema não encontrado'
      });
    }
    
    // Verificar se nome já existe (exceto para o tema atual)
    const cursor = await db.query(`
      FOR t IN temas
        FILTER t.nome == @nome AND t._key != @key
        RETURN t
    `, { nome: temaData.nome, key: id });
    
    const duplicateName = await cursor.next();
    if (duplicateName) {
      return res.status(400).json({
        success: false,
        error: 'Tema com este nome já existe'
      });
    }
    
    // Atualizar tema, mantendo createdAt se já existir
    const updateCursor = await db.query(`
      FOR t IN temas
        FILTER t._key == @id
        UPDATE t WITH MERGE(@tema, { createdAt: HAS(t, 'createdAt') ? t.createdAt : @now }) IN temas
        RETURN NEW
    `, { id, tema: temaData, now: getSaoPauloISOString() });
    
    const result = await updateCursor.next();
    
    res.json({
      success: true,
      data: result,
      message: 'Tema atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar tema:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// DELETE - Remover tema
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se tema existe
    const checkCursor = await db.query(`
      FOR t IN temas
        FILTER t._key == @id
        RETURN t
    `, { id });
    
    const existingTema = await checkCursor.next();
    if (!existingTema) {
      return res.status(404).json({
        success: false,
        error: 'Tema não encontrado'
      });
    }
    
    // Remover todas as conexões do tema
    await db.query(`
      FOR edge IN interesse_em
        FILTER edge._to == @temaId
        REMOVE edge IN interesse_em
    `, { temaId: `temas/${id}` });
    
    // Remover o tema
    await db.query(`
      FOR t IN temas
        FILTER t._key == @id
        REMOVE t IN temas
    `, { id });
    
    res.json({
      success: true,
      message: 'Tema removido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover tema:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router; 