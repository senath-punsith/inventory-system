import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './layouts/AppShell';
import ActivityPage from './pages/ActivityPage';
import BorrowingsPage from './pages/BorrowingsPage';
import CupboardsPage from './pages/CupboardsPage';
import DashboardPage from './pages/DashboardPage';
import ItemsPage from './pages/ItemsPage';
import LoginPage from './pages/LoginPage';
import PlacesPage from './pages/PlacesPage';
import UsersPage from './pages/UsersPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="cupboards" element={<CupboardsPage />} />
        <Route path="places" element={<PlacesPage />} />
        <Route path="items" element={<ItemsPage />} />
        <Route path="borrowings" element={<BorrowingsPage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
