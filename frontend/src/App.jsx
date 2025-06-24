import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import Temas from './pages/Temas';
import Conexoes from './pages/Conexoes';
import Grafo from './pages/Grafo';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/temas" element={<Temas />} />
          <Route path="/conexoes" element={<Conexoes />} />
          <Route path="/grafo" element={<Grafo />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App; 