import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/toaster';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from '@/contexts/AuthContext';
import { AdminRoute, ProtectedRoute } from '@/components/ProtectedRoute';
import { queryClient } from '@/lib/queryClient';
import { usePreload } from '@/hooks/usePreload';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import { swManager } from '@/lib/swManager';
import { initializePushNotifications } from '@/services/pushNotifications.service';
import { Analytics } from '@vercel/analytics/react';

import { QueryErrorBoundary } from '@/components/QueryErrorBoundary';
import InactivityDetector from '@/components/InactivityDetector';
import { MobileNavigation } from '@/components/MobileNavigation';
import BottomNavigation from '@/components/BottomNavigation';

import AppWrapper from '@/components/AppWrapper';

// ChatWidget - Lazy Loading (chargé après le rendu initial)
const ChatWidget = lazy(() => import('@/components/ChatWidget'));

// Layouts
import MainLayout from '@/layouts/MainLayout';
const AdminLayout = lazy(() => import('@/layouts/AdminLayout'));

// Auth Pages (chargées immédiatement - critiques pour le parcours utilisateur)
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// Auth Pages - Lazy Loading (rarement utilisées)
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const AuthCallbackPage = lazy(() => import('@/pages/auth/AuthCallbackPage'));
const ProfilePage = lazy(() => import('@/pages/auth/ProfilePage'));
const MessagingPage = lazy(() => import('@/pages/MessagingPage'));
const DiagnosticPage = lazy(() => import('@/pages/DiagnosticPage'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));

// Pages principales (chargées immédiatement - navigation fréquente)
import HomePage from '@/pages/HomePage';
import CategoriesPage from '@/pages/CategoriesPage';
import RealEstatePage from '@/pages/marketplace/RealEstatePage';
import AutomobilePage from '@/pages/marketplace/AutomobilePage';
import ServicesPage from '@/pages/marketplace/ServicesPage';
import GeneralMarketplacePage from '@/pages/marketplace/GeneralMarketplacePage';
import PremiumPage from '@/pages/PremiumPage';
import ListingDetailPage from '@/pages/ListingDetailPage';
import PaymentCallbackPage from '@/pages/PaymentCallbackPage';

// Pages protégées - Lazy Loading (après connexion)
const CreateListingPage = lazy(() => import('@/pages/CreateListingPage'));
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'));
const BoostListingPage = lazy(() => import('@/pages/BoostListingPage'));
const PaymentProcessPage = lazy(() => import('@/pages/PaymentProcessPage'));
const BoostPage = lazy(() => import('@/pages/BoostPage'));
const BoostPaymentPage = lazy(() => import('@/pages/payment/BoostPaymentPage'));
const UserTransactionsPage = lazy(() => import('@/pages/UserTransactionsPage'));

// Pages de test - Lazy Loading
const FedaPayTestPage = lazy(() => import('@/pages/FedaPayTestPage'));
const MobileTestPage = lazy(() => import('@/pages/MobileTestPage'));

// Admin Pages - Lazy Loading
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('@/pages/admin/users/UsersPage'));
const AdminListingsPage = lazy(() => import('@/pages/admin/listings/ListingsPage'));
const AdminTransactionsPage = lazy(() => import('@/pages/admin/transactions/TransactionsPage'));
const AdminAnalyticsPage = lazy(() => import('@/pages/admin/analytics/AnalyticsPage'));
const AdminModerationPage = lazy(() => import('@/pages/admin/moderation/ModerationPage'));
const AdminCategoriesPage = lazy(() => import('@/pages/admin/categories/CategoriesPage'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/settings/SettingsPage'));
const AdminBoostsPage = lazy(() => import('@/pages/admin/boosts/BoostsManagementPage'));
const NewsletterAdminPage = lazy(() => import('@/pages/admin/NewsletterAdminPage'));

// Pages utilitaires - Lazy Loading
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const CareersPage = lazy(() => import('@/pages/static/CareersPage'));
const PressPage = lazy(() => import('@/pages/static/PressPage'));
const HelpCenterPage = lazy(() => import('@/pages/static/HelpCenterPage'));
const FAQPage = lazy(() => import('@/pages/static/FAQPage'));
const PrivacyPolicyPage = lazy(() => import('@/pages/static/PrivacyPolicyPage'));
const TermsConditionsPage = lazy(() => import('@/pages/static/TermsConditionsPage'));

// Blog/Content Pages - Lazy Loading
const BlogPage = lazy(() => import('@/pages/BlogPage'));
const BlogPostPage = lazy(() => import('@/pages/BlogPostPage'));

// Composant de chargement optimisé
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Composant de chargement pour les pages admin
const AdminLoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px] bg-background">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    <span className="ml-3 text-muted-foreground">Chargement de l'interface admin...</span>
  </div>
);

// Composant de chargement pour le ChatWidget
const ChatLoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
    <span className="ml-2 text-sm text-muted-foreground">Chargement d'AIDA...</span>
  </div>
);

function App() {
  // Enregistrer le Service Worker
  React.useEffect(() => {
    swManager.register();
  }, []);

  // Initialiser les notifications push
  React.useEffect(() => {
    initializePushNotifications();
  }, []);

  // --- GESTION DU SPLASH SCREEN (AJOUTÉ) ---
  React.useEffect(() => {
    // Dès que React est prêt (le composant App est monté)
    const splash = document.getElementById('splash-screen');
    
    if (splash) {
      // 1. On lance l'animation de disparition (fade out)
      splash.style.opacity = '0';
      splash.style.visibility = 'hidden';
      
      // 2. On le supprime complètement du HTML après 0.5s (le temps de la transition CSS)
      setTimeout(() => {
        if (splash.parentNode) {
          splash.parentNode.removeChild(splash);
        }
      }, 500);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <QueryErrorBoundary>
        <AppWrapper>
          <AuthProvider>
            <InactivityDetector />
            <MobileNavigation />
            <BottomNavigation />
            <AnimatePresence mode="wait">
              <Routes>
                {/* Messaging - Route séparée sans layout */}
                <Route 
                  path="messages" 
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingSpinner />}>
                        <MessagingPage />
                      </Suspense>
                    </ProtectedRoute>
                  } 
                />
                
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="categories" element={<CategoriesPage />} />
                  
                  {/* Auth Routes */}
                  <Route path="connexion" element={<LoginPage />} />
                  <Route path="inscription" element={<RegisterPage />} />
                  <Route path="auth/callback" element={<Suspense fallback={<LoadingSpinner />}><AuthCallbackPage /></Suspense>} />
                  <Route path="mot-de-passe-oublie" element={<Suspense fallback={<LoadingSpinner />}><ForgotPasswordPage /></Suspense>} />
                  <Route path="reinitialiser-mot-de-passe" element={<Suspense fallback={<LoadingSpinner />}><ResetPasswordPage /></Suspense>} />
                  <Route path="profile" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <ProfilePage />
                    </Suspense>
                  } />
                  
                  {/* Marketplace Sections */}
                  <Route path="immobilier" element={<RealEstatePage />} />
                  <Route path="automobile" element={<AutomobilePage />} />
                  <Route path="services" element={<ServicesPage />} />
                  <Route path="marketplace" element={<GeneralMarketplacePage />} />
                  <Route path="premium" element={<PremiumPage />} />
                  
                  {/* Création d'annonce - Lazy */}
                  <Route 
                    path="creer-annonce" 
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingSpinner />}>
                          <CreateListingPage />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="creer-annonce/:category" 
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingSpinner />}>
                          <CreateListingPage />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="create-listing" 
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingSpinner />}>
                          <CreateListingPage />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Détails d'annonce */}
                  <Route path="annonce/:id" element={<ListingDetailPage />} />
                  
                  {/* Booster une annonce - Lazy */}
                  <Route 
                    path="booster-annonce/:id" 
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingSpinner />}>
                          <BoostListingPage />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Paiement pour boost - Nouveau système Lygos - Lazy */}
                  <Route
                    path="paiement/boost/:listingId"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingSpinner />}>
                          <BoostPaymentPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />

                  {/* Paiement pour boost - Ancien système - Lazy */}
                  <Route 
                    path="paiement/:boostId" 
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingSpinner />}>
                          <PaymentProcessPage />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Callback de paiement */}
                  <Route path="payment-callback" element={<PaymentCallbackPage />} />
                  
                  {/* Test FedaPay - Lazy */}
                  <Route path="fedapay-test" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <FedaPayTestPage />
                    </Suspense>
                  } />
                  
                  {/* Tests Mobile - Lazy */}
                  <Route path="mobile-tests" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <MobileTestPage />
                    </Suspense>
                  } />
                  
                  {/* Route de diagnostic temporaire */}
                  <Route path="diagnostic" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <DiagnosticPage />
                    </Suspense>
                  } />
                  
                  {/* Modifier une annonce - Lazy */}
                  <Route 
                    path="annonce/:id/modifier" 
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingSpinner />}>
                          <CreateListingPage />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Favoris - Lazy */}
                  <Route 
                    path="favorites" 
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingSpinner />}>
                          <FavoritesPage />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Boost - Liste des annonces à booster - Lazy */}
                  <Route
                    path="boost"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingSpinner />}>
                          <BoostPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />

                  {/* Transactions utilisateur - Lazy */}
                  <Route
                    path="transactions"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingSpinner />}>
                          <UserTransactionsPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />

                  {/* Notifications - Lazy */}
                  <Route
                    path="notifications"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingSpinner />}>
                          <NotificationsPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected Admin Routes - Lazy Loading */}
                  <Route path="admin" element={
                    <Suspense fallback={<AdminLoadingSpinner />}>
                      <AdminLayout />
                    </Suspense>
                  }>
                    <Route 
                      index 
                      element={
                        <AdminRoute>
                          <Suspense fallback={<AdminLoadingSpinner />}>
                            <AdminDashboardPage />
                          </Suspense>
                        </AdminRoute>
                      } 
                    />
                    <Route 
                      path="users" 
                      element={
                        <AdminRoute>
                          <Suspense fallback={<AdminLoadingSpinner />}>
                            <AdminUsersPage />
                          </Suspense>
                        </AdminRoute>
                      } 
                    />
                    <Route 
                      path="listings" 
                      element={
                        <AdminRoute>
                          <Suspense fallback={<AdminLoadingSpinner />}>
                            <AdminListingsPage />
                          </Suspense>
                        </AdminRoute>
                      } 
                    />
                    <Route 
                      path="transactions" 
                      element={
                        <AdminRoute>
                          <Suspense fallback={<AdminLoadingSpinner />}>
                            <AdminTransactionsPage />
                          </Suspense>
                        </AdminRoute>
                      } 
                    />
                    <Route
                      path="analytics"
                      element={
                        <AdminRoute>
                          <Suspense fallback={<AdminLoadingSpinner />}>
                            <AdminAnalyticsPage />
                          </Suspense>
                        </AdminRoute>
                      }
                    />
                    <Route 
                      path="newsletter" 
                      element={
                        <AdminRoute>
                          <Suspense fallback={<AdminLoadingSpinner />}>
                            <NewsletterAdminPage />
                          </Suspense>
                        </AdminRoute>
                      } 
                    />
                    <Route 
                      path="moderation" 
                      element={
                        <AdminRoute>
                          <Suspense fallback={<AdminLoadingSpinner />}>
                            <AdminModerationPage />
                          </Suspense>
                        </AdminRoute>
                      } 
                    />
                    <Route 
                      path="categories" 
                      element={
                        <AdminRoute>
                          <Suspense fallback={<AdminLoadingSpinner />}>
                            <AdminCategoriesPage />
                          </Suspense>
                        </AdminRoute>
                      } 
                    />
                    <Route 
                      path="settings" 
                      element={
                        <AdminRoute>
                          <Suspense fallback={<AdminLoadingSpinner />}>
                            <AdminSettingsPage />
                          </Suspense>
                        </AdminRoute>
                      } 
                    />
                    <Route
                      path="boosts"
                      element={
                        <AdminRoute>
                          <Suspense fallback={<AdminLoadingSpinner />}>
                            <AdminBoostsPage />
                          </Suspense>
                        </AdminRoute>
                      }
                    />
                  </Route>
                  
                  {/* Static Pages - Lazy */}
                  <Route path="a-propos" element={<Suspense fallback={<LoadingSpinner />}><AboutPage /></Suspense>} />
                  <Route path="contact" element={<Suspense fallback={<LoadingSpinner />}><ContactPage /></Suspense>} />
                  <Route path="carrieres" element={<Suspense fallback={<LoadingSpinner />}><CareersPage /></Suspense>} />
                  <Route path="presse" element={<Suspense fallback={<LoadingSpinner />}><PressPage /></Suspense>} />
                  <Route path="aide" element={<Suspense fallback={<LoadingSpinner />}><HelpCenterPage /></Suspense>} />
                  <Route path="faq" element={<Suspense fallback={<LoadingSpinner />}><FAQPage /></Suspense>} />
                  <Route path="politique-confidentialite" element={<Suspense fallback={<LoadingSpinner />}><PrivacyPolicyPage /></Suspense>} />
                  <Route path="conditions-utilisation" element={<Suspense fallback={<LoadingSpinner />}><TermsConditionsPage /></Suspense>} />
                  
                  {/* Blog Routes - Lazy */}
                  <Route path="blog" element={<Suspense fallback={<LoadingSpinner />}><BlogPage /></Suspense>} />
                  <Route path="blog/:id" element={<Suspense fallback={<LoadingSpinner />}><BlogPostPage /></Suspense>} />
                  
                  {/* 404 */}
                  <Route path="*" element={<Suspense fallback={<LoadingSpinner />}><NotFoundPage /></Suspense>} />
                </Route>
              </Routes>
            </AnimatePresence>
          </AuthProvider>
          <Toaster />
          {/* ChatWidget - Lazy Loading (ne bloque pas le rendu initial) */}
          <Suspense fallback={null}>
            <ChatWidget />
          </Suspense>
        </AppWrapper>
      </QueryErrorBoundary>
      {!import.meta.env.PROD && <ReactQueryDevtools initialIsOpen={false} />}
      <Analytics />
    </QueryClientProvider>
  );
}

export default App;
