import React, { useState, useEffect } from 'react';
import { Users, Tag, Network, GitGraph, TrendingUp, Activity } from 'lucide-react';
import { usuariosService, temasService, conexoesService, grafoService } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    usuarios: 0,
    temas: 0,
    conexoes: 0,
    grafo: { nodes: 0, edges: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        const [usuariosRes, temasRes, conexoesRes, grafoRes] = await Promise.all([
          usuariosService.listar(),
          temasService.listar(),
          conexoesService.listar(),
          grafoService.obterDados()
        ]);

        setStats({
          usuarios: usuariosRes.data.count || 0,
          temas: temasRes.data.count || 0,
          conexoes: conexoesRes.data.count?.total || 0,
          grafo: {
            nodes: grafoRes.data.stats?.totalNodes || 0,
            edges: grafoRes.data.stats?.totalEdges || 0
          }
        });
      } catch (err) {
        console.error('Erro ao carregar estatísticas:', err);
        setError('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="card p-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {loading ? '...' : value}
          </p>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Erro ao carregar dashboard
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
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Visão geral do sistema GraphManager
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <TrendingUp className="w-4 h-4" />
          <span>Dados em tempo real</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Usuários"
          value={stats.usuarios}
          icon={Users}
          color="bg-blue-500"
          description="Total de usuários cadastrados"
        />
        <StatCard
          title="Temas"
          value={stats.temas}
          icon={Tag}
          color="bg-green-500"
          description="Total de temas disponíveis"
        />
        <StatCard
          title="Conexões"
          value={stats.conexoes}
          icon={Network}
          color="bg-purple-500"
          description="Total de relações criadas"
        />
        <StatCard
          title="Nodes no Grafo"
          value={stats.grafo.nodes}
          icon={GitGraph}
          color="bg-orange-500"
          description={`${stats.grafo.edges} conexões ativas`}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Ações Rápidas
          </h3>
          <div className="space-y-3">
            <button className="w-full btn-primary flex items-center justify-center">
              <Users className="w-4 h-4 mr-2" />
              Adicionar Usuário
            </button>
            <button className="w-full btn-secondary flex items-center justify-center">
              <Tag className="w-4 h-4 mr-2" />
              Criar Tema
            </button>
            <button className="w-full btn-secondary flex items-center justify-center">
              <Network className="w-4 h-4 mr-2" />
              Nova Conexão
            </button>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Status do Sistema
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Backend API</span>
              <span className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">ArangoDB</span>
              <span className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Conectado
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Grafo Ativo</span>
              <span className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Funcionando
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Atividade Recente
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma atividade recente</p>
          <p className="text-sm">As atividades aparecerão aqui conforme você usar o sistema</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 