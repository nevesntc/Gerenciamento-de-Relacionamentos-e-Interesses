import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit, Trash2, Search, X, Save, Hash } from 'lucide-react';
import { temasService } from '../services/api';

const Temas = () => {
  const [temas, setTemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTema, setEditingTema] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: ''
  });

  useEffect(() => {
    fetchTemas();
  }, []);

  const fetchTemas = async () => {
    try {
      setLoading(true);
      const response = await temasService.listar();
      setTemas(response.data.data || []);
    } catch (err) {
      console.error('Erro ao carregar temas:', err);
      setError('Erro ao carregar temas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTema) {
        await temasService.atualizar(editingTema._key, formData);
      } else {
        await temasService.criar(formData);
      }
      
      setShowForm(false);
      setEditingTema(null);
      setFormData({ nome: '', descricao: '' });
      fetchTemas();
    } catch (err) {
      console.error('Erro ao salvar tema:', err);
      alert(err.response?.data?.error || 'Erro ao salvar tema');
    }
  };

  const handleEdit = (tema) => {
    setEditingTema(tema);
    setFormData({
      nome: tema.nome,
      descricao: tema.descricao
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja remover este tema?')) return;
    
    try {
      await temasService.remover(id);
      fetchTemas();
    } catch (err) {
      console.error('Erro ao remover tema:', err);
      alert(err.response?.data?.error || 'Erro ao remover tema');
    }
  };

  const filteredTemas = temas.filter(tema =>
    tema.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tema.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setShowForm(false);
    setEditingTema(null);
    setFormData({ nome: '', descricao: '' });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Tag className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Erro ao carregar temas
          </h3>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Temas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gerencie os temas do sistema
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Tema
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar temas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingTema ? 'Editar Tema' : 'Novo Tema'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="input"
                  placeholder="Nome do tema"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrição
                </label>
                <textarea
                  required
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="input resize-none"
                  rows="3"
                  placeholder="Descrição detalhada do tema"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="btn-primary flex-1 flex items-center justify-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingTema ? 'Atualizar' : 'Criar'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Themes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Carregando temas...</p>
          </div>
        ) : filteredTemas.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
            <Hash className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum tema encontrado</p>
            {searchTerm && (
              <p className="text-sm mt-1">Tente ajustar os termos de busca</p>
            )}
          </div>
        ) : (
          filteredTemas.map((tema) => (
            <div key={tema._key} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Tag className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {tema.nome}
                  </h3>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEdit(tema)}
                    className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(tema._key)}
                    className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                {tema.descricao}
              </p>
              
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>ID: {tema._key}</span>
                  <span>Criado em: {tema.createdAt ? new Date(tema.createdAt).toLocaleString() : 'Data não disponível'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Temas; 