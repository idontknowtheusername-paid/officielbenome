import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, MessageSquare, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMessageStats } from '@/hooks/useMessages';
import { useAppMode } from '@/hooks/useAppMode';

const BottomNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Utiliser le hook pour détecter le mode app (native ou PWA)
  const { isAppMode } = useAppMode();

  // Récupérer le nombre de messages non lus
  const { data: messageStats } = useMessageStats();
  const unreadCount = messageStats?.unread || 0;

  // Fonction utilitaire pour vérifier si un onglet est actif
  const isActive = (path) => location.pathname === path;

  // Ne pas afficher sur le web (uniquement sur app native ou PWA installée)
  if (!isAppMode) {
    return null;
  }

  return (
    <>
      {/* Styles CSS injectés localement pour ce composant unique */}
      <style>{`
        :root {
          --glass-bg: rgba(15, 23, 42, 0.90);
          --glass-border: rgba(255, 255, 255, 0.1);
          --nav-height: 70px;
        }

        .nav-container {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          width: 92%;
          max-width: 450px;
          z-index: 50;
          /* Gestion Safe Area pour iPhone récents */
          padding-bottom: env(safe-area-inset-bottom);
        }

        .bottom-nav {
          background: var(--glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          height: var(--nav-height);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 12px;
          box-shadow: 
            0 20px 40px -10px rgba(15, 23, 42, 0.5),
            inset 0 1px 1px rgba(255, 255, 255, 0.1);
        }

        .nav-item {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 100%;
          color: #94a3b8; /* text-inactive */
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .nav-item.active { color: #ffffff; }

        /* Animation icône */
        .nav-item svg {
          transition: all 0.3s ease;
        }
        .nav-item.active svg {
          transform: translateY(-8px);
          stroke: #60a5fa; /* Bleu néon */
          filter: drop-shadow(0 0 8px rgba(96, 165, 250, 0.6));
        }

        /* Label */
        .nav-item span.label {
          font-size: 10px;
          font-weight: 600;
          margin-top: 4px;
          opacity: 0;
          transform: translateY(5px);
          transition: all 0.3s ease;
          position: absolute;
          bottom: 8px;
        }
        .nav-item.active span.label {
          opacity: 1;
          transform: translateY(0);
        }

        /* Indicateur lumineux */
        .nav-item.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          width: 20px;
          height: 3px;
          background: #60a5fa;
          border-radius: 4px 4px 0 0;
          box-shadow: 0 -2px 10px rgba(96, 165, 250, 0.8);
        }

        /* FAB CENTRAL (M+) */
        .fab-wrapper {
          position: relative;
          top: -25px;
          width: 64px;
          height: 64px;
          display: flex;
          justify-content: center;
          z-index: 51;
        }

        .fab {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #60a5fa 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 
            0 15px 35px -10px rgba(37, 99, 235, 0.7),
            inset 0 2px 4px rgba(255,255,255,0.4),
            inset 0 -2px 4px rgba(0,0,0,0.1);
          transform: rotate(45deg);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: 4px solid #f1f5f9; /* Couleur du fond de l'app (à ajuster si dark mode) */
        }
        
        .dark .fab { border-color: #0f172a; } /* Support Dark Mode */

        .fab:active { transform: rotate(45deg) scale(0.92); }

        .fab-content {
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 3px; 
          margin-top: 3px;
        }

        /* LOGO M+ */
        .logo-stack {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .letter-m {
          font-family: 'Arial Black', 'Arial', sans-serif;
          font-weight: 900;
          font-size: 32px;
          color: white;
          line-height: 1;
          letter-spacing: -1.5px;
        }

        .symbol-plus {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -45%);
          font-family: sans-serif;
          font-size: 24px;
          font-weight: 900;
          color: #ffffff;
          text-shadow: 
            0 2px 4px rgba(0, 0, 0, 0.3),
            -1.5px -1.5px 0 #1e3a5f,  
             1.5px -1.5px 0 #1e3a5f,
            -1.5px  1.5px 0 #1e3a5f,
             1.5px  1.5px 0 #1e3a5f;
        }

        /* Animation Pulse */
        .fab::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background: inherit;
          border-radius: inherit;
          z-index: -1;
          opacity: 0.4;
          animation: pulse 2.5s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.3); opacity: 0; }
        }

        .badge-dot {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #ef4444;
          border: 2px solid rgba(15, 23, 42, 0.9);
          color: white;
          font-size: 10px;
          font-weight: 700;
          min-width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>

      <div className="nav-container">
        <nav className="bottom-nav">

          {/* 1. ACCUEIL */}
          <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
            <Home size={24} strokeWidth={2} />
            <span className="label">Accueil</span>
          </Link>

          {/* 2. CATÉGORIES */}
          <Link to="/categories" className={`nav-item ${isActive('/categories') ? 'active' : ''}`}>
            <Grid size={24} strokeWidth={2} />
            <span className="label">Categorie</span>
          </Link>

          {/* 3. FAB CENTRAL (M+) */}
          <div className="fab-wrapper">
            <Link to="/creer-annonce" className="fab">
              <div className="fab-content">
                <div className="logo-stack">
                  <span className="letter-m">M</span>
                  <span className="symbol-plus">+</span>
                </div>
              </div>
            </Link>
          </div>

          {/* 4. MESSAGES */}
          <Link to="/messages" className={`nav-item ${isActive('/messages') ? 'active' : ''}`}>
            <div className="relative">
              <MessageSquare size={24} strokeWidth={2} />
              {unreadCount > 0 && (
                <div className="badge-dot">{unreadCount}</div>
              )}
            </div>
            <span className="label">Chat</span>
          </Link>

          {/* 5. COMPTE (Logique conditionnelle) */}
          <Link
            to={user ? "/profile" : "/connexion"}
            className={`nav-item ${isActive('/profile') || isActive('/connexion') ? 'active' : ''}`}
          >
            <User size={24} strokeWidth={2} />
            <span className="label">{user ? 'Profil' : 'Login'}</span>
          </Link>

        </nav>
      </div>
    </>
  );
};

export default BottomNavigation;