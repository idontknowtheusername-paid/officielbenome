
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from '@/contexts/AuthContext';

// Layouts
import MainLayout from '@/layouts/MainLayout';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import ProfilePage from '@/pages/auth/ProfilePage';

// Pages
import HomePage from '@/pages/HomePage'; 
import RealEstatePage from '@/pages/marketplace/RealEstatePage';
import AutomobilePage from '@/pages/marketplace/AutomobilePage';
import ServicesPage from '@/pages/marketplace/ServicesPage';
import GeneralMarketplacePage from '@/pages/marketplace/GeneralMarketplacePage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'; 
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
  return (
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
              
              {/* Marketplace Sections */}
              <Route path="immobilier" element={<RealEstatePage />} />
              <Route path="automobile" element={<AutomobilePage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="marketplace" element={<GeneralMarketplacePage />} />
              
              {/* Admin Routes */}
              <Route path="admin-dashboard" element={<AdminDashboardPage />} />

              {/* Static/Informational Pages */}
              <Route path="a-propos" element={<AboutPage />} />
              <Route path="contactez-nous" element={<ContactPage />} />
              <Route path="carrieres" element={<CareersPage />} />
              <Route path="presse" element={<PressPage />} />
              <Route path="centre-aide" element={<HelpCenterPage />} />
              <Route path="faq" element={<FAQPage />} />
              <Route path="politique-confidentialite" element={<PrivacyPolicyPage />} />
              <Route path="termes-conditions" element={<TermsConditionsPage />} />
              
              {/* Blog/Content Section */}
              <Route path="blog" element={<BlogPage />} />
              <Route path="blog/:id" element={<BlogPostPage />} />
              
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </AnimatePresence>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
