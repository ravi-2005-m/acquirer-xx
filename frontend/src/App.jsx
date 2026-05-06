import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import ErrorBoundary from './components/ErrorBoundary';

// Layout & route guards
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';

// Auth pages (no layout)
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard
import Dashboard from './pages/dashboard/Dashboard';

// Merchant
import MerchantList from './pages/merchant/MerchantList';
import MerchantForm from './pages/merchant/MerchantForm';
import MerchantDetail from './pages/merchant/MerchantDetail';

// Store
import StoresList from './pages/stores/StoresList';
import StoreDetail from './pages/stores/StoreDetail';

// Settlements
import SettlementPage from './pages/settlements/SettlementPage';
import SettlementBatchPage from './pages/settlements/SettlementBatchPage';
import MerchantSettlementsPage from './pages/settlements/MerchantSettlementsPage';

// Terminal
import TerminalList from './pages/terminal/TerminalList';
import TerminalDetail from './pages/terminal/TerminalDetail';

// Transaction
import AuthList from './pages/transaction/AuthList';
import AuthDetail from './pages/transaction/AuthDetail';
import TransactionSimulator from './pages/transaction/TransactionSimulator';
import SettledList from './pages/transaction/SettledList';
import SettledDetail from './pages/transaction/SettledDetail';

// Disputes
import DisputesPage from './pages/dispute/DisputesPage';
import DisputeDetailPage from './pages/dispute/DisputeDetailPage';

// Reconciliation
import ReconPage from './pages/recon/ReconPage';
import ReconFilePage from './pages/recon/ReconFilePage';

// Risk & Fraud
import RiskPage from './pages/risk/RiskPage';

// Notifications
import NotificationsPage from './pages/notifications/NotificationsPage';

// Profile
import ProfilePage from './pages/profile/ProfilePage';

// Search
import SearchResultsPage from './pages/search/SearchResultsPage';

// Reports
import ReportsPage from './pages/reports/ReportsPage';

// Error pages
import NotFound from './pages/NotFound';
import Forbidden from './pages/Forbidden';

// Admin
import UserManagementPage from './pages/admin/UserManagementPage';
import UserDetailPage from './pages/admin/UserDetailPage';
import FeeRulesPage from './pages/admin/FeeRulesPage';

// Dev
import ComponentsDemo from './pages/dev/ComponentsDemo';
import CrashTest from './pages/dev/CrashTest';

function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public routes (no layout, no auth) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forbidden" element={<Forbidden />} />

        {/* All protected routes share the Layout */}
        <Route
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/merchants" element={<MerchantList />} />
          <Route path="/merchants/new" element={<MerchantForm />} />
          <Route path="/merchants/:id" element={<MerchantDetail />} />
          <Route path="/stores" element={<StoresList />} />
          <Route path="/stores/:id" element={<StoreDetail />} />
          <Route path="/terminals" element={<TerminalList />} />
          <Route path="/terminals/:id" element={<TerminalDetail />} />
          <Route path="/transactions" element={<AuthList />} />
          <Route path="/transactions/new" element={<TransactionSimulator />} />
          <Route path="/transactions/settled" element={<SettledList />} />
          <Route path="/transactions/settled/:id" element={<SettledDetail />} />
          <Route path="/transactions/:id" element={<AuthDetail />} />
          <Route path="/risk" element={<RiskPage />} />
          <Route path="/settlement" element={<SettlementPage />} />
          <Route path="/settlement/merchant/:merchantId" element={<MerchantSettlementsPage />} />
          <Route path="/settlement/:id" element={<SettlementBatchPage />} />
          <Route path="/reconciliation" element={<ReconPage />} />
          <Route path="/reconciliation/:id" element={<ReconFilePage />} />
          <Route path="/disputes" element={<DisputesPage />} />
          <Route path="/disputes/:id" element={<DisputeDetailPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/search" element={<SearchResultsPage />} />

          {/* Dev demo */}
          <Route path="/dev/components" element={<ComponentsDemo />} />
          <Route path="/dev/crash-test" element={<CrashTest />} />

          {/* Admin-only nested under Layout */}
          <Route
            path="/admin/users"
            element={
              <RoleRoute requiredRole="ADMIN">
                <UserManagementPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <RoleRoute requiredRole="ADMIN">
                <UserDetailPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/fee-rules"
            element={
              <RoleRoute requiredRole="ADMIN">
                <FeeRulesPage />
              </RoleRoute>
            }
          />
        </Route>

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
