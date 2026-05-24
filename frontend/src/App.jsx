import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Datasets from './pages/Datasets';
import Personas from './pages/Personas';
import Campaigns from './pages/Campaigns';
import Login from './pages/Login';

function ProtectedRoute({ children }) {
  const { token } = useSelector((s) => s.auth);
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="datasets" element={<Datasets />} />
        <Route path="personas" element={<Personas />} />
        <Route path="campaigns" element={<Campaigns />} />
      </Route>
    </Routes>
  );
}
