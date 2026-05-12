import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './routes/PrivateRoute';
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Pages — lazy-loading would speed up first paint; we keep eager for clarity.
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { ProprietairesPage } from './pages/ProprietairesPage';
import { ConsultationsPage } from './pages/ConsultationsPage';
import { DossiersPage } from './pages/DossiersPage';
import { TraitementsPage } from './pages/TraitementsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public branch — landing + login share the public layout for header. */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />

          {/* Protected branch — wrapped in <PrivateRoute> + dashboard layout. */}
          <Route
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route path="/dashboard"     element={<DashboardPage />} />
            <Route path="/patients"      element={<PatientsPage />} />
            <Route path="/proprietaires" element={<ProprietairesPage />} />
            <Route path="/consultations" element={<ConsultationsPage />} />
            <Route path="/dossiers"      element={<DossiersPage />} />
            <Route path="/traitements"   element={<TraitementsPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}