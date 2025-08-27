
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
import { swManager } from '@/lib/swManager';

import { QueryErrorBoundary } from '@/components/QueryErrorBoundary';
import InactivityDetector from '@/components/InactivityDetector';

import AppWrapper from '@/components/AppWrapper';
// ChatWidget en lazy loading
const ChatWidget = lazy(() => import('@/components/ChatWidget'));

// Layouts
import MainLayout from '@/layouts/MainLayout';
const AdminLayout = lazy(() => import('@/layouts/AdminLayout'));

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import ProfilePage from '@/pages/auth/ProfilePage';
import AuthCallbackPage from '@/pages/auth/AuthCallbackPage';
const MessagingPage = lazy(() => import('@/pages/MessagingPage'));

// Pages principales (chargées immédiatement)
import HomePage from '@/pages/HomePage'; 
import RealEstatePage from '@/pages/marketplace/RealEstatePage';
import AutomobilePage from '@/pages/marketplace/AutomobilePage';
import ServicesPage from '@/pages/marketplace/ServicesPage';
import GeneralMarketplacePage from '@/pages/marketplace/GeneralMarketplacePage';
import PremiumPage from '@/pages/PremiumPage';
import CreateListingPage from '@/pages/CreateListingPage';
import ListingDetailPage from '@/pages/ListingDetailPage';
import FavoritesPage from '@/pages/FavoritesPage';
import BoostListingPage from '@/pages/BoostListingPage';
import PaymentProcessPage from '@/pages/PaymentProcessPage';
import PaymentCallbackPage from '@/pages/PaymentCallbackPage';
import FedaPayTestPage from '@/pages/FedaPayTestPage';

// Admin Pages - Lazy Loading
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('@/pages/admin/users/UsersPage'));
const AdminListingsPage = lazy(() => import('@/pages/admin/listings/ListingsPage'));
const AdminTransactionsPage = lazy(() => import('@/pages/admin/transactions/TransactionsPage'));
const AdminAnalyticsPage = lazy(() => import('@/pages/admin/analytics/AnalyticsPage'));
const AdminModerationPage = lazy(() => import('@/pages/admin/moderation/ModerationPage'));
const AdminCategoriesPage = lazy(() => import('@/pages/admin/categories/CategoriesPage'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/settings/SettingsPage'));
const NewsletterAdminPage = lazy(() => import('@/pages/admin/NewsletterAdminPage'));
import NotFoundPage from '@/pages/NotFoundPage';

// Static Pages
import AboutPage from '@/pages/AboutPage'; 
import ContactPage from '@/pages/ContactPage'; 
import CareersPage from '@/pages/static/CareersPage';
import PressPage from '@/pages/static/PressPage';
import HelpCenterPage from '@/pages/static/HelpCenterPage';
import FAQPage from '@/pages/static/FAQPage';
import PrivacyPolicyPage from '@/pages/static/PrivacyPolicyPage';
import TermsConditionsPage from '@/pages/static/TermsConditionsPage';

// Blog/Content Pages
import BlogPage from '@/pages/BlogPage'; 
import BlogPostPage from '@/pages/BlogPostPage';

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

  return (
    <QueryClientProvider client={queryClient}>
      <QueryErrorBoundary>
        <AppWrapper>
          <AuthProvider>
            <InactivityDetector />
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
                  
                  {/* Auth Routes */}
                  <Route path="connexion" element={<LoginPage />} />
                  <Route path="inscription" element={<RegisterPage />} />
                  <Route path="auth/callback" element={<AuthCallbackPage />} />
                  <Route path="mot-de-passe-oublie" element={<ForgotPasswordPage />} />
                  <Route path="reinitialiser-mot-de-passe" element={<ResetPasswordPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  
                  {/* Marketplace Sections */}
                  <Route path="immobilier" element={<RealEstatePage />} />
                  <Route path="automobile" element={<AutomobilePage />} />
                  <Route path="services" element={<ServicesPage />} />
                  <Route path="marketplace" element={<GeneralMarketplacePage />} />
                  <Route path="premium" element={<PremiumPage />} />
                  
                  {/* Création d'annonce */}
                  <Route 
                    path="creer-annonce" 
                    element={
                      <ProtectedRoute>
                        <CreateListingPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="creer-annonce/:category" 
                    element={
                      <ProtectedRoute>
                        <CreateListingPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="create-listing" 
                    element={
                      <ProtectedRoute>
                        <CreateListingPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Détails d'annonce */}
                  <Route path="annonce/:id" element={<ListingDetailPage />} />
                  
                  {/* Booster une annonce */}
                  <Route 
                    path="booster-annonce/:id" 
                    element={
                      <ProtectedRoute>
                        <BoostListingPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Paiement pour boost */}
                  <Route 
                    path="paiement/:boostId" 
                    element={
                      <ProtectedRoute>
                        <PaymentProcessPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Callback de paiement */}
                  <Route path="payment-callback" element={<PaymentCallbackPage />} />
                  
                  {/* Test FedaPay */}
                  <Route path="fedapay-test" element={<FedaPayTestPage />} />
                  
                  {/* Modifier une annonce */}
                  <Route 
                    path="annonce/:id/modifier" 
                    element={
                      <ProtectedRoute>
                        <CreateListingPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Favoris */}
                  <Route 
                    path="favorites" 
                    element={
                      <ProtectedRoute>
                        <FavoritesPage />
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
                  </Route>
                  
                  {/* Static Pages */}
                  <Route path="a-propos" element={<AboutPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="carrieres" element={<CareersPage />} />
                  <Route path="presse" element={<PressPage />} />
                  <Route path="aide" element={<HelpCenterPage />} />
                  <Route path="faq" element={<FAQPage />} />
                  <Route path="politique-confidentialite" element={<PrivacyPolicyPage />} />
                  <Route path="conditions-utilisation" element={<TermsConditionsPage />} />
                  
                  {/* Blog Routes */}
                  <Route path="blog" element={<BlogPage />} />
                  <Route path="blog/:id" element={<BlogPostPage />} />
                  
                  {/* 404 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </AnimatePresence>
          </AuthProvider>
          <Toaster />
          {/* ChatWidget en lazy loading */}
          <Suspense fallback={<ChatLoadingSpinner />}>
            <ChatWidget />
          </Suspense>
        </AppWrapper>
      </QueryErrorBoundary>
      {!import.meta.env.PROD && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;
