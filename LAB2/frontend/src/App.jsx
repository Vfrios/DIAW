import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Clientes from './pages/Clientes.jsx';
import Pedidos from './pages/Pedidos.jsx';
import PedidoForm from './pages/PedidoForm.jsx';
import PedidoDetalhe from './pages/PedidoDetalhe.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/clientes" element={<PrivateRoute><Clientes /></PrivateRoute>} />
          <Route path="/pedidos" element={<PrivateRoute><Pedidos /></PrivateRoute>} />
          <Route path="/pedidos/novo" element={<PrivateRoute><PedidoForm /></PrivateRoute>} />
          <Route path="/pedidos/:id" element={<PrivateRoute><PedidoDetalhe /></PrivateRoute>} />
          <Route path="/pedidos/:id/editar" element={<PrivateRoute><PedidoForm /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/pedidos" replace />} />
        </Routes>
      </main>
    </>
  );
}
