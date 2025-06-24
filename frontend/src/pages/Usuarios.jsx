import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Search, X, Save, User } from 'lucide-react';
import { usuariosService } from '../services/api';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    idade: ''
  });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await usuariosService.listar();
      setUsuarios(response.data.data || []);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await usuariosService.atualizar(editingUser._key, formData);
      } else {
        await usuariosService.criar(formData);
      }
      
      setShowForm(false);
      setEditingUser(null);
      setFormData({ nome: '', email: '', idade: '' });
      fetchUsuarios();
    } catch (err) {
      console.error('Erro ao salvar usuário:', err);
      alert(err.response?.data?.error || 'Erro ao salvar usuário');
    }
  };

  const handleEdit = (usuario) => {
    setEditingUser(usuario);
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      idade: usuario.idade.toString()
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja remover este usuário?')) return;
    
    try {
      await usuariosService.remover(id);
      fetchUsuarios();
    } catch (err) {
      console.error('Erro ao remover usuário:', err);
      alert(err.response?.data?.error || 'Erro ao remover usuário');
    }
  };

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({ nome: '', email: '', idade: '' });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Erro ao carregar usuários
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
            Usuários
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gerencie os usuários do sistema
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Usuário
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar usuários..."
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
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
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
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Idade
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="120"
                  value={formData.idade}
                  onChange={(e) => setFormData({ ...formData, idade: e.target.value })}
                  className="input"
                  placeholder="25"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="btn-primary flex-1 flex items-center justify-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingUser ? 'Atualizar' : 'Criar'}
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

      {/* Users List */}
      <div className="card">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Lista de Usuários ({filteredUsuarios.length})
          </h3>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Carregando usuários...</p>
            </div>
          ) : filteredUsuarios.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum usuário encontrado</p>
              {searchTerm && (
                <p className="text-sm mt-1">Tente ajustar os termos de busca</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Nome
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Idade
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsuarios.map((usuario) => (
                    <tr
                      key={usuario._key}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {usuario.nome}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                        {usuario.email}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                        {usuario.idade} anos
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(usuario)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(usuario._key)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Usuarios; 