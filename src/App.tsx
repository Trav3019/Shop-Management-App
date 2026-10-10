import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { WorkOrders } from './pages/WorkOrders';
import { EquipmentPage } from './pages/Equipment';
import { PartsPage } from './pages/Parts';
import { MaintenanceLogPage } from './pages/MaintenanceLog';

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/work-orders" element={<WorkOrders />} />
            <Route path="/equipment" element={<EquipmentPage />} />
            <Route path="/parts" element={<PartsPage />} />
            <Route path="/maintenance-log" element={<MaintenanceLogPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
