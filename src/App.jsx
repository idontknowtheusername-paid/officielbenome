
import React from 'react';
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
import ChatWidget from '@/components/ChatWidget';

// Layouts
import MainLayout from '@/layouts/MainLayout';
import { AdminLayout } from '@/layouts/AdminLayout';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import ProfilePage from '@/pages/auth/ProfilePage';
import AuthCallbackPage from '@/pages/auth/AuthCallbackPage';
import MessagingPage from '@/pages/MessagingPage';

// Pages
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



// Admin Pages
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminUsersPage from '@/pages/admin/users/UsersPage';
import AdminListingsPage from '@/pages/admin/listings/ListingsPage';
import AdminTransactionsPage from '@/pages/admin/transactions/TransactionsPage';
import AdminAnalyticsPage from '@/pages/admin/analytics/AnalyticsPage';
import AdminModerationPage from '@/pages/admin/moderation/ModerationPage';
import AdminCategoriesPage from '@/pages/admin/categories/CategoriesPage';
import AdminSettingsPage from '@/pages/admin/settings/SettingsPage';
import NewsletterAdminPage from '@/pages/admin/NewsletterAdminPage';
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
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<HomePage />} />
                  
                  {/* Auth Routes */}
                  <Route path="connexion" element={<LoginPage />} />
                  <Route path="inscription" element={<RegisterPage />} />
                  <Route path="auth/callback" element={<AuthCallbackPage />} />
                  <Route path="mot-de-passe-oublie" element={<ForgotPasswordPage />} />
                  <Route path="reinitialiser-mot-de-passe" element={<ResetPasswordPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  
                  {/* Messaging */}
                  <Route 
                    path="messages" 
                    element={
                      <ProtectedRoute>
                        <MessagingPage />
                      </ProtectedRoute>
                    } 
                  />
                  
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
                  
                  {/* Protected Admin Routes */}
                  <Route path="admin" element={<AdminLayout />}>
                    <Route 
                      index 
                      element={
                        <AdminRoute>
                          <AdminDashboardPage />
                        </AdminRoute>
                      } 
                    />
                    <Route 
                      path="users" 
                      element={
                        <AdminRoute>
                          <AdminUsersPage />
                        </AdminRoute>
                      } 
                    />
                    <Route 
                      path="listings" 
                      element={
                        <AdminRoute>
                          <AdminListingsPage />
                        </AdminRoute>
                      } 
                    />
                    <Route 
                      path="transactions" 
                      element={
                        <AdminRoute>
                          <AdminTransactionsPage />
                        </AdminRoute>
                      } 
                    />
                    <Route 
                      path="analytics" 
                      element={
                        <AdminRoute>
                          <AdminAnalyticsPage />
                        </AdminRoute>
                      } 
                    />
                    <Route 
                      path="newsletter" 
                      element={
                        <AdminRoute>
                          <NewsletterAdminPage />
                        </AdminRoute>
                      } 
                    />
                    <Route 
                      path="moderation" 
                      element={
                        <AdminRoute>
                          <AdminModerationPage />
                        </AdminRoute>
                      } 
                    />
                    <Route 
                      path="categories" 
                      element={
                        <AdminRoute>
                          <AdminCategoriesPage />
                        </AdminRoute>
                      } 
                    />
                    <Route 
                      path="settings" 
                      element={
                        <AdminRoute>
                          <AdminSettingsPage />
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
          <ChatWidget />
        </AppWrapper>
      </QueryErrorBoundary>
      {!import.meta.env.PROD && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;
