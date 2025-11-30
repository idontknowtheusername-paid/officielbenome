// API route pour le cron mensuel
import { newsletterService } from '../../src/services/newsletter.service.js';

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const month = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    
    await newsletterService.sendMonthlyNewsletter({
      month,
      totalListings: '1,250',
      totalUsers: '5,200',
      totalTransactions: '450'
    });
    
    return res.status(200).json({ success: true, message: 'Newsletter mensuelle envoyée' });
  } catch (error) {
    console.error('Erreur newsletter:', error);
    return res.status(500).json({ error: error.message });
  }
}
