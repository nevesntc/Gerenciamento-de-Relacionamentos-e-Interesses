import React, { useState, useEffect } from 'react';
import { Network, Plus, Trash2, Users, Tag, ArrowRight, X, Save } from 'lucide-react';
import { conexoesService, usuariosService, temasService } from '../services/api';

const Conexoes = () => {
  const [conexoes, setConexoes] = useState({ interesse_em: [], conhece: [] });
  const [usuarios, setUsuarios] = useState([]);
  const [temas, setTemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'interesse_em',
    de: '',
    para: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [conexoesRes, usuariosRes, temasRes] = await Promise.all([
        conexoesService.listar(),
        usuariosService.listar(),
        temasService.listar()
      ]);

      setConexoes(conexoesRes.data.data || { interesse_em: [], conhece: [] });
      setUsuarios(usuariosRes.data.data || []);
      setTemas(temasRes.data.data || []);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar conexões');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await conexoesService.criar(formData);
      setShowForm(false);
      setFormData({ tipo: 'interesse_em', de: '', para: '' });
      fetchData();
    } catch (err) {
      console.error('Erro ao criar conexão:', err);
      alert(err.response?.data?.error || 'Erro ao criar conexão');
    }
  };

  const handleDelete = async (tipo, id) => {
    if (!confirm('Tem certeza que deseja remover esta conexão?')) return;
    
    try {
      await conexoesService.remover(tipo, id);
      fetchData();
    } catch (err) {
      console.error('Erro ao remover conexão:', err);
      alert(err.response?.data?.error || 'Erro ao remover conexão');
    }
  };

  const getNodeLabel = (nodeId) => {
    const [collection, id] = nodeId.split('/');
    if (collection === 'usuarios') {
      const usuario = usuarios.find(u => u._key === id);
      return usuario ? usuario.nome : `Usuário ${id}`;
    } else if (collection === 'temas') {
      const tema = temas.find(t => t._key === id);
      return tema ? tema.nome : `Tema ${id}`;
    }
    return nodeId;
  };

  const resetForm = () => {
    setShowForm(false);
    setFormData({ tipo: 'interesse_em', de: '', para: '' });
  };

  const getFilteredOptions = () => {
    if (formData.tipo === 'interesse_em') {
      return {
        de: usuarios.map(u => ({ value: `usuarios/${u._key}`, label: u.nome })),
        para: temas.map(t => ({ value: `temas/${t._key}`, label: t.nome }))
      };
    } else {
      return {
        de: usuarios.map(u => ({ value: `usuarios/${u._key}`, label: u.nome })),
        para: usuarios.map(u => ({ value: `usuarios/${u._key}`, label: u.nome }))
      };
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Network className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Erro ao carregar conexões
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
            Conexões
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gerencie as relações entre usuários e temas
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Conexão
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Nova Conexão
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
                  Tipo de Conexão
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value, de: '', para: '' })}
                  className="input"
                >
                  <option value="interesse_em">Interesse em Tema</option>
                  <option value="conhece">Conhece Usuário</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  De
                </label>
                <select
                  required
                  value={formData.de}
                  onChange={(e) => setFormData({ ...formData, de: e.target.value })}
                  className="input"
                >
                  <option value="">Selecione...</option>
                  {getFilteredOptions().de.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Para
                </label>
                <select
                  required
                  value={formData.para}
                  onChange={(e) => setFormData({ ...formData, para: e.target.value })}
                  className="input"
                >
                  <option value="">Selecione...</option>
                  {getFilteredOptions().para.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="btn-primary flex-1 flex items-center justify-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Criar Conexão
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

      {/* Connections List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interesse em Temas */}
        <div className="card">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Tag className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Interesse em Temas ({conexoes.interesse_em?.length || 0})
              </h3>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Carregando...</p>
              </div>
            ) : conexoes.interesse_em?.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum interesse registrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {conexoes.interesse_em?.map((conexao) => (
                  <div
                    key={conexao._id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {getNodeLabel(conexao._from)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <Tag className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {getNodeLabel(conexao._to)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete('interesse_em', conexao._key)}
                      className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Conhece Usuários */}
        <div className="card">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Conhece Usuários ({conexoes.conhece?.length || 0})
              </h3>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Carregando...</p>
              </div>
            ) : conexoes.conhece?.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma relação de conhecimento</p>
              </div>
            ) : (
              <div className="space-y-3">
                {conexoes.conhece?.map((conexao) => (
                  <div
                    key={conexao._id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {getNodeLabel(conexao._from)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <Users className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {getNodeLabel(conexao._to)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete('conhece', conexao._key)}
                      className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Estatísticas das Conexões
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {conexoes.interesse_em?.length || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Interesses em Temas
            </div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {conexoes.conhece?.length || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Relações de Conhecimento
            </div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {(conexoes.interesse_em?.length || 0) + (conexoes.conhece?.length || 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total de Conexões
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Conexoes; 