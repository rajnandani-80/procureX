import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { MainLayout } from './components/layout/MainLayout.js';
import { Login } from './pages/auth/Login.js';
import { AcceptInvite } from './pages/auth/AcceptInvite.js';
import { Dashboard } from './pages/dashboard/Dashboard.js';
import { SuperAdminDashboard } from './pages/superadmin/SuperAdminDashboard.js';
import { OrganizationSettings } from './pages/organization/OrganizationSettings.js';
import { UsersList } from './pages/users/UsersList.js';
import { VendorsList } from './pages/vendors/VendorsList.js';
import { ProductsList } from './pages/products/ProductsList.js';
import { VendorOffersList } from './pages/procurement/VendorOffersList.js';
import { PurchaseRequestsList } from './pages/procurement/PurchaseRequestsList.js';
import { PurchaseOrdersList } from './pages/procurement/PurchaseOrdersList.js';
import { GoodsReceiptsList } from './pages/procurement/GoodsReceiptsList.js';
import { InventoryList } from './pages/inventory/InventoryList.js';
import { ReportsPage } from './pages/reports/ReportsPage.js';
import { AuditLogsPage } from './pages/audit/AuditLogsPage.js';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center text-[#D4AF37] text-xs font-semibold">
        Loading ProcureX ERP Engine...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/accept-invite" element={<AcceptInvite />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/super-admin/organizations"
            element={
              <ProtectedRoute>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/organization"
            element={
              <ProtectedRoute>
                <OrganizationSettings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UsersList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/vendors"
            element={
              <ProtectedRoute>
                <VendorsList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <ProductsList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/vendor-offers"
            element={
              <ProtectedRoute>
                <VendorOffersList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/purchase-requests"
            element={
              <ProtectedRoute>
                <PurchaseRequestsList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/purchase-orders"
            element={
              <ProtectedRoute>
                <PurchaseOrdersList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/goods-receipts"
            element={
              <ProtectedRoute>
                <GoodsReceiptsList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <InventoryList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute>
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
