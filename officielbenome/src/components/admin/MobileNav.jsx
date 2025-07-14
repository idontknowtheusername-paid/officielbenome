import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  X,
  LayoutDashboard, 
  Users, 
  ListChecks, 
  BarChart2, 
  Settings, 
  LogOut,
  DollarSign,
  Shield,
  Tag
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const navigation = [
  { name: 'Tableau de bord', href: '/admin', icon: LayoutDashboard },
  { name: 'Utilisateurs', href: '/admin/users', icon: Users },
  { name: 'Annonces', href: '/admin/listings', icon: ListChecks },
  { name: 'Transactions', href: '/admin/transactions', icon: DollarSign },
  { name: 'Catégories', href: '/admin/categories', icon: Tag },
  { name: 'Rapports', href: '/admin/analytics', icon: BarChart2 },
  { name: 'Modération', href: '/admin/moderation', icon: Shield },
  { name: 'Paramètres', href: '/admin/settings', icon: Settings },
];

export function MobileNav({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      setSidebarOpen(false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <Transition.Root show={sidebarOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-40 flex md:hidden" onClose={setSidebarOpen}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </Transition.Child>
        
        <Transition.Child
          as={Fragment}
          enter="transition ease-in-out duration-300 transform"
          enterFrom="-translate-x-full"
          enterTo="translate-x-0"
          leave="transition ease-in-out duration-300 transform"
          leaveFrom="translate-x-0"
          leaveTo="-translate-x-full"
        >
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Fermer le menu</span>
                <X className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <h1 className="text-xl font-bold text-white">MaxiMarket Admin</h1>
              </div>
              
              <nav className="mt-5 px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={[
                      location.pathname === item.href
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                      'group flex items-center px-2 py-2 text-base font-medium rounded-md',
                    ].join(' ')}
                  >
                    <item.icon
                      className={[
                        'mr-4 flex-shrink-0 h-6 w-6',
                        location.pathname === item.href ? 'text-white' : 'text-slate-400 group-hover:text-white',
                      ].join(' ')}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            
            <div className="flex-shrink-0 flex border-t border-slate-800 p-4">
              <button
                onClick={handleLogout}
                className="flex-shrink-0 w-full group block"
              >
                <div className="flex items-center">
                  <div>
                    <LogOut
                      className="h-6 w-6 text-slate-400 group-hover:text-white"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-slate-300 group-hover:text-white">
                      Déconnexion
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </Transition.Child>
        
        <div className="flex-shrink-0 w-14">
          {/* Force sidebar to shrink to fit close icon */}
        </div>
      </Dialog>
    </Transition.Root>
  );
}
