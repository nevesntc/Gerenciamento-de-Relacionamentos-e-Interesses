const Joi = require('joi');

// Schemas de validação
const schemas = {
  usuario: Joi.object({
    nome: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    idade: Joi.number().integer().min(1).max(120).required()
  }),

  tema: Joi.object({
    nome: Joi.string().min(2).max(100).required(),
    descricao: Joi.string().min(5).max(500).required()
  }),

  conexao: Joi.object({
    tipo: Joi.string().valid('interesse_em', 'conhece').required(),
    de: Joi.string().required(),
    para: Joi.string().required()
  })
};

// Middleware de validação genérico
function validate(schemaName) {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return res.status(400).json({ error: 'Schema de validação não encontrado' });
    }

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map(detail => detail.message)
      });
    }

    req.validatedData = value;
    next();
  };
}

module.exports = {
  validate,
  schemas
}; 