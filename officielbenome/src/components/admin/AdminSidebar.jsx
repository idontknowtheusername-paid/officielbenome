import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ListChecks, 
  BarChart2, 
  Settings, 
  LogOut,
  DollarSign,
  Shield,
  FileText,
  Bell,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Tableau de bord', href: '/admin', icon: LayoutDashboard },
  { name: 'Utilisateurs', href: '/admin/users', icon: Users },
  { name: 'Annonces', href: '/admin/listings', icon: ListChecks },
  { name: 'Transactions', href: '/admin/transactions', icon: DollarSign },
  { name: 'Catégories', href: '/admin/categories', icon: Tag },
  { name: 'Rapports', href: '/admin/analytics', icon: BarChart2 },
  { name: 'Modération', href: '/admin/moderation', icon: Shield },
  { name: 'Paramètres', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar({ className }) {
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className={cn("hidden md:flex md:flex-col md:w-64 bg-slate-900 border-r border-slate-800 min-h-screen", className)}>
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white">Benome Admin</h2>
      </div>
      
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              'flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors',
              location.pathname === item.href
                ? 'bg-slate-800 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-800">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
}
