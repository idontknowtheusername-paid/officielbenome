// API route pour le cron Vercel
import { newsletterService } from '../../src/services/newsletter.service.js';
import { supabase } from '../../src/lib/supabase.js';

export default async function handler(req, res) {
  // Vérifier que c'est bien Vercel Cron qui appelle
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Récupérer les stats de la semaine
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const { count: newListings } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString());
    
    const { count: newUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString());
    
    // Envoyer la newsletter
    await newsletterService.sendWeeklyNewsletter({
      weekStart: weekAgo.toLocaleDateString('fr-FR'),
      newListings: newListings?.toString() || '0',
      activeUsers: '2.5k',
      transactions: '89',
      newUsers: newUsers?.toString() || '0'
    });
    
    return res.status(200).json({ success: true, message: 'Newsletter envoyée' });
  } catch (error) {
    console.error('Erreur newsletter:', error);
    return res.status(500).json({ error: error.message });
  }
}
