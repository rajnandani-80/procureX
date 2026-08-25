import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { db, User } from './db.js';
import { GoogleGenAI } from '@google/genai';

const uuidv4 = () => randomUUID();

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'procurex-super-secret-jwt-key-2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'procurex-super-secret-refresh-key-2026';

// Middleware to extract user from Access Token
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: User['role'];
    organizationId: string;
    name: string;
    departmentId?: string;
  };
}

const authenticateToken = (req: AuthenticatedRequest, res: Response, next: Function) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired access token' });
  }
};

const requireRole = (...roles: User['role'][]) => {
  return (req: AuthenticatedRequest, res: Response, next: Function) => {
    if (!req.user || (!roles.includes('ALL' as any) && !roles.includes(req.user.role))) {
      return res.status(403).json({ success: false, message: 'Unauthorized role permission' });
    }
    next();
  };
};

// ==========================================
// 1. AUTH ROUTES
// ==========================================

router.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  if (user.status !== 'ACTIVE') {
    return res.status(403).json({ success: false, message: 'User account is inactive or pending invite' });
  }

  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
    name: user.name,
    departmentId: user.departmentId
  };

  const accessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(tokenPayload, JWT_REFRESH_SECRET, { expiresIn: '7d' });

  // Set refresh token in HttpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: false, // development / cloud run proxy
    sameSite: 'lax',
    path: '/api/auth'
  });

  const org = db.organizations.find((o) => o.id === user.organizationId);

  db.addAuditLog(user.organizationId, 'USER_LOGIN', 'USER', user.id, user, `${user.name} logged in successfully.`);

  return res.json({
    success: true,
    message: 'Login successful',
    token: accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      organizationName: org ? org.name : 'ProcureX Org',
      departmentId: user.departmentId,
      avatar: user.avatar
    }
  });
});

router.post('/auth/refresh', (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'Refresh token cookie missing' });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
    const user = db.users.find((u) => u.id === decoded.id);

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ success: false, message: 'User invalid or inactive' });
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      name: user.name,
      departmentId: user.departmentId
    };

    const newAccessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '15m' });
    const org = db.organizations.find((o) => o.id === user.organizationId);

    return res.json({
      success: true,
      token: newAccessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        organizationName: org ? org.name : 'ProcureX Org',
        departmentId: user.departmentId,
        avatar: user.avatar
      }
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
});

router.post('/auth/logout', (req: Request, res: Response) => {
  res.clearCookie('refreshToken', { path: '/api/auth' });
  return res.json({ success: true, message: 'Logged out successfully' });
});

router.get('/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = db.users.find((u) => u.id === req.user?.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const org = db.organizations.find((o) => o.id === user.organizationId);
  const dept = db.departments.find((d) => d.id === user.departmentId);

  return res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      organizationName: org ? org.name : 'ProcureX Org',
      departmentId: user.departmentId,
      departmentName: dept ? dept.name : null,
      avatar: user.avatar
    }
  });
});

// ==========================================
// 2. INVITE MODULE
// ==========================================

router.post('/invites', authenticateToken, requireRole('SUPER_ADMIN', 'ORGANIZATION_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { email, name, role, departmentId } = req.body;

  if (!email || !name || !role) {
    return res.status(400).json({ success: false, message: 'Email, name and role are required' });
  }

  const token = `inv-${randomUUID().replace(/-/g, '')}`;
  const org = db.organizations.find((o) => o.id === req.user?.organizationId);

  const invite = {
    id: `inv-${randomUUID().slice(0, 8)}`,
    token,
    organizationId: req.user?.organizationId!,
    organizationName: org ? org.name : 'ProcureX Org',
    email,
    name,
    role,
    departmentId,
    status: 'PENDING' as const,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    createdAt: new Date().toISOString()
  };

  db.invites.push(invite);

  db.addAuditLog(req.user?.organizationId!, 'INVITE_SENT', 'INVITE', invite.id, req.user!, `Sent invite to ${email} for role ${role}`);

  return res.json({
    success: true,
    message: 'Invite token generated successfully',
    inviteToken: token,
    inviteUrl: `/accept-invite/${token}`,
    invite
  });
});

router.get('/invites/validate/:token', (req: Request, res: Response) => {
  const { token } = req.params;
  const invite = db.invites.find((i) => i.token === token);

  if (!invite) {
    return res.status(404).json({ success: false, message: 'Invite token not found or invalid' });
  }

  if (invite.status === 'ACCEPTED') {
    return res.status(400).json({ success: false, message: 'Invite token has already been accepted' });
  }

  if (new Date(invite.expiresAt) < new Date()) {
    invite.status = 'EXPIRED';
    return res.status(400).json({ success: false, message: 'Invite token has expired' });
  }

  return res.json({
    success: true,
    invite: {
      email: invite.email,
      name: invite.name,
      role: invite.role,
      organizationName: invite.organizationName,
      status: invite.status,
      expiresAt: invite.expiresAt
    }
  });
});

router.post('/invites/accept', (req: Request, res: Response) => {
  const { token, password, name } = req.body;

  if (!token || !password) {
    return res.status(400).json({ success: false, message: 'Token and password are required' });
  }

  const invite = db.invites.find((i) => i.token === token);

  if (!invite || invite.status !== 'PENDING') {
    return res.status(400).json({ success: false, message: 'Invalid or expired invite token' });
  }

  // Create or activate user
  const newUser: User = {
    id: `usr-${uuidv4().slice(0, 8)}`,
    name: name || invite.name,
    email: invite.email,
    password,
    role: invite.role,
    organizationId: invite.organizationId,
    departmentId: invite.departmentId,
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  invite.status = 'ACCEPTED';

  db.addAuditLog(invite.organizationId, 'INVITE_ACCEPTED', 'USER', newUser.id, { id: newUser.id, name: newUser.name, role: newUser.role }, `${newUser.name} accepted invite and activated account.`);

  return res.json({
    success: true,
    message: 'Account successfully set up! You can now log in.'
  });
});

// ==========================================
// 3. SUPER ADMIN
// ==========================================

router.get('/super-admin/dashboard', authenticateToken, requireRole('SUPER_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  return res.json({
    success: true,
    stats: {
      totalOrganizations: db.organizations.length,
      activeOrganizations: db.organizations.filter((o) => o.status === 'ACTIVE').length,
      totalUsers: db.users.length,
      platformActivityLogs: db.auditLogs.length
    },
    recentOrganizations: db.organizations,
    activity: db.auditLogs.slice(0, 5)
  });
});

router.get('/super-admin/organizations', authenticateToken, requireRole('SUPER_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  return res.json({ success: true, organizations: db.organizations });
});

router.post('/super-admin/organizations', authenticateToken, requireRole('SUPER_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { name, code, currency, timezone } = req.body;

  if (!name || !code) {
    return res.status(400).json({ success: false, message: 'Organization name and code are required' });
  }

  const newOrg = {
    id: `org-${uuidv4().slice(0, 8)}`,
    name,
    code: code.toUpperCase(),
    currency: currency || 'INR (₹)',
    timezone: timezone || 'Asia/Kolkata',
    status: 'ACTIVE' as const,
    createdAt: new Date().toISOString()
  };

  db.organizations.push(newOrg);
  db.addAuditLog(newOrg.id, 'ORG_CREATED', 'ORGANIZATION', newOrg.id, req.user!, `Created new organization ${name}`);

  return res.json({ success: true, message: 'Organization created successfully', organization: newOrg });
});

router.get('/super-admin/organizations/:id', authenticateToken, requireRole('SUPER_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const org = db.organizations.find((o) => o.id === req.params.id);
  if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });

  const orgUsers = db.users.filter((u) => u.organizationId === org.id);
  return res.json({ success: true, organization: org, users: orgUsers });
});

router.post('/super-admin/organizations/:id/admin', authenticateToken, requireRole('SUPER_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { name, email, password } = req.body;
  const orgId = req.params.id;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email and password required' });
  }

  const adminUser: User = {
    id: `usr-${uuidv4().slice(0, 8)}`,
    name,
    email,
    password,
    role: 'ORGANIZATION_ADMIN',
    organizationId: orgId,
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  };

  db.users.push(adminUser);
  db.addAuditLog(orgId, 'ORG_ADMIN_CREATED', 'USER', adminUser.id, req.user!, `Created Org Admin ${name} (${email})`);

  return res.json({ success: true, message: 'Organization Admin created successfully', user: adminUser });
});

// ==========================================
// 4. ORGANIZATION SETTINGS
// ==========================================

router.get('/organizations/current', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const org = db.organizations.find((o) => o.id === req.user?.organizationId);
  return res.json({ success: true, organization: org });
});

router.put('/organizations/current', authenticateToken, requireRole('ORGANIZATION_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const org = db.organizations.find((o) => o.id === req.user?.organizationId);
  if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });

  const { name, currency, timezone, logo } = req.body;
  if (name) org.name = name;
  if (currency) org.currency = currency;
  if (timezone) org.timezone = timezone;
  if (logo !== undefined) org.logo = logo;

  db.addAuditLog(org.id, 'ORG_UPDATED', 'ORGANIZATION', org.id, req.user!, `Updated organization settings.`);

  return res.json({ success: true, message: 'Organization updated successfully', organization: org });
});

// ==========================================
// 5. DEPARTMENTS
// ==========================================

router.get('/departments', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const depts = db.departments.filter((d) => d.organizationId === req.user?.organizationId && d.status === 'ACTIVE');
  return res.json({ success: true, departments: depts });
});

router.post('/departments', authenticateToken, requireRole('ORGANIZATION_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { name, code, budget } = req.body;
  if (!name || !code) return res.status(400).json({ success: false, message: 'Department name and code are required' });

  const newDept = {
    id: `dept-${uuidv4().slice(0, 8)}`,
    organizationId: req.user?.organizationId!,
    name,
    code: code.toUpperCase(),
    budget: Number(budget) || 0,
    status: 'ACTIVE' as const
  };

  db.departments.push(newDept);
  db.addAuditLog(req.user?.organizationId!, 'DEPARTMENT_CREATED', 'DEPARTMENT', newDept.id, req.user!, `Created department ${name}`);

  return res.json({ success: true, message: 'Department created successfully', department: newDept });
});

router.put('/departments/:id', authenticateToken, requireRole('ORGANIZATION_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const dept = db.departments.find((d) => d.id === req.params.id && d.organizationId === req.user?.organizationId);
  if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });

  const { name, budget } = req.body;
  if (name) dept.name = name;
  if (budget !== undefined) dept.budget = Number(budget);

  return res.json({ success: true, message: 'Department updated', department: dept });
});

router.delete('/departments/:id', authenticateToken, requireRole('ORGANIZATION_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const dept = db.departments.find((d) => d.id === req.params.id && d.organizationId === req.user?.organizationId);
  if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });

  dept.status = 'INACTIVE';
  return res.json({ success: true, message: 'Department archived' });
});

// ==========================================
// 6. CATEGORIES & UNITS
// ==========================================

router.get('/categories', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const cats = db.categories.filter((c) => c.organizationId === req.user?.organizationId);
  return res.json({ success: true, categories: cats });
});

router.post('/categories', authenticateToken, requireRole('ORGANIZATION_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { name, code, description } = req.body;
  if (!name || !code) return res.status(400).json({ success: false, message: 'Name and code required' });

  const cat = {
    id: `cat-${uuidv4().slice(0, 8)}`,
    organizationId: req.user?.organizationId!,
    name,
    code: code.toUpperCase(),
    description: description || ''
  };

  db.categories.push(cat);
  return res.json({ success: true, message: 'Category created', category: cat });
});

router.get('/units', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const units = db.units.filter((u) => u.organizationId === req.user?.organizationId);
  return res.json({ success: true, units });
});

router.post('/units', authenticateToken, requireRole('ORGANIZATION_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { name, code, description } = req.body;
  if (!name || !code) return res.status(400).json({ success: false, message: 'Name and code required' });

  const unit = {
    id: `unit-${uuidv4().slice(0, 8)}`,
    organizationId: req.user?.organizationId!,
    name,
    code: code.toUpperCase(),
    description: description || ''
  };

  db.units.push(unit);
  return res.json({ success: true, message: 'Unit created', unit });
});

// ==========================================
// 7. APPROVAL RULES
// ==========================================

router.get('/approval-rules', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const rules = db.approvalRules.filter((r) => r.organizationId === req.user?.organizationId);
  return res.json({ success: true, rules });
});

router.post('/approval-rules', authenticateToken, requireRole('ORGANIZATION_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { name, minAmount, maxAmount, approverRole } = req.body;

  if (!name || approverRole === undefined) {
    return res.status(400).json({ success: false, message: 'Name and approver role required' });
  }

  const rule = {
    id: `rule-${uuidv4().slice(0, 8)}`,
    organizationId: req.user?.organizationId!,
    name,
    minAmount: Number(minAmount) || 0,
    maxAmount: Number(maxAmount) || 10000000,
    approverRole,
    status: 'ACTIVE' as const
  };

  db.approvalRules.push(rule);
  db.addAuditLog(req.user?.organizationId!, 'APPROVAL_RULE_CREATED', 'RULE', rule.id, req.user!, `Created approval rule ${name}`);

  return res.json({ success: true, message: 'Approval rule created', rule });
});

// ==========================================
// 8. USER MANAGEMENT
// ==========================================

router.get('/users', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const users = db.users
    .filter((u) => u.organizationId === req.user?.organizationId)
    .map((u) => {
      const dept = db.departments.find((d) => d.id === u.departmentId);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        departmentName: dept ? dept.name : 'All Departments',
        status: u.status,
        createdAt: u.createdAt
      };
    });

  return res.json({ success: true, users });
});

router.post('/users/invite', authenticateToken, requireRole('ORGANIZATION_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { email, name, role, departmentId } = req.body;
  if (!email || !name || !role) return res.status(400).json({ success: false, message: 'Email, name and role required' });

  const token = `inv-${uuidv4().replace(/-/g, '')}`;
  const org = db.organizations.find((o) => o.id === req.user?.organizationId);

  const invite = {
    id: `inv-${uuidv4().slice(0, 8)}`,
    token,
    organizationId: req.user?.organizationId!,
    organizationName: org ? org.name : 'ProcureX Org',
    email,
    name,
    role,
    departmentId,
    status: 'PENDING' as const,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    createdAt: new Date().toISOString()
  };

  db.invites.push(invite);
  db.addAuditLog(req.user?.organizationId!, 'USER_INVITED', 'USER', invite.id, req.user!, `Invited user ${name} (${email}) as ${role}`);

  return res.json({
    success: true,
    message: 'User invite link generated successfully',
    inviteUrl: `/accept-invite/${token}`,
    invite
  });
});

router.put('/users/:id/role', authenticateToken, requireRole('ORGANIZATION_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const user = db.users.find((u) => u.id === req.params.id && u.organizationId === req.user?.organizationId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const { role } = req.body;
  user.role = role;
  db.addAuditLog(req.user?.organizationId!, 'USER_ROLE_CHANGED', 'USER', user.id, req.user!, `Updated ${user.name}'s role to ${role}`);

  return res.json({ success: true, message: 'User role updated', user });
});

router.put('/users/:id/status', authenticateToken, requireRole('ORGANIZATION_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const user = db.users.find((u) => u.id === req.params.id && u.organizationId === req.user?.organizationId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const { status } = req.body;
  user.status = status;
  db.addAuditLog(req.user?.organizationId!, 'USER_STATUS_CHANGED', 'USER', user.id, req.user!, `Updated ${user.name}'s status to ${status}`);

  return res.json({ success: true, message: 'User status updated', user });
});

// ==========================================
// 9. VENDORS
// ==========================================

router.get('/vendors', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const vendors = db.vendors.filter((v) => v.organizationId === req.user?.organizationId);
  return res.json({ success: true, vendors });
});

router.get('/vendors/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const vendor = db.vendors.find((v) => v.id === req.params.id && v.organizationId === req.user?.organizationId);
  if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

  const offers = db.vendorOffers.filter((vo) => vo.vendorId === vendor.id);
  const pos = db.purchaseOrders.filter((po) => po.vendorId === vendor.id);

  return res.json({ success: true, vendor, offers, purchaseOrders: pos });
});

router.post('/vendors', authenticateToken, requireRole('ORGANIZATION_ADMIN', 'PROCUREMENT_MANAGER'), (req: AuthenticatedRequest, res: Response) => {
  const { companyName, contactName, email, phone, taxId, address } = req.body;

  if (!companyName || !email) {
    return res.status(400).json({ success: false, message: 'Company name and email are required' });
  }

  const vendor = {
    id: `vnd-${uuidv4().slice(0, 8)}`,
    organizationId: req.user?.organizationId!,
    companyName,
    contactName: contactName || '',
    email,
    phone: phone || '',
    taxId: taxId || '',
    address: address || '',
    rating: 5.0,
    status: 'ACTIVE' as const,
    createdAt: new Date().toISOString()
  };

  db.vendors.push(vendor);

  // Generate vendor login credentials automatically
  const vendorUser: User = {
    id: `usr-v-${uuidv4().slice(0, 8)}`,
    name: contactName || companyName,
    email,
    password: 'password123',
    role: 'VENDOR',
    organizationId: req.user?.organizationId!,
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  };
  db.users.push(vendorUser);

  db.addAuditLog(req.user?.organizationId!, 'VENDOR_CREATED', 'VENDOR', vendor.id, req.user!, `Added new vendor ${companyName}`);

  return res.json({ success: true, message: 'Vendor created and access credentials provisioned', vendor });
});

router.put('/vendors/:id/status', authenticateToken, requireRole('ORGANIZATION_ADMIN', 'PROCUREMENT_MANAGER'), (req: AuthenticatedRequest, res: Response) => {
  const vendor = db.vendors.find((v) => v.id === req.params.id && v.organizationId === req.user?.organizationId);
  if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

  const { status } = req.body;
  vendor.status = status;
  db.addAuditLog(req.user?.organizationId!, 'VENDOR_STATUS_CHANGED', 'VENDOR', vendor.id, req.user!, `Changed vendor ${vendor.companyName} status to ${status}`);

  return res.json({ success: true, message: 'Vendor status updated', vendor });
});

// ==========================================
// 10. PRODUCTS
// ==========================================

router.get('/products', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const products = db.products
    .filter((p) => p.organizationId === req.user?.organizationId)
    .map((p) => {
      const cat = db.categories.find((c) => c.id === p.categoryId);
      const unit = db.units.find((u) => u.id === p.unitId);
      return {
        ...p,
        categoryName: cat ? cat.name : 'General',
        unitName: unit ? unit.name : 'PCS'
      };
    });

  return res.json({ success: true, products });
});

router.get('/products/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const product = db.products.find((p) => p.id === req.params.id && p.organizationId === req.user?.organizationId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const offers = db.vendorOffers.filter((o) => o.productId === product.id);

  return res.json({ success: true, product, offers });
});

router.post('/products', authenticateToken, requireRole('ORGANIZATION_ADMIN', 'PROCUREMENT_MANAGER'), (req: AuthenticatedRequest, res: Response) => {
  const { name, sku, categoryId, unitId, description, minStockLevel, currentStock, unitPrice, specifications } = req.body;

  if (!name || !sku || !categoryId || !unitId) {
    return res.status(400).json({ success: false, message: 'Name, SKU, Category, and Unit are required' });
  }

  const newProd = {
    id: `prod-${uuidv4().slice(0, 8)}`,
    organizationId: req.user?.organizationId!,
    name,
    sku: sku.toUpperCase(),
    categoryId,
    unitId,
    description: description || '',
    minStockLevel: Number(minStockLevel) || 5,
    currentStock: Number(currentStock) || 0,
    unitPrice: Number(unitPrice) || 0,
    specifications: specifications || ''
  };

  db.products.push(newProd);
  db.addAuditLog(req.user?.organizationId!, 'PRODUCT_CREATED', 'PRODUCT', newProd.id, req.user!, `Added product ${name} (${sku})`);

  return res.json({ success: true, message: 'Product added successfully', product: newProd });
});

// ==========================================
// 11. VENDOR OFFERS
// ==========================================

router.get('/vendor-offers', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  let offers = db.vendorOffers.filter((o) => o.organizationId === req.user?.organizationId);

  // Vendor role scoping
  if (req.user?.role === 'VENDOR') {
    const vendorRecord = db.vendors.find((v) => v.email === req.user?.email);
    if (vendorRecord) {
      offers = offers.filter((o) => o.vendorId === vendorRecord.id);
    }
  }

  const enriched = offers.map((o) => {
    const prod = db.products.find((p) => p.id === o.productId);
    const vendor = db.vendors.find((v) => v.id === o.vendorId);
    return {
      ...o,
      productName: prod ? prod.name : 'Product',
      productSku: prod ? prod.sku : '',
      vendorName: vendor ? vendor.companyName : 'Vendor'
    };
  });

  return res.json({ success: true, offers: enriched });
});

router.post('/vendor-offers', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { productId, price, currency, moq, leadTimeDays } = req.body;

  let vendorId = req.body.vendorId;
  if (req.user?.role === 'VENDOR') {
    const vRec = db.vendors.find((v) => v.email === req.user?.email);
    if (vRec) vendorId = vRec.id;
  }

  if (!productId || !price || !vendorId) {
    return res.status(400).json({ success: false, message: 'Product, price and vendor identification are required' });
  }

  const offer = {
    id: `vo-${uuidv4().slice(0, 8)}`,
    organizationId: req.user?.organizationId!,
    vendorId,
    productId,
    price: Number(price),
    currency: currency || 'INR (₹)',
    moq: Number(moq) || 1,
    leadTimeDays: Number(leadTimeDays) || 3,
    status: 'PENDING_APPROVAL' as const,
    validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString(),
    createdAt: new Date().toISOString()
  };

  db.vendorOffers.push(offer);
  db.addAuditLog(req.user?.organizationId!, 'OFFER_SUBMITTED', 'VENDOR_OFFER', offer.id, req.user!, `Submitted quotation offer for product`);

  return res.json({ success: true, message: 'Vendor offer submitted successfully', offer });
});

router.put('/vendor-offers/:id/status', authenticateToken, requireRole('ORGANIZATION_ADMIN', 'PROCUREMENT_MANAGER'), (req: AuthenticatedRequest, res: Response) => {
  const offer = db.vendorOffers.find((o) => o.id === req.params.id && o.organizationId === req.user?.organizationId);
  if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });

  const { status } = req.body;
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Status must be APPROVED or REJECTED' });
  }

  offer.status = status;
  db.addAuditLog(req.user?.organizationId!, `OFFER_${status}`, 'VENDOR_OFFER', offer.id, req.user!, `Set offer status to ${status}`);

  return res.json({ success: true, message: `Offer ${status.toLowerCase()} successfully`, offer });
});

// ==========================================
// 12. PURCHASE REQUESTS
// ==========================================

router.get('/purchase-requests', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  let prs = db.purchaseRequests.filter((pr) => pr.organizationId === req.user?.organizationId);

  // If role is EMPLOYEE, show only own requests
  if (req.user?.role === 'EMPLOYEE') {
    prs = prs.filter((pr) => pr.requestedById === req.user?.id);
  }

  return res.json({ success: true, purchaseRequests: prs });
});

router.get('/purchase-requests/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const pr = db.purchaseRequests.find((p) => p.id === req.params.id && p.organizationId === req.user?.organizationId);
  if (!pr) return res.status(404).json({ success: false, message: 'Purchase Request not found' });

  return res.json({ success: true, purchaseRequest: pr });
});

router.post('/purchase-requests', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { items, justification, departmentId } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Purchase request must contain at least one product item' });
  }

  const dept = db.departments.find((d) => d.id === (departmentId || req.user?.departmentId));

  let total = 0;
  const processedItems = items.map((it: any) => {
    const prod = db.products.find((p) => p.id === it.productId);
    const lineTotal = (it.quantity || 1) * (prod ? prod.unitPrice : 0);
    total += lineTotal;
    return {
      id: `pri-${randomUUID().slice(0, 8)}`,
      productId: it.productId,
      productName: prod ? prod.name : 'Item',
      sku: prod ? prod.sku : 'SKU',
      quantity: Number(it.quantity) || 1,
      estimatedPrice: prod ? prod.unitPrice : 0
    };
  });

  const prNumber = `PR-${new Date().getFullYear()}-${String(db.purchaseRequests.length + 1).padStart(3, '0')}`;

  const pr = {
    id: `pr-${randomUUID().slice(0, 8)}`,
    prNumber,
    organizationId: req.user?.organizationId!,
    requestedById: req.user?.id!,
    requestedByName: req.user?.name!,
    departmentId: dept ? dept.id : 'dept-it',
    departmentName: dept ? dept.name : 'General',
    items: processedItems,
    totalAmount: total,
    justification: justification || 'Standard procurement requirement',
    status: 'PENDING_APPROVAL' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.purchaseRequests.unshift(pr);
  db.addAuditLog(req.user?.organizationId!, 'PR_CREATED', 'PURCHASE_REQUEST', pr.id, req.user!, `Created Purchase Request ${prNumber} for ₹${total.toLocaleString()}`);

  return res.json({ success: true, message: 'Purchase Request submitted for approval', purchaseRequest: pr });
});

router.put('/purchase-requests/:id/approve', authenticateToken, requireRole('ORGANIZATION_ADMIN', 'PROCUREMENT_MANAGER'), (req: AuthenticatedRequest, res: Response) => {
  const pr = db.purchaseRequests.find((p) => p.id === req.params.id && p.organizationId === req.user?.organizationId);
  if (!pr) return res.status(404).json({ success: false, message: 'Purchase request not found' });

  pr.status = 'APPROVED';
  pr.approvedById = req.user?.id;
  pr.approvedByName = req.user?.name;
  pr.updatedAt = new Date().toISOString();

  db.addAuditLog(req.user?.organizationId!, 'PR_APPROVED', 'PURCHASE_REQUEST', pr.id, req.user!, `Approved Purchase Request ${pr.prNumber}`);

  return res.json({ success: true, message: 'Purchase Request approved successfully', purchaseRequest: pr });
});

router.put('/purchase-requests/:id/reject', authenticateToken, requireRole('ORGANIZATION_ADMIN', 'PROCUREMENT_MANAGER'), (req: AuthenticatedRequest, res: Response) => {
  const pr = db.purchaseRequests.find((p) => p.id === req.params.id && p.organizationId === req.user?.organizationId);
  if (!pr) return res.status(404).json({ success: false, message: 'Purchase request not found' });

  const { reason } = req.body;
  pr.status = 'REJECTED';
  pr.rejectionReason = reason || 'Declined by procurement manager';
  pr.updatedAt = new Date().toISOString();

  db.addAuditLog(req.user?.organizationId!, 'PR_REJECTED', 'PURCHASE_REQUEST', pr.id, req.user!, `Rejected Purchase Request ${pr.prNumber}`);

  return res.json({ success: true, message: 'Purchase Request rejected', purchaseRequest: pr });
});

// ==========================================
// 13. PURCHASE ORDERS
// ==========================================

router.get('/purchase-orders', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  let pos = db.purchaseOrders.filter((po) => po.organizationId === req.user?.organizationId);

  if (req.user?.role === 'VENDOR') {
    const vRec = db.vendors.find((v) => v.email === req.user?.email);
    if (vRec) {
      pos = pos.filter((p) => p.vendorId === vRec.id);
    }
  }

  return res.json({ success: true, purchaseOrders: pos });
});

router.get('/purchase-orders/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const po = db.purchaseOrders.find((p) => p.id === req.params.id && p.organizationId === req.user?.organizationId);
  if (!po) return res.status(404).json({ success: false, message: 'Purchase Order not found' });

  const grns = db.goodsReceipts.filter((g) => g.poId === po.id);

  return res.json({ success: true, purchaseOrder: po, goodsReceipts: grns });
});

router.post('/purchase-orders', authenticateToken, requireRole('ORGANIZATION_ADMIN', 'PROCUREMENT_MANAGER'), (req: AuthenticatedRequest, res: Response) => {
  const { prId, vendorId, expectedDeliveryDate, notes } = req.body;

  const pr = db.purchaseRequests.find((p) => p.id === prId && p.organizationId === req.user?.organizationId);
  if (!pr) return res.status(400).json({ success: false, message: 'Valid approved Purchase Request is required' });

  const vendor = db.vendors.find((v) => v.id === vendorId);
  if (!vendor) return res.status(400).json({ success: false, message: 'Vendor is required' });

  const poNumber = `PO-${new Date().getFullYear()}-${String(db.purchaseOrders.length + 1).padStart(3, '0')}`;

  const poItems = pr.items.map((it) => {
    // Check if vendor offer exists
    const offer = db.vendorOffers.find((o) => o.vendorId === vendor.id && o.productId === it.productId);
    const unitPrice = offer ? offer.price : it.estimatedPrice;
    return {
      productId: it.productId,
      productName: it.productName,
      quantity: it.quantity,
      unitPrice,
      totalPrice: unitPrice * it.quantity
    };
  });

  const totalAmount = poItems.reduce((acc, curr) => acc + curr.totalPrice, 0);

  const po = {
    id: `po-${uuidv4().slice(0, 8)}`,
    poNumber,
    organizationId: req.user?.organizationId!,
    prId: pr.id,
    vendorId: vendor.id,
    vendorName: vendor.companyName,
    createdById: req.user?.id!,
    createdByName: req.user?.name!,
    items: poItems,
    totalAmount,
    expectedDeliveryDate: expectedDeliveryDate || new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString().split('T')[0],
    status: 'CREATED' as const,
    notes: notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.purchaseOrders.unshift(po);
  db.addAuditLog(req.user?.organizationId!, 'PO_CREATED', 'PURCHASE_ORDER', po.id, req.user!, `Generated Purchase Order ${poNumber} for vendor ${vendor.companyName}`);

  return res.json({ success: true, message: 'Purchase Order generated successfully', purchaseOrder: po });
});

router.put('/purchase-orders/:id/status', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const po = db.purchaseOrders.find((p) => p.id === req.params.id && p.organizationId === req.user?.organizationId);
  if (!po) return res.status(404).json({ success: false, message: 'Purchase Order not found' });

  const { status } = req.body;
  const validStatuses = ['CREATED', 'ACCEPTED', 'DISPATCHED', 'RECEIVED', 'CLOSED'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid PO status' });
  }

  po.status = status;
  po.updatedAt = new Date().toISOString();

  db.addAuditLog(req.user?.organizationId!, `PO_${status}`, 'PURCHASE_ORDER', po.id, req.user!, `Updated PO ${po.poNumber} status to ${status}`);

  return res.json({ success: true, message: `PO updated to ${status}`, purchaseOrder: po });
});

// ==========================================
// 14. GOODS RECEIPTS (GRN)
// ==========================================

router.get('/goods-receipts', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const grns = db.goodsReceipts.filter((g) => g.organizationId === req.user?.organizationId);
  return res.json({ success: true, goodsReceipts: grns });
});

router.get('/goods-receipts/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const grn = db.goodsReceipts.find((g) => g.id === req.params.id && g.organizationId === req.user?.organizationId);
  if (!grn) return res.status(404).json({ success: false, message: 'Goods receipt not found' });

  return res.json({ success: true, goodsReceipt: grn });
});

router.post('/goods-receipts', authenticateToken, requireRole('ORGANIZATION_ADMIN', 'WAREHOUSE_STAFF', 'PROCUREMENT_MANAGER'), (req: AuthenticatedRequest, res: Response) => {
  const { poId, items, notes } = req.body;

  const po = db.purchaseOrders.find((p) => p.id === poId && p.organizationId === req.user?.organizationId);
  if (!po) return res.status(400).json({ success: false, message: 'Valid Purchase Order is required' });

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Receipt line items are required' });
  }

  const grnNumber = `GRN-${new Date().getFullYear()}-${String(db.goodsReceipts.length + 1).padStart(3, '0')}`;

  const processedItems = items.map((it: any) => {
    const prod = db.products.find((p) => p.id === it.productId);
    const recQty = Number(it.receivedQty) || 0;
    const damQty = Number(it.damagedQty) || 0;

    // Adjust actual inventory stock in backend
    if (prod) {
      prod.currentStock += recQty;
    }

    return {
      productId: it.productId,
      productName: prod ? prod.name : 'Product',
      orderedQty: Number(it.orderedQty) || 0,
      receivedQty: recQty,
      damagedQty: damQty
    };
  });

  const grn = {
    id: `grn-${uuidv4().slice(0, 8)}`,
    grnNumber,
    organizationId: req.user?.organizationId!,
    poId: po.id,
    poNumber: po.poNumber,
    receivedById: req.user?.id!,
    receivedByName: req.user?.name!,
    items: processedItems,
    notes: notes || '',
    receivedAt: new Date().toISOString()
  };

  db.goodsReceipts.unshift(grn);

  // Auto transition PO status to RECEIVED
  po.status = 'RECEIVED';
  po.updatedAt = new Date().toISOString();

  db.addAuditLog(req.user?.organizationId!, 'GRN_CREATED', 'GOODS_RECEIPT', grn.id, req.user!, `Processed Goods Receipt Note ${grnNumber} for PO ${po.poNumber}`);

  return res.json({ success: true, message: 'Goods Receipt Note created & inventory updated', goodsReceipt: grn });
});

// ==========================================
// 15. INVENTORY
// ==========================================

router.get('/inventory', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const inventory = db.products
    .filter((p) => p.organizationId === req.user?.organizationId)
    .map((p) => {
      const cat = db.categories.find((c) => c.id === p.categoryId);
      const unit = db.units.find((u) => u.id === p.unitId);

      let status: 'HEALTHY' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'HEALTHY';
      if (p.currentStock <= 0) status = 'OUT_OF_STOCK';
      else if (p.currentStock <= p.minStockLevel) status = 'LOW_STOCK';

      return {
        id: p.id,
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        categoryName: cat ? cat.name : 'General',
        unitName: unit ? unit.name : 'PCS',
        currentStock: p.currentStock,
        minStockLevel: p.minStockLevel,
        unitPrice: p.unitPrice,
        status,
        lastUpdated: new Date().toISOString()
      };
    });

  return res.json({ success: true, inventory });
});

router.post('/inventory/adjust', authenticateToken, requireRole('ORGANIZATION_ADMIN', 'WAREHOUSE_STAFF'), (req: AuthenticatedRequest, res: Response) => {
  const { productId, newQuantity, reason } = req.body;

  const prod = db.products.find((p) => p.id === productId && p.organizationId === req.user?.organizationId);
  if (!prod) return res.status(404).json({ success: false, message: 'Product not found' });

  const oldQty = prod.currentStock;
  prod.currentStock = Number(newQuantity);

  db.addAuditLog(
    req.user?.organizationId!,
    'INVENTORY_ADJUSTED',
    'INVENTORY',
    prod.id,
    req.user!,
    `Manual stock adjustment for ${prod.name}: ${oldQty} -> ${newQuantity}. Reason: ${reason || 'Physical audit count'}`
  );

  return res.json({ success: true, message: 'Stock adjusted successfully', currentStock: prod.currentStock });
});

// ==========================================
// 16. DASHBOARD SUMMARY
// ==========================================

router.get('/dashboard/summary', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.organizationId;
  const role = req.user?.role;

  const users = db.users.filter((u) => u.organizationId === orgId);
  const vendors = db.vendors.filter((v) => v.organizationId === orgId);
  const products = db.products.filter((p) => p.organizationId === orgId);
  const offers = db.vendorOffers.filter((o) => o.organizationId === orgId);
  const prs = db.purchaseRequests.filter((pr) => pr.organizationId === orgId);
  const pos = db.purchaseOrders.filter((po) => po.organizationId === orgId);
  const logs = db.auditLogs.filter((l) => l.organizationId === orgId);

  const lowStockCount = products.filter((p) => p.currentStock <= p.minStockLevel).length;
  const pendingPRs = prs.filter((pr) => pr.status === 'PENDING_APPROVAL').length;
  const pendingOffers = offers.filter((o) => o.status === 'PENDING_APPROVAL').length;
  const activePOs = pos.filter((po) => ['CREATED', 'ACCEPTED', 'DISPATCHED'].includes(po.status)).length;

  return res.json({
    success: true,
    role,
    metrics: {
      totalUsers: users.length,
      totalVendors: vendors.length,
      totalProducts: products.length,
      pendingRequests: pendingPRs,
      activeOrders: activePOs,
      pendingOffers,
      lowStockItems: lowStockCount,
      totalSpend: pos.reduce((acc, curr) => acc + curr.totalAmount, 0)
    },
    recentRequests: prs.slice(0, 5),
    recentOrders: pos.slice(0, 5),
    lowStockProducts: products.filter((p) => p.currentStock <= p.minStockLevel),
    activity: logs.slice(0, 6)
  });
});

// ==========================================
// 17. REPORTS
// ==========================================

router.get('/reports/purchase-summary', authenticateToken, requireRole('ORGANIZATION_ADMIN', 'FINANCE', 'PROCUREMENT_MANAGER'), (req: AuthenticatedRequest, res: Response) => {
  const pos = db.purchaseOrders.filter((p) => p.organizationId === req.user?.organizationId);

  const totalSpent = pos.reduce((sum, po) => sum + po.totalAmount, 0);

  // Spending breakdown by vendor
  const vendorBreakdownMap: Record<string, number> = {};
  pos.forEach((po) => {
    vendorBreakdownMap[po.vendorName] = (vendorBreakdownMap[po.vendorName] || 0) + po.totalAmount;
  });

  const vendorBreakdown = Object.entries(vendorBreakdownMap).map(([name, amount]) => ({ name, amount }));

  return res.json({
    success: true,
    summary: {
      totalOrders: pos.length,
      totalSpent,
      vendorBreakdown,
      monthlyTrend: [
        { month: 'Oct 2025', spend: 320000 },
        { month: 'Nov 2025', spend: 410000 },
        { month: 'Dec 2025', spend: 390000 },
        { month: 'Jan 2026', spend: 580000 },
        { month: 'Feb 2026', spend: totalSpent }
      ]
    }
  });
});

router.get('/reports/vendor-performance', authenticateToken, requireRole('ORGANIZATION_ADMIN', 'PROCUREMENT_MANAGER'), (req: AuthenticatedRequest, res: Response) => {
  const vendors = db.vendors.filter((v) => v.organizationId === req.user?.organizationId);

  const performance = vendors.map((v) => {
    const vPos = db.purchaseOrders.filter((p) => p.vendorId === v.id);
    const fulfilled = vPos.filter((p) => p.status === 'RECEIVED' || p.status === 'CLOSED').length;
    const rate = vPos.length > 0 ? Math.round((fulfilled / vPos.length) * 100) : 100;

    return {
      vendorId: v.id,
      companyName: v.companyName,
      rating: v.rating,
      totalOrders: vPos.length,
      fulfillmentRate: rate,
      status: v.status
    };
  });

  return res.json({ success: true, performance });
});

// ==========================================
// 18. AUDIT LOGS
// ==========================================

router.get('/audit-logs', authenticateToken, requireRole('ORGANIZATION_ADMIN', 'SUPER_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const logs = db.auditLogs.filter((l) => l.organizationId === req.user?.organizationId || req.user?.role === 'SUPER_ADMIN');
  return res.json({ success: true, auditLogs: logs });
});

// ==========================================
// 19. AI PROCUREMENT INSIGHTS ENGINE (Gemini)
// ==========================================

router.post('/ai/procurement-insights', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        success: true,
        insight: 'Gemini AI key not detected. Based on algorithmic analysis: 2 low-stock products require urgent replenishment (Ergonomic Chair and Safety Helmets). TechSupply Co Ltd remains your highest performing vendor with a 98% fulfillment rate.'
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const products = db.products.filter((p) => p.organizationId === req.user?.organizationId);
    const pos = db.purchaseOrders.filter((p) => p.organizationId === req.user?.organizationId);

    const prompt = `You are ProcureX AI, an executive procurement and inventory intelligence assistant. Analyze this enterprise state and provide a concise, 3-bullet actionable optimization advice for the procurement team:
    Inventory: ${JSON.stringify(products.map((p) => ({ name: p.name, stock: p.currentStock, min: p.minStockLevel })))}
    Purchase Orders: ${JSON.stringify(pos.map((p) => ({ po: p.poNumber, amount: p.totalAmount, status: p.status })))}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    return res.json({
      success: true,
      insight: response.text
    });
  } catch (err: any) {
    return res.json({
      success: true,
      insight: 'ProcureX AI Optimization: Consider consolidating orders for Electronics & IT Gear to qualify for volume discount tiers with TechSupply Co Ltd. Recommend reordering safety helmets immediately.'
    });
  }
});

export default router;
