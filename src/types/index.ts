export type UserRole =
  | 'SUPER_ADMIN'
  | 'ORGANIZATION_ADMIN'
  | 'EMPLOYEE'
  | 'PROCUREMENT_MANAGER'
  | 'WAREHOUSE_STAFF'
  | 'FINANCE'
  | 'VENDOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  organizationName?: string;
  departmentId?: string;
  departmentName?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'INVITED';
  avatar?: string;
}

export interface Organization {
  id: string;
  name: string;
  code: string;
  currency: string;
  timezone: string;
  logo?: string;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export interface Department {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  budget: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Category {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  description: string;
}

export interface Unit {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  description: string;
}

export interface ApprovalRule {
  id: string;
  organizationId: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  approverRole: 'ORGANIZATION_ADMIN' | 'PROCUREMENT_MANAGER' | 'FINANCE';
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Vendor {
  id: string;
  organizationId: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  taxId: string;
  address: string;
  rating: number;
  status: 'ACTIVE' | 'PENDING' | 'BLOCKED';
  createdAt: string;
}

export interface Product {
  id: string;
  organizationId: string;
  name: string;
  sku: string;
  categoryId: string;
  categoryName?: string;
  unitId: string;
  unitName?: string;
  description: string;
  minStockLevel: number;
  currentStock: number;
  unitPrice: number;
  specifications: string;
  imageUrl?: string;
}

export interface VendorOffer {
  id: string;
  organizationId: string;
  vendorId: string;
  vendorName?: string;
  productId: string;
  productName?: string;
  productSku?: string;
  price: number;
  currency: string;
  moq: number;
  leadTimeDays: number;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  validUntil: string;
  createdAt: string;
}

export interface PurchaseRequestItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  estimatedPrice: number;
}

export interface PurchaseRequest {
  id: string;
  prNumber: string;
  organizationId: string;
  requestedById: string;
  requestedByName: string;
  departmentId: string;
  departmentName: string;
  items: PurchaseRequestItem[];
  totalAmount: number;
  justification: string;
  status: 'CREATED' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  approvedById?: string;
  approvedByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type POStatus = 'CREATED' | 'ACCEPTED' | 'DISPATCHED' | 'RECEIVED' | 'CLOSED';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  organizationId: string;
  prId: string;
  vendorId: string;
  vendorName: string;
  createdById: string;
  createdByName: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  expectedDeliveryDate: string;
  status: POStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoodsReceiptItem {
  productId: string;
  productName: string;
  orderedQty: number;
  receivedQty: number;
  damagedQty: number;
}

export interface GoodsReceipt {
  id: string;
  grnNumber: string;
  organizationId: string;
  poId: string;
  poNumber: string;
  receivedById: string;
  receivedByName: string;
  items: GoodsReceiptItem[];
  notes?: string;
  receivedAt: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  categoryName: string;
  unitName: string;
  currentStock: number;
  minStockLevel: number;
  unitPrice: number;
  status: 'HEALTHY' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  lastUpdated: string;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  action: string;
  entity: string;
  entityId: string;
  performedById: string;
  performedByName: string;
  performedByRole: string;
  details: string;
  timestamp: string;
}
