const express = require('express');
const { db } = require('../config/database');
const { validate } = require('../middleware/validation');
const { DateTime } = require('luxon');
const router = express.Router();

const getSaoPauloISOString = () => {
  return DateTime.now().setZone('America/Sao_Paulo').toISO();
};

// GET - Listar todos os usuários
router.get('/', async (req, res) => {
  try {
    const cursor = await db.query(`
      FOR u IN usuarios
        RETURN u
    `);
    const usuarios = await cursor.all();
    
    res.json({
      success: true,
      data: usuarios,
      count: usuarios.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error?.message || error : undefined,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    });
  }
});

// GET - Buscar usuário por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const cursor = await db.query(`
      FOR u IN usuarios
        FILTER u._key == @id
        RETURN u
    `, { id });
    
    const usuario = await cursor.next();
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error?.message || error : undefined,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    });
  }
});

// POST - Criar novo usuário
router.post('/', validate('usuario'), async (req, res) => {
  try {
    const usuarioData = {
      ...req.validatedData,
      createdAt: getSaoPauloISOString()
    };
    
    // Verificar se email já existe
    const cursor = await db.query(`
      FOR u IN usuarios
        FILTER u.email == @email
        RETURN u
    `, { email: usuarioData.email });
    
    const existingUser = await cursor.next();
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email já cadastrado'
      });
    }
    
    // Inserir novo usuário
    const insertCursor = await db.query(`
      INSERT @usuario INTO usuarios
      RETURN NEW
    `, { usuario: usuarioData });
    
    const result = await insertCursor.next();
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'Usuário criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error, error?.stack);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error?.message || error : undefined,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    });
  }
});

// PUT - Atualizar usuário
router.put('/:id', validate('usuario'), async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioData = req.validatedData;
    
    // Verificar se usuário existe
    const checkCursor = await db.query(`
      FOR u IN usuarios
        FILTER u._key == @id
        RETURN u
    `, { id });
    
    const existingUser = await checkCursor.next();
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }
    
    // Verificar se email já existe (exceto para o usuário atual)
    const cursor = await db.query(`
      FOR u IN usuarios
        FILTER u.email == @email AND u._key != @key
        RETURN u
    `, { email: usuarioData.email, key: id });
    
    const duplicateEmail = await cursor.next();
    if (duplicateEmail) {
      return res.status(400).json({
        success: false,
        error: 'Email já cadastrado por outro usuário'
      });
    }
    
    // Atualizar usuário, mantendo createdAt se já existir
    const updateCursor = await db.query(`
      FOR u IN usuarios
        FILTER u._key == @id
        UPDATE u WITH MERGE(@usuario, { createdAt: HAS(u, 'createdAt') ? u.createdAt : @now }) IN usuarios
        RETURN NEW
    `, { id, usuario: usuarioData, now: getSaoPauloISOString() });
    
    const result = await updateCursor.next();
    
    res.json({
      success: true,
      data: result,
      message: 'Usuário atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error, error?.stack);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error?.message || error : undefined,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    });
  }
});

// DELETE - Remover usuário
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se usuário existe
    const checkCursor = await db.query(`
      FOR u IN usuarios
        FILTER u._key == @id
        RETURN u
    `, { id });
    
    const existingUser = await checkCursor.next();
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }
    
    // Remover todas as conexões do usuário
    await db.query(`
      FOR edge IN interesse_em
        FILTER edge._from == @userId OR edge._to == @userId
        REMOVE edge IN interesse_em
    `, { userId: `usuarios/${id}` });
    
    await db.query(`
      FOR edge IN conhece
        FILTER edge._from == @userId OR edge._to == @userId
        REMOVE edge IN conhece
    `, { userId: `usuarios/${id}` });
    
    // Remover o usuário
    await db.query(`
      FOR u IN usuarios
        FILTER u._key == @id
        REMOVE u IN usuarios
    `, { id });
    
    res.json({
      success: true,
      message: 'Usuário removido com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error?.message || error : undefined,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    });
  }
});

module.exports = router; 