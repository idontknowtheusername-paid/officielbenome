import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { MobileNav } from '@/components/admin/MobileNav';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function AdminLayout() {
  const { user, hasRole, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/connexion', { state: { from: '/admin' }, replace: true });
      } else if (!hasRole('admin')) {
        navigate('/', { replace: true });
      }
    }
  }, [user, authLoading, hasRole, navigate]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
      {/* Mobile sidebar */}
      <MobileNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Desktop sidebar */}
      <AdminSidebar className="hidden md:flex" />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-slate-800 border-b border-slate-700 flex items-center justify-between p-4">
          <button
            type="button"
            className="md:hidden text-slate-400 hover:text-white focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Ouvrir le menu</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center space-x-4">
            <button className="p-1 rounded-full text-slate-400 hover:text-white focus:outline-none">
              <span className="sr-only">Notifications</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            
            <div className="relative">
              <button className="flex items-center space-x-2 focus:outline-none">
                <span className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-700 text-sm font-medium text-white">
                  {user?.name?.charAt(0) || 'A'}
                </span>
                <span className="hidden md:inline-flex items-center">
                  <span className="text-sm font-medium text-slate-300">{user?.name || 'Admin'}</span>
                  <svg className="ml-2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto bg-slate-900 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
