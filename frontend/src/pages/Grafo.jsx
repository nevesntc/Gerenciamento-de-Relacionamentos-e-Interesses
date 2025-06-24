import React, { useState, useEffect, useRef } from 'react';
import { GitGraph, RefreshCw, Filter, Users, Tag, Eye, EyeOff } from 'lucide-react';
import { Network } from 'vis-network/standalone';
import { grafoService } from '../services/api';

const Grafo = () => {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [network, setNetwork] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showUsers, setShowUsers] = useState(true);
  const [showTemas, setShowTemas] = useState(true);
  const [showInteresse, setShowInteresse] = useState(true);
  const [showConhece, setShowConhece] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const networkRef = useRef(null);

  useEffect(() => {
    fetchGraphData();
  }, [filterType]);

  useEffect(() => {
    if (networkRef.current && graphData.nodes.length > 0) {
      initializeNetwork();
    }
  }, [graphData]);

  const fetchGraphData = async () => {
    try {
      setLoading(true);
      const response = filterType === 'all' 
        ? await grafoService.obterDados()
        : await grafoService.obterFiltrado(filterType);
      
      setGraphData(response.data.data || { nodes: [], edges: [] });
    } catch (err) {
      console.error('Erro ao carregar dados do grafo:', err);
      setError('Erro ao carregar dados do grafo');
    } finally {
      setLoading(false);
    }
  };

  const initializeNetwork = () => {
    const container = networkRef.current;
    
    // Configurações do network
    const options = {
      nodes: {
        shape: 'dot',
        size: 20,
        font: {
          size: 14,
          color: '#333',
          face: 'Inter'
        },
        borderWidth: 2,
        shadow: true,
        color: {
          border: '#2B7CE9',
          background: '#97C2FC',
          highlight: {
            border: '#2B7CE9',
            background: '#D2E5FF'
          },
          hover: {
            border: '#2B7CE9',
            background: '#D2E5FF'
          }
        }
      },
      edges: {
        width: 2,
        shadow: true,
        smooth: {
          type: 'continuous',
          forceDirection: 'none'
        },
        color: {
          color: '#848484',
          highlight: '#848484',
          hover: '#848484'
        },
        font: {
          size: 12,
          align: 'middle',
          color: '#333'
        }
      },
      physics: {
        stabilization: false,
        barnesHut: {
          gravitationalConstant: -80000,
          springConstant: 0.001,
          springLength: 200
        }
      },
      interaction: {
        navigationButtons: true,
        keyboard: true,
        hover: true,
        tooltipDelay: 200
      },
      layout: {
        improvedLayout: true,
        hierarchical: false
      }
    };

    // Filtrar dados baseado nas configurações de visibilidade
    const filteredNodes = graphData.nodes.filter(node => {
      if (node.group === 'usuarios') return showUsers;
      if (node.group === 'temas') return showTemas;
      return true;
    });

    const filteredEdges = graphData.edges.filter(edge => {
      if (edge.label === 'interesse_em') return showInteresse;
      if (edge.label === 'conhece') return showConhece;
      return true;
    });

    // Criar network
    const networkInstance = new Network(container, {
      nodes: filteredNodes,
      edges: filteredEdges
    }, options);

    // Event listeners
    networkInstance.on('click', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const node = filteredNodes.find(n => n.id === nodeId);
        setSelectedNode(node);
      } else {
        setSelectedNode(null);
      }
    });

    networkInstance.on('doubleClick', (params) => {
      if (params.nodes.length > 0) {
        networkInstance.focus(params.nodes[0], {
          scale: 1.5,
          animation: {
            duration: 1000,
            easingFunction: 'easeInOutQuad'
          }
        });
      }
    });

    setNetwork(networkInstance);

    // Cleanup
    return () => {
      if (networkInstance) {
        networkInstance.destroy();
      }
    };
  };

  const handleRefresh = () => {
    fetchGraphData();
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
  };

  const handleVisibilityToggle = (type) => {
    switch (type) {
      case 'users':
        setShowUsers(!showUsers);
        break;
      case 'temas':
        setShowTemas(!showTemas);
        break;
      case 'interesse':
        setShowInteresse(!showInteresse);
        break;
      case 'conhece':
        setShowConhece(!showConhece);
        break;
      default:
        break;
    }
  };

  const getNodeStats = () => {
    const usuarios = graphData.nodes.filter(n => n.group === 'usuarios').length;
    const temas = graphData.nodes.filter(n => n.group === 'temas').length;
    const interesse = graphData.edges.filter(e => e.label === 'interesse_em').length;
    const conhece = graphData.edges.filter(e => e.label === 'conhece').length;
    
    return { usuarios, temas, interesse, conhece };
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <GitGraph className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Erro ao carregar grafo
          </h3>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  const stats = getNodeStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Visualizar Grafo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Visualização interativa das relações entre usuários e temas
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="btn-secondary flex items-center"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Filter Controls */}
        <div className="card p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filtros
            </h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Visualização
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleFilterChange('all')}
                  className={`btn ${filterType === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Todos
                </button>
                <button
                  onClick={() => handleFilterChange('usuarios')}
                  className={`btn ${filterType === 'usuarios' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Apenas Usuários
                </button>
                <button
                  onClick={() => handleFilterChange('temas')}
                  className={`btn ${filterType === 'temas' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Apenas Temas
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Visibility Controls */}
        <div className="card p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Eye className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Visibilidade
            </h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Usuários</span>
              </div>
              <button
                onClick={() => handleVisibilityToggle('users')}
                className={`p-1 rounded ${showUsers ? 'text-green-600' : 'text-gray-400'}`}
              >
                {showUsers ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Temas</span>
              </div>
              <button
                onClick={() => handleVisibilityToggle('temas')}
                className={`p-1 rounded ${showTemas ? 'text-green-600' : 'text-gray-400'}`}
              >
                {showTemas ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Interesse em Temas</span>
              </div>
              <button
                onClick={() => handleVisibilityToggle('interesse')}
                className={`p-1 rounded ${showInteresse ? 'text-green-600' : 'text-gray-400'}`}
              >
                {showInteresse ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-cyan-500 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Conhece Usuários</span>
              </div>
              <button
                onClick={() => handleVisibilityToggle('conhece')}
                className={`p-1 rounded ${showConhece ? 'text-green-600' : 'text-gray-400'}`}
              >
                {showConhece ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Estatísticas do Grafo
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.usuarios}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Usuários</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.temas}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Temas</div>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.interesse}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Interesses</div>
          </div>
          <div className="text-center p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
            <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
              {stats.conhece}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Conexões</div>
          </div>
        </div>
      </div>

      {/* Network Visualization */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Visualização do Grafo
          </h3>
          {loading && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
              <span>Carregando...</span>
            </div>
          )}
        </div>

        <div 
          ref={networkRef}
          className="w-full h-96 border border-gray-200 dark:border-gray-700 rounded-lg"
        />

        {/* Instructions */}
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Como usar:
          </h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• <strong>Clique</strong> em um nó para selecioná-lo</li>
            <li>• <strong>Duplo clique</strong> em um nó para focar nele</li>
            <li>• <strong>Arraste</strong> para mover os nós</li>
            <li>• <strong>Scroll</strong> para zoom in/out</li>
            <li>• <strong>Arraste no espaço vazio</strong> para mover a visualização</li>
          </ul>
        </div>
      </div>

      {/* Selected Node Info */}
      {selectedNode && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Informações do Nó Selecionado
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome</p>
              <p className="text-gray-900 dark:text-white">{selectedNode.label}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</p>
              <p className="text-gray-900 dark:text-white capitalize">{selectedNode.group}</p>
            </div>
            {selectedNode.data && (
              <>
                {selectedNode.data.email && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</p>
                    <p className="text-gray-900 dark:text-white">{selectedNode.data.email}</p>
                  </div>
                )}
                {selectedNode.data.idade && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Idade</p>
                    <p className="text-gray-900 dark:text-white">{selectedNode.data.idade} anos</p>
                  </div>
                )}
                {selectedNode.data.descricao && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</p>
                    <p className="text-gray-900 dark:text-white">{selectedNode.data.descricao}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Grafo; 