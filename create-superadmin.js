#!/usr/bin/env node

/**
 * Script de création du compte Super Admin
 * Email: superadmin@maxiimarket.com
 * 
 * Usage:
 *   node create-superadmin.js
 * 
 * Prérequis:
 *   - Variables d'environnement configurées (.env.local)
 *   - VITE_SUPABASE_URL
 *   - VITE_SUPABASE_ANON_KEY
 *   - SUPABASE_SERVICE_ROLE_KEY (pour admin.createUser)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Charger les variables d'environnement
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env.local') });

// Configuration
const SUPERADMIN_EMAIL = 'superadmin@maxiimarket.com';
const SUPERADMIN_PASSWORD = 'SuperAdmin2025!@MaxiMarket'; // À changer après la première connexion

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
};

async function createSuperAdmin() {
  log.title('🚀 Création du compte Super Admin MaxiMarket');

  // Vérifier les variables d'environnement
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    log.error('Variables d\'environnement manquantes !');
    log.info('Assurez-vous que .env.local contient :');
    log.info('  - VITE_SUPABASE_URL');
    log.info('  - SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  // Créer le client Supabase avec la clé service role
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    log.info('Vérification si le compte existe déjà...');

    // Vérifier si l'utilisateur existe déjà dans auth.users
    const { data: existingAuthUser, error: checkAuthError } = await supabase.auth.admin.listUsers();
    
    if (checkAuthError) {
      throw new Error(`Erreur lors de la vérification : ${checkAuthError.message}`);
    }

    const userExists = existingAuthUser.users.find(u => u.email === SUPERADMIN_EMAIL);

    if (userExists) {
      log.warning(`Le compte ${SUPERADMIN_EMAIL} existe déjà dans auth.users`);
      log.info(`ID: ${userExists.id}`);
      
      // Vérifier dans la table users
      const { data: dbUser, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('email', SUPERADMIN_EMAIL)
        .single();

      if (dbError && dbError.code !== 'PGRST116') {
        throw new Error(`Erreur lors de la vérification DB : ${dbError.message}`);
      }

      if (dbUser) {
        log.info('Le compte existe aussi dans la table users');
        log.info(`Rôle actuel: ${dbUser.role}`);
        
        // Mettre à jour le rôle si nécessaire
        if (dbUser.role !== 'admin') {
          log.info('Mise à jour du rôle vers admin...');
          const { error: updateError } = await supabase
            .from('users')
            .update({ 
              role: 'admin',
              is_verified: true,
              status: 'active',
              updated_at: new Date().toISOString()
            })
            .eq('email', SUPERADMIN_EMAIL);

          if (updateError) {
            throw new Error(`Erreur lors de la mise à jour : ${updateError.message}`);
          }
          log.success('Rôle mis à jour vers admin');
        }
      } else {
        log.warning('Le compte existe dans auth mais pas dans la table users');
        log.info('Création de l\'entrée dans la table users...');
        
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: userExists.id,
            email: SUPERADMIN_EMAIL,
            first_name: 'Super',
            last_name: 'Admin',
            phone_number: '+221770000000',
            role: 'admin',
            is_verified: true,
            status: 'active'
          });

        if (insertError) {
          throw new Error(`Erreur lors de l'insertion : ${insertError.message}`);
        }
        log.success('Entrée créée dans la table users');
      }

      log.success('Compte super admin configuré avec succès !');
      return;
    }

    // Créer le nouveau compte
    log.info('Création du compte d\'authentification...');

    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: SUPERADMIN_EMAIL,
      password: SUPERADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        first_name: 'Super',
        last_name: 'Admin',
        role: 'admin'
      }
    });

    if (createError) {
      throw new Error(`Erreur lors de la création : ${createError.message}`);
    }

    log.success(`Compte créé avec succès !`);
    log.info(`ID: ${newUser.user.id}`);

    // Créer l'entrée dans la table users
    log.info('Création de l\'entrée dans la table users...');

    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: newUser.user.id,
        email: SUPERADMIN_EMAIL,
        first_name: 'Super',
        last_name: 'Admin',
        phone_number: '+221770000000',
        role: 'admin',
        is_verified: true,
        status: 'active'
      });

    if (insertError) {
      // Si l'erreur est un conflit, c'est OK (le trigger a peut-être déjà créé l'entrée)
      if (insertError.code !== '23505') {
        throw new Error(`Erreur lors de l'insertion : ${insertError.message}`);
      }
      log.warning('L\'entrée existe déjà dans la table users (créée par le trigger)');
    } else {
      log.success('Entrée créée dans la table users');
    }

    // Afficher les informations de connexion
    log.title('✅ Super Admin créé avec succès !');
    console.log(`${colors.bright}Informations de connexion :${colors.reset}`);
    console.log(`  Email    : ${colors.cyan}${SUPERADMIN_EMAIL}${colors.reset}`);
    console.log(`  Password : ${colors.cyan}${SUPERADMIN_PASSWORD}${colors.reset}`);
    console.log(`\n${colors.yellow}⚠️  IMPORTANT : Changez le mot de passe après la première connexion !${colors.reset}\n`);

  } catch (error) {
    log.error(`Erreur : ${error.message}`);
    process.exit(1);
  }
}

// Exécuter le script
createSuperAdmin();
