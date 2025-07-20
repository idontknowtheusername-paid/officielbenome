import { api } from './index';

// ==================== DASHBOARD ====================

export const getDashboardStats = async () => {
  const response = await api.get('/admin/dashboard/stats');
  return response.data;
};

export const getRecentActivities = async (limit = 10) => {
  const response = await api.get('/admin/dashboard/activities', {
    params: { limit }
  });
  return response.data;
};

// ==================== USERS ====================

export const getUsers = async (params = {}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await api.put(`/admin/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

export const banUser = async (userId, reason = '') => {
  const response = await api.post(`/admin/users/${userId}/ban`, { reason });
  return response.data;
};

export const unbanUser = async (userId) => {
  const response = await api.post(`/admin/users/${userId}/unban`);
  return response.data;
};

// ==================== LISTINGS ====================

export const getListings = async (params = {}) => {
  const response = await api.get('/admin/listings', { params });
  return response.data;
};

export const getListingById = async (listingId) => {
  const response = await api.get(`/admin/listings/${listingId}`);
  return response.data;
};

export const approveListing = async (listingId) => {
  const response = await api.post(`/admin/listings/${listingId}/approve`);
  return response.data;
};

export const rejectListing = async (listingId, reason = '') => {
  const response = await api.post(`/admin/listings/${listingId}/reject`, { reason });
  return response.data;
};

export const featureListing = async (listingId, featured = true) => {
  const response = await api.put(`/admin/listings/${listingId}/feature`, { featured });
  return response.data;
};

export const deleteListing = async (listingId) => {
  const response = await api.delete(`/admin/listings/${listingId}`);
  return response.data;
};

// ==================== TRANSACTIONS ====================

export const getTransactions = async (params = {}) => {
  const response = await api.get('/admin/transactions', { params });
  return response.data;
};

export const getTransactionById = async (transactionId) => {
  const response = await api.get(`/admin/transactions/${transactionId}`);
  return response.data;
};

export const refundTransaction = async (transactionId, amount, reason = '') => {
  const response = await api.post(`/admin/transactions/${transactionId}/refund`, {
    amount,
    reason
  });
  return response.data;
};

// ==================== ANALYTICS ====================

export const getAnalytics = async (params = {}) => {
  const response = await api.get('/admin/analytics', { params });
  return response.data;
};

export const getRevenueAnalytics = async (params = {}) => {
  const response = await api.get('/admin/analytics/revenue', { params });
  return response.data;
};

export const getUserAnalytics = async (params = {}) => {
  const response = await api.get('/admin/analytics/users', { params });
  return response.data;
};

export const getListingAnalytics = async (params = {}) => {
  const response = await api.get('/admin/analytics/listings', { params });
  return response.data;
};

// ==================== MODERATION ====================

export const getReportedContent = async (params = {}) => {
  const response = await api.get('/admin/moderation/reports', { params });
  return response.data;
};

export const getModerationStats = async () => {
  const response = await api.get('/admin/moderation/stats');
  return response.data;
};

export const getModerationLogs = async (params = {}) => {
  const response = await api.get('/admin/moderation/logs', { params });
  return response.data;
};

export const moderateContent = async (reportId, data) => {
  const response = await api.post(`/admin/moderation/reports/${reportId}/moderate`, data);
  return response.data;
};

// ==================== SETTINGS ====================

export const getSettings = async () => {
  const response = await api.get('/admin/settings');
  return response.data;
};

export const updateSettings = async (section, data) => {
  const response = await api.put(`/admin/settings/${section}`, data);
  return response.data;
};

export const testEmailConfig = async (config) => {
  const response = await api.post('/admin/settings/email/test', config);
  return response.data;
};

export const clearCache = async () => {
  const response = await api.post('/admin/settings/cache/clear');
  return response.data;
};

export const backupDatabase = async () => {
  const response = await api.get('/admin/settings/backup', {
    responseType: 'blob' // Important for file downloads
  });
  return response.data;
};

export const restoreDatabase = async (backupFile) => {
  const formData = new FormData();
  formData.append('backup', backupFile);
  
  const response = await api.post('/admin/settings/restore', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// ==================== NOTIFICATIONS ====================

export const sendNotification = async (data) => {
  const response = await api.post('/admin/notifications/send', data);
  return response.data;
};

export const getNotificationTemplates = async () => {
  const response = await api.get('/admin/notifications/templates');
  return response.data;
};

export const updateNotificationTemplate = async (templateId, content) => {
  const response = await api.put(`/admin/notifications/templates/${templateId}`, { content });
  return response.data;
};

// ==================== ROLES & PERMISSIONS ====================

export const getRoles = async () => {
  const response = await api.get('/admin/roles');
  return response.data;
};

export const createRole = async (roleData) => {
  const response = await api.post('/admin/roles', roleData);
  return response.data;
};

export const updateRole = async (roleId, roleData) => {
  const response = await api.put(`/admin/roles/${roleId}`, roleData);
  return response.data;
};

export const deleteRole = async (roleId) => {
  const response = await api.delete(`/admin/roles/${roleId}`);
  return response.data;
};

export const getPermissions = async () => {
  const response = await api.get('/admin/permissions');
  return response.data;
};

// ==================== SYSTEM ====================

export const getSystemStatus = async () => {
  const response = await api.get('/admin/system/status');
  return response.data;
};

export const getSystemLogs = async (params = {}) => {
  const response = await api.get('/admin/system/logs', { params });
  return response.data;
};

export const clearSystemLogs = async (daysToKeep = 30) => {
  const response = await api.delete('/admin/system/logs', {
    params: { daysToKeep }
  });
  return response.data;
};

export const getServerMetrics = async () => {
  const response = await api.get('/admin/system/metrics');
  return response.data;
};

// ==================== IMPORT/EXPORT ====================

export const exportData = async (dataType, format = 'json', filters = {}) => {
  const response = await api.get(`/admin/export/${dataType}`, {
    params: { format, ...filters },
    responseType: format === 'csv' ? 'blob' : 'json'
  });
  return response.data;
};

export const importData = async (dataType, file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  
  if (options.mapping) {
    formData.append('mapping', JSON.stringify(options.mapping));
  }
  
  const response = await api.post(`/admin/import/${dataType}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    params: options
  });
  
  return response.data;
};

// ==================== API KEYS ====================

export const getApiKeys = async () => {
  const response = await api.get('/admin/api-keys');
  return response.data;
};

export const createApiKey = async (keyData) => {
  const response = await api.post('/admin/api-keys', keyData);
  return response.data;
};

export const revokeApiKey = async (keyId) => {
  const response = await api.delete(`/admin/api-keys/${keyId}`);
  return response.data;
};

// ==================== WEBHOOKS ====================

export const getWebhooks = async () => {
  const response = await api.get('/admin/webhooks');
  return response.data;
};

export const createWebhook = async (webhookData) => {
  const response = await api.post('/admin/webhooks', webhookData);
  return response.data;
};

export const updateWebhook = async (webhookId, webhookData) => {
  const response = await api.put(`/admin/webhooks/${webhookId}`, webhookData);
  return response.data;
};

export const deleteWebhook = async (webhookId) => {
  const response = await api.delete(`/admin/webhooks/${webhookId}`);
  return response.data;
};

export const testWebhook = async (webhookId, payload = {}) => {
  const response = await api.post(`/admin/webhooks/${webhookId}/test`, payload);
  return response.data;
};

// ==================== TASKS ====================

export const getScheduledTasks = async () => {
  const response = await api.get('/admin/tasks');
  return response.data;
};

export const runTask = async (taskId) => {
  const response = await api.post(`/admin/tasks/${taskId}/run`);
  return response.data;
};

export const toggleTask = async (taskId, enabled) => {
  const response = await api.put(`/admin/tasks/${taskId}/toggle`, { enabled });
  return response.data;
};

// ==================== UPDATES ====================

export const checkForUpdates = async () => {
  const response = await api.get('/admin/updates/check');
  return response.data;
};

export const applyUpdates = async (updates) => {
  const response = await api.post('/admin/updates/apply', { updates });
  return response.data;
};
