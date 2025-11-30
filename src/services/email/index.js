// ============================================================================
// INDEX DES SERVICES EMAIL - MAXIMARKET
// ============================================================================

// Services Brevo
export { brevoService } from './brevo.service.js';
export { brevoCampaignsService } from './brevo-campaigns.service.js';
export { brevoListsService } from './brevo-lists.service.js';
export { 
  BREVO_TEMPLATE_IDS,
  getTemplateParams,
  getBrevoTemplateId,
  templateExists,
  getAvailableTemplates
} from './brevo-templates.service.js';

// Service d'abstraction (provider principal)
export { emailProviderService } from './email-provider.service.js';

// Export par défaut du provider
export default emailProviderService;
