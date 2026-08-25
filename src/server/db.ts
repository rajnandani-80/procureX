import { randomUUID } from 'crypto';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // hashed or demo text
  role: 'SUPER_ADMIN' | 'ORGANIZATION_ADMIN' | 'EMPLOYEE' | 'PROCUREMENT_MANAGER' | 'WAREHOUSE_STAFF' | 'FINANCE' | 'VENDOR';
  organizationId: string;
  departmentId?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'INVITED';
  createdAt: string;
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
  managerId?: string;
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
  departmentId?: string;
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
  unitId: string;
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
  productId: string;
  price: number;
  currency: string;
  moq: number; // Minimum Order Quantity
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
  status: 'CREATED' | 'ACCEPTED' | 'DISPATCHED' | 'RECEIVED' | 'CLOSED';
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
  organizationId: string;
  productId: string;
  productName: string;
  sku: string;
  categoryName: string;
  unitName: string;
  currentStock: number;
  reservedStock: number;
  minStockLevel: number;
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

export interface InviteToken {
  id: string;
  token: string;
  organizationId: string;
  organizationName: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ORGANIZATION_ADMIN' | 'EMPLOYEE' | 'PROCUREMENT_MANAGER' | 'WAREHOUSE_STAFF' | 'FINANCE' | 'VENDOR';
  departmentId?: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
  expiresAt: string;
  createdAt: string;
}

// Global In-Memory Database State
class Database {
  organizations: Organization[] = [
    {
      id: 'org-apex',
      name: 'Apex Global Enterprises',
      code: 'APEX',
      currency: 'INR (₹)',
      timezone: 'Asia/Kolkata',
      status: 'ACTIVE',
      createdAt: new Date('2025-01-15').toISOString()
    },
    {
      id: 'org-nexus',
      name: 'Nexus Logistics Ltd',
      code: 'NEXUS',
      currency: 'USD ($)',
      timezone: 'America/New_York',
      status: 'ACTIVE',
      createdAt: new Date('2025-02-01').toISOString()
    }
  ];

  departments: Department[] = [
    { id: 'dept-it', organizationId: 'org-apex', name: 'Information Technology', code: 'IT', budget: 2500000, status: 'ACTIVE' },
    { id: 'dept-ops', organizationId: 'org-apex', name: 'Operations & Facilities', code: 'OPS', budget: 1800000, status: 'ACTIVE' },
    { id: 'dept-mfg', organizationId: 'org-apex', name: 'Manufacturing & Hardware', code: 'MFG', budget: 3500000, status: 'ACTIVE' },
    { id: 'dept-hr', organizationId: 'org-apex', name: 'Human Resources', code: 'HR', budget: 800000, status: 'ACTIVE' }
  ];

  categories: Category[] = [
    { id: 'cat-elec', organizationId: 'org-apex', name: 'Electronics & IT Gear', code: 'ELEC', description: 'Computing hardware, monitors, networking & peripherals' },
    { id: 'cat-off', organizationId: 'org-apex', name: 'Office Furniture & Supplies', code: 'OFFICE', description: 'Ergonomic chairs, desks, stationery' },
    { id: 'cat-ind', organizationId: 'org-apex', name: 'Industrial Safety & Tools', code: 'IND', description: 'Protective gear, tools, safety helmets, sensors' },
    { id: 'cat-raw', organizationId: 'org-apex', name: 'Raw Materials & Components', code: 'RAW', description: 'Metals, cables, electronic chips, raw assembly items' }
  ];

  units: Unit[] = [
    { id: 'unit-pcs', organizationId: 'org-apex', name: 'Pieces', code: 'PCS', description: 'Individual unit count' },
    { id: 'unit-box', organizationId: 'org-apex', name: 'Boxes', code: 'BOX', description: 'Box of multi-pack items' },
    { id: 'unit-kg', organizationId: 'org-apex', name: 'Kilograms', code: 'KG', description: 'Weight measurement' },
    { id: 'unit-ltr', organizationId: 'org-apex', name: 'Liters', code: 'LTR', description: 'Liquid volume' },
    { id: 'unit-roll', organizationId: 'org-apex', name: 'Rolls', code: 'ROLL', description: 'Cable or fabric rolls' }
  ];

  approvalRules: ApprovalRule[] = [
    { id: 'rule-1', organizationId: 'org-apex', name: 'Low Value Standard PR Approval', minAmount: 0, maxAmount: 50000, approverRole: 'PROCUREMENT_MANAGER', status: 'ACTIVE' },
    { id: 'rule-2', organizationId: 'org-apex', name: 'High Value Executive PR Approval', minAmount: 50001, maxAmount: 10000000, approverRole: 'ORGANIZATION_ADMIN', status: 'ACTIVE' }
  ];

  users: User[] = [
    {
      id: 'usr-super',
      name: 'Platform Administrator',
      email: 'superadmin@procurex.io',
      password: 'password123',
      role: 'SUPER_ADMIN',
      organizationId: 'org-apex',
      status: 'ACTIVE',
      createdAt: '2025-01-01T00:00:00Z',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: 'usr-admin',
      name: 'Rajnandani Singh',
      email: 'admin@apexcorp.com',
      password: 'password123',
      role: 'ORGANIZATION_ADMIN',
      organizationId: 'org-apex',
      departmentId: 'dept-it',
      status: 'ACTIVE',
      createdAt: '2025-01-15T00:00:00Z',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: 'usr-pm',
      name: 'Vikram Malhotra',
      email: 'pm@apexcorp.com',
      password: 'password123',
      role: 'PROCUREMENT_MANAGER',
      organizationId: 'org-apex',
      departmentId: 'dept-ops',
      status: 'ACTIVE',
      createdAt: '2025-01-20T00:00:00Z',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: 'usr-employee',
      name: 'Ananya Sharma',
      email: 'employee@apexcorp.com',
      password: 'password123',
      role: 'EMPLOYEE',
      organizationId: 'org-apex',
      departmentId: 'dept-it',
      status: 'ACTIVE',
      createdAt: '2025-02-01T00:00:00Z',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: 'usr-warehouse',
      name: 'Rajesh Kumar',
      email: 'warehouse@apexcorp.com',
      password: 'password123',
      role: 'WAREHOUSE_STAFF',
      organizationId: 'org-apex',
      departmentId: 'dept-mfg',
      status: 'ACTIVE',
      createdAt: '2025-02-05T00:00:00Z',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: 'usr-finance',
      name: 'Priya Verma',
      email: 'finance@apexcorp.com',
      password: 'password123',
      role: 'FINANCE',
      organizationId: 'org-apex',
      departmentId: 'dept-ops',
      status: 'ACTIVE',
      createdAt: '2025-02-10T00:00:00Z',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: 'usr-vendor',
      name: 'TechSupply Account rep',
      email: 'vendor@techsupply.com',
      password: 'password123',
      role: 'VENDOR',
      organizationId: 'org-apex',
      status: 'ACTIVE',
      createdAt: '2025-02-12T00:00:00Z',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'
    }
  ];

  vendors: Vendor[] = [
    {
      id: 'vnd-techsupply',
      organizationId: 'org-apex',
      companyName: 'TechSupply Co Ltd',
      contactName: 'Sanjay Gupta',
      email: 'vendor@techsupply.com',
      phone: '+91 98765 43210',
      taxId: '27AABCT3518Q1ZS',
      address: 'Suite 402, Cyber Heights, Bengaluru, KA',
      rating: 4.8,
      status: 'ACTIVE',
      createdAt: '2025-01-20T00:00:00Z'
    },
    {
      id: 'vnd-acme',
      organizationId: 'org-apex',
      companyName: 'Acme Office Gear',
      contactName: 'Meera Patel',
      email: 'contact@acmeoffice.com',
      phone: '+91 98111 22334',
      taxId: '27AABCA1234F1ZA',
      address: 'Plot 12, Industrial Estate, Pune, MH',
      rating: 4.5,
      status: 'ACTIVE',
      createdAt: '2025-01-25T00:00:00Z'
    },
    {
      id: 'vnd-buildright',
      organizationId: 'org-apex',
      companyName: 'BuildRight Hardware Ind',
      contactName: 'Amitabh Sen',
      email: 'sales@buildright.in',
      phone: '+91 99000 88776',
      taxId: '27AABCB9876K1ZY',
      address: '77 Industrial Avenue, Gurugram, HR',
      rating: 4.2,
      status: 'ACTIVE',
      createdAt: '2025-02-01T00:00:00Z'
    }
  ];

  products: Product[] = [
    {
      id: 'prod-macbook',
      organizationId: 'org-apex',
      name: 'MacBook Pro M3 Max 16"',
      sku: 'SKU-ELEC-001',
      categoryId: 'cat-elec',
      unitId: 'unit-pcs',
      description: '16-inch M3 Max chip, 36GB Unified Memory, 1TB SSD Storage',
      minStockLevel: 5,
      currentStock: 14,
      unitPrice: 249000,
      specifications: '36GB RAM, 1TB SSD, Space Black'
    },
    {
      id: 'prod-chair',
      organizationId: 'org-apex',
      name: 'Ergonomic Executive Mesh Chair',
      sku: 'SKU-OFF-002',
      categoryId: 'cat-off',
      unitId: 'unit-pcs',
      description: 'High back ergonomic chair with adjustable lumbar support & headrest',
      minStockLevel: 10,
      currentStock: 4, // LOW STOCK ALERT
      unitPrice: 18500,
      specifications: 'Breathable Mesh, 3D Armrest, Synchro-tilt mechanism'
    },
    {
      id: 'prod-helmet',
      organizationId: 'org-apex',
      name: 'Heavy Duty Safety Helmet (ANSI Z89.1)',
      sku: 'SKU-IND-003',
      categoryId: 'cat-ind',
      unitId: 'unit-pcs',
      description: 'High-density polyethylene safety helmet with chin strap',
      minStockLevel: 25,
      currentStock: 3, // LOW STOCK
      unitPrice: 1200,
      specifications: 'UV Resistant HDPE, 6-point Suspension'
    },
    {
      id: 'prod-cat6',
      organizationId: 'org-apex',
      name: 'Cat6 Ethernet Shielded Cable Box (305m)',
      sku: 'SKU-RAW-004',
      categoryId: 'cat-raw',
      unitId: 'unit-roll',
      description: '305 Meters High-speed Gigabit Copper Ethernet Cable Roll',
      minStockLevel: 8,
      currentStock: 18,
      unitPrice: 14200,
      specifications: '23 AWG Solid Bare Copper, SFTP Shielded'
    },
    {
      id: 'prod-dell-mon',
      organizationId: 'org-apex',
      name: 'Dell UltraSharp 27" 4K USB-C Hub Monitor',
      sku: 'SKU-ELEC-005',
      categoryId: 'cat-elec',
      unitId: 'unit-pcs',
      description: 'IPS Panel, 99% sRGB, 90W Power Delivery over USB-C',
      minStockLevel: 10,
      currentStock: 22,
      unitPrice: 48000,
      specifications: 'U2723QE, 4K UHD, HDR400'
    }
  ];

  vendorOffers: VendorOffer[] = [
    {
      id: 'vo-1',
      organizationId: 'org-apex',
      vendorId: 'vnd-techsupply',
      productId: 'prod-macbook',
      price: 242000,
      currency: 'INR (₹)',
      moq: 2,
      leadTimeDays: 5,
      status: 'APPROVED',
      validUntil: '2026-12-31',
      createdAt: '2025-02-01T10:00:00Z'
    },
    {
      id: 'vo-2',
      organizationId: 'org-apex',
      vendorId: 'vnd-acme',
      productId: 'prod-chair',
      price: 17200,
      currency: 'INR (₹)',
      moq: 5,
      leadTimeDays: 7,
      status: 'APPROVED',
      validUntil: '2026-12-31',
      createdAt: '2025-02-05T11:30:00Z'
    },
    {
      id: 'vo-3',
      organizationId: 'org-apex',
      vendorId: 'vnd-buildright',
      productId: 'prod-helmet',
      price: 1100,
      currency: 'INR (₹)',
      moq: 20,
      leadTimeDays: 3,
      status: 'PENDING_APPROVAL',
      validUntil: '2026-12-31',
      createdAt: '2025-02-10T09:00:00Z'
    },
    {
      id: 'vo-4',
      organizationId: 'org-apex',
      vendorId: 'vnd-techsupply',
      productId: 'prod-dell-mon',
      price: 45500,
      currency: 'INR (₹)',
      moq: 3,
      leadTimeDays: 4,
      status: 'APPROVED',
      validUntil: '2026-12-31',
      createdAt: '2025-02-12T14:15:00Z'
    }
  ];

  purchaseRequests: PurchaseRequest[] = [
    {
      id: 'pr-101',
      prNumber: 'PR-2026-001',
      organizationId: 'org-apex',
      requestedById: 'usr-employee',
      requestedByName: 'Ananya Sharma',
      departmentId: 'dept-it',
      departmentName: 'Information Technology',
      items: [
        {
          id: 'pri-1',
          productId: 'prod-macbook',
          productName: 'MacBook Pro M3 Max 16"',
          sku: 'SKU-ELEC-001',
          quantity: 2,
          estimatedPrice: 249000
        }
      ],
      totalAmount: 498000,
      justification: 'New senior engineering hires joining next month requiring high-performance development laptops.',
      status: 'APPROVED',
      approvedById: 'usr-pm',
      approvedByName: 'Vikram Malhotra',
      createdAt: '2025-02-10T09:30:00Z',
      updatedAt: '2025-02-11T11:00:00Z'
    },
    {
      id: 'pr-102',
      prNumber: 'PR-2026-002',
      organizationId: 'org-apex',
      requestedById: 'usr-employee',
      requestedByName: 'Ananya Sharma',
      departmentId: 'dept-it',
      departmentName: 'Information Technology',
      items: [
        {
          id: 'pri-2',
          productId: 'prod-chair',
          productName: 'Ergonomic Executive Mesh Chair',
          sku: 'SKU-OFF-002',
          quantity: 10,
          estimatedPrice: 18500
        }
      ],
      totalAmount: 185000,
      justification: 'Replenishing stock for 2nd floor engineering workstation revamp.',
      status: 'PENDING_APPROVAL',
      createdAt: '2025-02-12T15:20:00Z',
      updatedAt: '2025-02-12T15:20:00Z'
    },
    {
      id: 'pr-103',
      prNumber: 'PR-2026-003',
      organizationId: 'org-apex',
      requestedById: 'usr-warehouse',
      requestedByName: 'Rajesh Kumar',
      departmentId: 'dept-mfg',
      departmentName: 'Manufacturing & Hardware',
      items: [
        {
          id: 'pri-3',
          productId: 'prod-helmet',
          productName: 'Heavy Duty Safety Helmet (ANSI Z89.1)',
          sku: 'SKU-IND-003',
          quantity: 50,
          estimatedPrice: 1200
        }
      ],
      totalAmount: 60000,
      justification: 'Urgent restock needed as current helmet inventory is below critical threshold of 5 units.',
      status: 'PENDING_APPROVAL',
      createdAt: '2025-02-13T08:15:00Z',
      updatedAt: '2025-02-13T08:15:00Z'
    }
  ];

  purchaseOrders: PurchaseOrder[] = [
    {
      id: 'po-501',
      poNumber: 'PO-2026-001',
      organizationId: 'org-apex',
      prId: 'pr-101',
      vendorId: 'vnd-techsupply',
      vendorName: 'TechSupply Co Ltd',
      createdById: 'usr-pm',
      createdByName: 'Vikram Malhotra',
      items: [
        {
          productId: 'prod-macbook',
          productName: 'MacBook Pro M3 Max 16"',
          quantity: 2,
          unitPrice: 242000,
          totalPrice: 484000
        }
      ],
      totalAmount: 484000,
      expectedDeliveryDate: '2026-02-28',
      status: 'DISPATCHED',
      notes: 'Ship via Express Air Cargo with fragile electronic package insulation.',
      createdAt: '2025-02-11T14:00:00Z',
      updatedAt: '2025-02-12T10:00:00Z'
    }
  ];

  goodsReceipts: GoodsReceipt[] = [
    {
      id: 'grn-801',
      grnNumber: 'GRN-2026-001',
      organizationId: 'org-apex',
      poId: 'po-501',
      poNumber: 'PO-2026-001',
      receivedById: 'usr-warehouse',
      receivedByName: 'Rajesh Kumar',
      items: [
        {
          productId: 'prod-macbook',
          productName: 'MacBook Pro M3 Max 16"',
          orderedQty: 2,
          receivedQty: 2,
          damagedQty: 0
        }
      ],
      notes: 'All items inspected and verified in pristine condition.',
      receivedAt: '2025-02-12T16:00:00Z'
    }
  ];

  auditLogs: AuditLog[] = [
    {
      id: 'log-1',
      organizationId: 'org-apex',
      action: 'USER_LOGIN',
      entity: 'USER',
      entityId: 'usr-admin',
      performedById: 'usr-admin',
      performedByName: 'Rajnandani Singh',
      performedByRole: 'ORGANIZATION_ADMIN',
      details: 'User authenticated successfully via credentials.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    },
    {
      id: 'log-2',
      organizationId: 'org-apex',
      action: 'PR_APPROVED',
      entity: 'PURCHASE_REQUEST',
      entityId: 'pr-101',
      performedById: 'usr-pm',
      performedByName: 'Vikram Malhotra',
      performedByRole: 'PROCUREMENT_MANAGER',
      details: 'Purchase Request PR-2026-001 approved for ₹4,98,000.',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString()
    },
    {
      id: 'log-3',
      organizationId: 'org-apex',
      action: 'PO_DISPATCHED',
      entity: 'PURCHASE_ORDER',
      entityId: 'po-501',
      performedById: 'usr-vendor',
      performedByName: 'TechSupply Account rep',
      performedByRole: 'VENDOR',
      details: 'Purchase Order PO-2026-001 marked as DISPATCHED by vendor.',
      timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString()
    }
  ];

  invites: InviteToken[] = [
    {
      id: 'inv-01',
      token: 'demo-invite-token-123456',
      organizationId: 'org-apex',
      organizationName: 'Apex Global Enterprises',
      email: 'new.engineer@apexcorp.com',
      name: 'Rohan Deshmukh',
      role: 'EMPLOYEE',
      departmentId: 'dept-it',
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      createdAt: new Date().toISOString()
    }
  ];

  // Helper log generator
  addAuditLog(orgId: string, action: string, entity: string, entityId: string, user: { id: string; name: string; role: string }, details: string) {
    const log: AuditLog = {
      id: `log-${randomUUID().slice(0, 8)}`,
      organizationId: orgId,
      action,
      entity,
      entityId,
      performedById: user.id,
      performedByName: user.name,
      performedByRole: user.role,
      details,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
  }
}

export const db = new Database();
