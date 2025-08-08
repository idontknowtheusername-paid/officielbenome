
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AdminRoute, ProtectedRoute } from '@/components/ProtectedRoute';

import AppWrapper from '@/components/AppWrapper';

// Layouts
import MainLayout from '@/layouts/MainLayout';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import ProfilePage from '@/pages/auth/ProfilePage';
import MessagingPage from '@/pages/MessagingPage';

// Pages
import HomePage from '@/pages/HomePage'; 
import RealEstatePage from '@/pages/marketplace/RealEstatePage';
import AutomobilePage from '@/pages/marketplace/AutomobilePage';
import ServicesPage from '@/pages/marketplace/ServicesPage';
import GeneralMarketplacePage from '@/pages/marketplace/GeneralMarketplacePage';
import CreateListingPage from '@/pages/CreateListingPage';
// Admin Pages
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminUsersPage from '@/pages/admin/users/UsersPage';
import AdminListingsPage from '@/pages/admin/listings/ListingsPage';
import AdminTransactionsPage from '@/pages/admin/transactions/TransactionsPage';
import AdminAnalyticsPage from '@/pages/admin/analytics/AnalyticsPage';
import AdminModerationPage from '@/pages/admin/moderation/ModerationPage';
// import AdminSettingsPage from '@/pages/admin/settings/SettingsPage';
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

// Composant de test pour vérifier la configuration
const ConfigTest = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://your-project-id.supabase.co') {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f0f0f0',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h1 style={{ color: '#e74c3c' }}>⚠️ Configuration Supabase manquante</h1>
        <p>Veuillez configurer vos variables d'environnement dans le fichier <code>.env</code> :</p>
        <div style={{ 
          backgroundColor: '#fff', 
          padding: '15px', 
          borderRadius: '5px',
          margin: '10px 0',
          textAlign: 'left',
          fontFamily: 'monospace'
        }}>
          <div>VITE_SUPABASE_URL=votre-url-supabase</div>
          <div>VITE_SUPABASE_ANON_KEY=votre-clé-anon</div>
        </div>
        <p>1. Allez dans votre dashboard Supabase</p>
        <p>2. Copiez l'URL et la clé anonyme</p>
        <p>3. Remplacez les valeurs dans le fichier .env</p>
        <p>4. Redémarrez l'application</p>
      </div>
    );
  }
  
  return null;
};

function App() {
  return (
    <AppWrapper>
      <Router>
        <AuthProvider>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                
                {/* Auth Routes */}
                <Route path="connexion" element={<LoginPage />} />
                <Route path="inscription" element={<RegisterPage />} />
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
                
                {/* Protected Admin Routes */}
                <Route path="admin">
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
                    path="moderation" 
                    element={
                      <AdminRoute>
                        <AdminModerationPage />
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
      </Router>
      <Toaster />
    </AppWrapper>
  );
}

export default App;
