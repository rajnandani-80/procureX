import { apiFetch, setAccessToken } from './api.js';
import {
  User,
  Organization,
  Department,
  Category,
  Unit,
  ApprovalRule,
  Vendor,
  Product,
  VendorOffer,
  PurchaseRequest,
  PurchaseOrder,
  GoodsReceipt,
  InventoryItem,
  AuditLog
} from '../types/index.js';

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiFetch<{ success: boolean; token: string; user: User; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    setAccessToken(res.token);
    return res;
  },

  logout: async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (e) {}
    setAccessToken(null);
  },

  getCurrentUser: async () => {
    return apiFetch<{ success: boolean; user: User }>('/auth/me');
  }
};

export const inviteService = {
  validateToken: async (token: string) => {
    return apiFetch<{ success: boolean; invite: any }>(`/invites/validate/${token}`);
  },

  acceptInvite: async (payload: { token: string; password: string; name?: string }) => {
    return apiFetch<{ success: boolean; message: string }>('/invites/accept', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  sendInvite: async (payload: { email: string; name: string; role: string; departmentId?: string }) => {
    return apiFetch<{ success: boolean; inviteUrl: string; inviteToken: string }>('/users/invite', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};

export const organizationService = {
  getCurrentOrg: async () => {
    return apiFetch<{ success: boolean; organization: Organization }>('/organizations/current');
  },

  updateOrg: async (data: Partial<Organization>) => {
    return apiFetch<{ success: boolean; organization: Organization }>('/organizations/current', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  getSuperAdminStats: async () => {
    return apiFetch<{ success: boolean; stats: any; recentOrganizations: Organization[]; activity: AuditLog[] }>('/super-admin/dashboard');
  },

  getSuperAdminOrgs: async () => {
    return apiFetch<{ success: boolean; organizations: Organization[] }>('/super-admin/organizations');
  },

  createOrg: async (data: { name: string; code: string; currency: string; timezone: string }) => {
    return apiFetch<{ success: boolean; organization: Organization }>('/super-admin/organizations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  createOrgAdmin: async (orgId: string, data: { name: string; email: string; password: string }) => {
    return apiFetch<{ success: boolean; user: User }>(`/super-admin/organizations/${orgId}/admin`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

export const departmentService = {
  getDepartments: async () => apiFetch<{ success: boolean; departments: Department[] }>('/departments'),
  createDepartment: async (data: { name: string; code: string; budget: number }) =>
    apiFetch<{ success: boolean; department: Department }>('/departments', { method: 'POST', body: JSON.stringify(data) })
};

export const categoryService = {
  getCategories: async () => apiFetch<{ success: boolean; categories: Category[] }>('/categories'),
  createCategory: async (data: { name: string; code: string; description?: string }) =>
    apiFetch<{ success: boolean; category: Category }>('/categories', { method: 'POST', body: JSON.stringify(data) })
};

export const unitService = {
  getUnits: async () => apiFetch<{ success: boolean; units: Unit[] }>('/units'),
  createUnit: async (data: { name: string; code: string; description?: string }) =>
    apiFetch<{ success: boolean; unit: Unit }>('/units', { method: 'POST', body: JSON.stringify(data) })
};

export const approvalRuleService = {
  getRules: async () => apiFetch<{ success: boolean; rules: ApprovalRule[] }>('/approval-rules'),
  createRule: async (data: { name: string; minAmount: number; maxAmount: number; approverRole: string }) =>
    apiFetch<{ success: boolean; rule: ApprovalRule }>('/approval-rules', { method: 'POST', body: JSON.stringify(data) })
};

export const userService = {
  getUsers: async () => apiFetch<{ success: boolean; users: User[] }>('/users'),
  updateRole: async (userId: string, role: string) =>
    apiFetch<{ success: boolean; user: User }>(`/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  updateStatus: async (userId: string, status: string) =>
    apiFetch<{ success: boolean; user: User }>(`/users/${userId}/status`, { method: 'PUT', body: JSON.stringify({ status }) })
};

export const vendorService = {
  getVendors: async () => apiFetch<{ success: boolean; vendors: Vendor[] }>('/vendors'),
  getVendorById: async (id: string) =>
    apiFetch<{ success: boolean; vendor: Vendor; offers: VendorOffer[]; purchaseOrders: PurchaseOrder[] }>(`/vendors/${id}`),
  createVendor: async (data: Partial<Vendor>) =>
    apiFetch<{ success: boolean; vendor: Vendor }>('/vendors', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: async (vendorId: string, status: string) =>
    apiFetch<{ success: boolean; vendor: Vendor }>(`/vendors/${vendorId}/status`, { method: 'PUT', body: JSON.stringify({ status }) })
};

export const productService = {
  getProducts: async () => apiFetch<{ success: boolean; products: Product[] }>('/products'),
  getProductById: async (id: string) =>
    apiFetch<{ success: boolean; product: Product; offers: VendorOffer[] }>(`/products/${id}`),
  createProduct: async (data: Partial<Product>) =>
    apiFetch<{ success: boolean; product: Product }>('/products', { method: 'POST', body: JSON.stringify(data) })
};

export const vendorOfferService = {
  getOffers: async () => apiFetch<{ success: boolean; offers: VendorOffer[] }>('/vendor-offers'),
  createOffer: async (data: Partial<VendorOffer>) =>
    apiFetch<{ success: boolean; offer: VendorOffer }>('/vendor-offers', { method: 'POST', body: JSON.stringify(data) }),
  updateOfferStatus: async (id: string, status: 'APPROVED' | 'REJECTED') =>
    apiFetch<{ success: boolean; offer: VendorOffer }>(`/vendor-offers/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) })
};

export const purchaseRequestService = {
  getRequests: async () => apiFetch<{ success: boolean; purchaseRequests: PurchaseRequest[] }>('/purchase-requests'),
  getRequestById: async (id: string) => apiFetch<{ success: boolean; purchaseRequest: PurchaseRequest }>(`/purchase-requests/${id}`),
  createRequest: async (data: { items: { productId: string; quantity: number }[]; justification: string; departmentId?: string }) =>
    apiFetch<{ success: boolean; purchaseRequest: PurchaseRequest }>('/purchase-requests', { method: 'POST', body: JSON.stringify(data) }),
  approveRequest: async (id: string) =>
    apiFetch<{ success: boolean; purchaseRequest: PurchaseRequest }>(`/purchase-requests/${id}/approve`, { method: 'PUT' }),
  rejectRequest: async (id: string, reason: string) =>
    apiFetch<{ success: boolean; purchaseRequest: PurchaseRequest }>(`/purchase-requests/${id}/reject`, { method: 'PUT', body: JSON.stringify({ reason }) })
};

export const purchaseOrderService = {
  getOrders: async () => apiFetch<{ success: boolean; purchaseOrders: PurchaseOrder[] }>('/purchase-orders'),
  getOrderById: async (id: string) =>
    apiFetch<{ success: boolean; purchaseOrder: PurchaseOrder; goodsReceipts: GoodsReceipt[] }>(`/purchase-orders/${id}`),
  createOrder: async (data: { prId: string; vendorId: string; expectedDeliveryDate?: string; notes?: string }) =>
    apiFetch<{ success: boolean; purchaseOrder: PurchaseOrder }>('/purchase-orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrderStatus: async (id: string, status: string) =>
    apiFetch<{ success: boolean; purchaseOrder: PurchaseOrder }>(`/purchase-orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) })
};

export const goodsReceiptService = {
  getReceipts: async () => apiFetch<{ success: boolean; goodsReceipts: GoodsReceipt[] }>('/goods-receipts'),
  getReceiptById: async (id: string) => apiFetch<{ success: boolean; goodsReceipt: GoodsReceipt }>(`/goods-receipts/${id}`),
  createReceipt: async (data: { poId: string; items: { productId: string; orderedQty: number; receivedQty: number; damagedQty: number }[]; notes?: string }) =>
    apiFetch<{ success: boolean; goodsReceipt: GoodsReceipt }>('/goods-receipts', { method: 'POST', body: JSON.stringify(data) })
};

export const inventoryService = {
  getInventory: async () => apiFetch<{ success: boolean; inventory: InventoryItem[] }>('/inventory'),
  adjustStock: async (data: { productId: string; newQuantity: number; reason?: string }) =>
    apiFetch<{ success: boolean; currentStock: number }>('/inventory/adjust', { method: 'POST', body: JSON.stringify(data) })
};

export const dashboardService = {
  getSummary: async () => apiFetch<{ success: boolean; role: string; metrics: any; recentRequests: any[]; recentOrders: any[]; lowStockProducts: any[]; activity: any[] }>('/dashboard/summary')
};

export const reportService = {
  getPurchaseSummary: async () => apiFetch<{ success: boolean; summary: any }>('/reports/purchase-summary'),
  getVendorPerformance: async () => apiFetch<{ success: boolean; performance: any[] }>('/reports/vendor-performance')
};

export const auditLogService = {
  getLogs: async () => apiFetch<{ success: boolean; auditLogs: AuditLog[] }>('/audit-logs')
};

export const aiService = {
  getProcurementInsights: async () => apiFetch<{ success: boolean; insight: string }>('/ai/procurement-insights', { method: 'POST' })
};
