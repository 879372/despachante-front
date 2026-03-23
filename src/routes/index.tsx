import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Dashboard } from '../pages/Dashboard';
import { ClientList } from '../pages/ClientList';
import { ClientForm } from '../pages/ClientForm';
import { ProcessList } from '../pages/ProcessList';
import { ProcessForm } from '../pages/ProcessForm';
import { Login } from '../pages/Login';

const PrivateRoute = () => {
  const token = localStorage.getItem('token');
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/processes" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/processes" element={<ProcessList />} />
            <Route path="/processes/new" element={<ProcessForm />} />
            <Route path="/processes/:id/edit" element={<ProcessForm />} />
            <Route path="/clients" element={<ClientList />} />
            <Route path="/clients/new" element={<ClientForm />} />
            <Route path="/clients/:id/edit" element={<ClientForm />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
