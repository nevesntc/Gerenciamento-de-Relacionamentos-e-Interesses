import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requisições
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para respostas
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Erro na resposta:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Serviços para Usuários
export const usuariosService = {
  listar: () => api.get('/usuarios'),
  buscar: (id) => api.get(`/usuarios/${id}`),
  criar: (data) => api.post('/usuarios', data),
  atualizar: (id, data) => api.put(`/usuarios/${id}`, data),
  remover: (id) => api.delete(`/usuarios/${id}`),
};

// Serviços para Temas
export const temasService = {
  listar: () => api.get('/temas'),
  buscar: (id) => api.get(`/temas/${id}`),
  criar: (data) => api.post('/temas', data),
  atualizar: (id, data) => api.put(`/temas/${id}`, data),
  remover: (id) => api.delete(`/temas/${id}`),
};

// Serviços para Conexões
export const conexoesService = {
  listar: () => api.get('/conexoes'),
  criar: (data) => api.post('/conexoes', data),
  remover: (tipo, id) => api.delete(`/conexoes/${tipo}/${id}`),
  buscarPorNode: (collection, id) => api.get(`/conexoes/node/${collection}/${id}`),
};

// Serviços para Grafo
export const grafoService = {
  obterDados: () => api.get('/grafo'),
  obterFiltrado: (tipo) => api.get(`/grafo/filter/${tipo}`),
};

// Health check
export const healthService = {
  verificar: () => api.get('/health'),
};

export default api; 