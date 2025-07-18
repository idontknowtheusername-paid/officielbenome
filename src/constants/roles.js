// User roles
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  SELLER: 'seller',
  BUYER: 'buyer',
  USER: 'user',
  GUEST: 'guest',
};

// Role hierarchy (from highest to lowest)
export const ROLE_HIERARCHY = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.MODERATOR,
  ROLES.SELLER,
  ROLES.BUYER,
  ROLES.USER,
  ROLES.GUEST,
];

// Permissions
// Format: 'resource:action'
export const PERMISSIONS = {
  // User permissions
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_MANAGE: 'user:manage',
  
  // Profile permissions
  PROFILE_VIEW: 'profile:view',
  PROFILE_EDIT: 'profile:edit',
  
  // Listing permissions
  LISTING_CREATE: 'listing:create',
  LISTING_READ: 'listing:read',
  LISTING_UPDATE: 'listing:update',
  LISTING_DELETE: 'listing:delete',
  LISTING_MANAGE: 'listing:manage',
  
  // Category permissions
  CATEGORY_CREATE: 'category:create',
  CATEGORY_READ: 'category:read',
  CATEGORY_UPDATE: 'category:update',
  CATEGORY_DELETE: 'category:delete',
  
  // Transaction permissions
  TRANSACTION_CREATE: 'transaction:create',
  TRANSACTION_READ: 'transaction:read',
  TRANSACTION_UPDATE: 'transaction:update',
  TRANSACTION_DELETE: 'transaction:delete',
  TRANSACTION_MANAGE: 'transaction:manage',
  
  // Review permissions
  REVIEW_CREATE: 'review:create',
  REVIEW_READ: 'review:read',
  REVIEW_UPDATE: 'review:update',
  REVIEW_DELETE: 'review:delete',
  
  // Report permissions
  REPORT_CREATE: 'report:create',
  REPORT_READ: 'report:read',
  REPORT_UPDATE: 'report:update',
  REPORT_DELETE: 'report:delete',
  REPORT_MANAGE: 'report:manage',
  
  // Admin permissions
  ADMIN_DASHBOARD: 'admin:dashboard',
  ADMIN_SETTINGS: 'admin:settings',
  ADMIN_ANALYTICS: 'admin:analytics',
  ADMIN_USERS: 'admin:users',
  ADMIN_ROLES: 'admin:roles',
  ADMIN_PERMISSIONS: 'admin:permissions',
  
  // System permissions
  SYSTEM_BACKUP: 'system:backup',
  SYSTEM_RESTORE: 'system:restore',
  SYSTEM_UPDATE: 'system:update',
  SYSTEM_MAINTENANCE: 'system:maintenance',
};

// Role to permissions mapping
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    // All permissions
    '*'
  ],
  
  [ROLES.ADMIN]: [
    // User management
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_MANAGE,
    
    // Listing management
    PERMISSIONS.LISTING_READ,
    PERMISSIONS.LISTING_UPDATE,
    PERMISSIONS.LISTING_DELETE,
    PERMISSIONS.LISTING_MANAGE,
    
    // Category management
    PERMISSIONS.CATEGORY_CREATE,
    PERMISSIONS.CATEGORY_READ,
    PERMISSIONS.CATEGORY_UPDATE,
    PERMISSIONS.CATEGORY_DELETE,
    
    // Transaction management
    PERMISSIONS.TRANSACTION_READ,
    PERMISSIONS.TRANSACTION_MANAGE,
    
    // Report management
    PERMISSIONS.REPORT_READ,
    PERMISSIONS.REPORT_UPDATE,
    PERMISSIONS.REPORT_MANAGE,
    
    // Admin permissions
    PERMISSIONS.ADMIN_DASHBOARD,
    PERMISSIONS.ADMIN_ANALYTICS,
    PERMISSIONS.ADMIN_USERS,
    
    // System permissions (limited)
    PERMISSIONS.SYSTEM_BACKUP,
  ],
  
  [ROLES.MODERATOR]: [
    // User management (limited)
    PERMISSIONS.USER_READ,
    
    // Listing management (limited)
    PERMISSIONS.LISTING_READ,
    PERMISSIONS.LISTING_UPDATE,
    
    // Report management
    PERMISSIONS.REPORT_READ,
    PERMISSIONS.REPORT_UPDATE,
    
    // Admin permissions (limited)
    PERMISSIONS.ADMIN_DASHBOARD,
  ],
  
  [ROLES.SELLER]: [
    // Profile
    PERMISSIONS.PROFILE_VIEW,
    PERMISSIONS.PROFILE_EDIT,
    
    // Listing management (own)
    PERMISSIONS.LISTING_CREATE,
    PERMISSIONS.LISTING_READ,
    PERMISSIONS.LISTING_UPDATE,
    PERMISSIONS.LISTING_DELETE,
    
    // Transaction management (own)
    PERMISSIONS.TRANSACTION_CREATE,
    PERMISSIONS.TRANSACTION_READ,
    
    // Review management (own)
    PERMISSIONS.REVIEW_READ,
  ],
  
  [ROLES.BUYER]: [
    // Profile
    PERMISSIONS.PROFILE_VIEW,
    PERMISSIONS.PROFILE_EDIT,
    
    // Listing (read only)
    PERMISSIONS.LISTING_READ,
    
    // Transaction (own)
    PERMISSIONS.TRANSACTION_CREATE,
    PERMISSIONS.TRANSACTION_READ,
    
    // Review management (own)
    PERMISSIONS.REVIEW_CREATE,
    PERMISSIONS.REVIEW_READ,
    PERMISSIONS.REVIEW_UPDATE,
    PERMISSIONS.REVIEW_DELETE,
  ],
  
  [ROLES.USER]: [
    // Basic profile
    PERMISSIONS.PROFILE_VIEW,
    PERMISSIONS.PROFILE_EDIT,
    
    // Basic listing access
    PERMISSIONS.LISTING_READ,
  ],
  
  [ROLES.GUEST]: [
    // Very limited access
    PERMISSIONS.LISTING_READ,
  ],
};

// Helper functions
export const hasPermission = (user, requiredPermission) => {
  if (!user || !user.role) return false;
  
  // Super admin has all permissions
  if (user.role === ROLES.SUPER_ADMIN) return true;
  
  // Get user's permissions
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  
  // Check if user has the required permission or wildcard permission
  return userPermissions.includes(requiredPermission) || 
         userPermissions.includes('*') ||
         userPermissions.includes(`${requiredPermission.split(':')[0]}:*`);
};

export const hasAnyPermission = (user, requiredPermissions) => {
  return requiredPermissions.some(permission => hasPermission(user, permission));
};

export const hasAllPermissions = (user, requiredPermissions) => {
  return requiredPermissions.every(permission => hasPermission(user, permission));
};

export const hasHigherOrEqualRole = (user, requiredRole) => {
  if (!user || !user.role) return false;
  
  // Super admin has the highest role
  if (user.role === ROLES.SUPER_ADMIN) return true;
  
  const userRoleIndex = ROLE_HIERARCHY.indexOf(user.role);
  const requiredRoleIndex = ROLE_HIERARCHY.indexOf(requiredRole);
  
  // If either role is not found in hierarchy
  if (userRoleIndex === -1 || requiredRoleIndex === -1) return false;
  
  return userRoleIndex <= requiredRoleIndex;
};

export const isAdmin = (user) => {
  return hasHigherOrEqualRole(user, ROLES.ADMIN);
};

export const isModerator = (user) => {
  return hasHigherOrEqualRole(user, ROLES.MODERATOR);
};

export const isSeller = (user) => {
  return hasHigherOrEqualRole(user, ROLES.SELLER);
};

export const isBuyer = (user) => {
  return hasHigherOrEqualRole(user, ROLES.BUYER);
};

export const isAuthenticated = (user) => {
  return user && user.role && user.role !== ROLES.GUEST;
};

// Default export for convenience
export default {
  ROLES,
  ROLE_HIERARCHY,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasHigherOrEqualRole,
  isAdmin,
  isModerator,
  isSeller,
  isBuyer,
  isAuthenticated,
};
