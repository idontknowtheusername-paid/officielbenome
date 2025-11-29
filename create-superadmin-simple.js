#!/usr/bin/env node

/**
 * Script simplifié de création du compte Super Admin
 * Utilise l'API Supabase Auth directement
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env.local') });

const SUPERADMIN_EMAIL = 'superadmin@maxiimarket.com';
const SUPERADMIN_PASSWORD = 'SuperAdmin2025!@MaxiMarket';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🚀 Création du compte Super Admin\n');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  try {
    // Vérifier si l'utilisateur existe déjà dans auth
    console.log('📋 Vérification du compte...');
    const { data: users } = await supabase.auth.admin.listUsers();
    const existingUser = users.users.find(u => u.email === SUPERADMIN_EMAIL);

    if (existingUser) {
      console.log('⚠️  Le compte existe déjà dans auth.users');
      console.log(`   ID: ${existingUser.id}`);
      console.log('\n✅ Vous pouvez vous connecter avec:');
      console.log(`   Email: ${SUPERADMIN_EMAIL}`);
      console.log('   Password: [votre mot de passe actuel]');
      console.log('\n💡 Pour réinitialiser le mot de passe, utilisez la fonction "Mot de passe oublié"');
      return;
    }

    // Créer le compte
    console.log('🔨 Création du compte d\'authentification...');
    const { data, error } = await supabase.auth.admin.createUser({
      email: SUPERADMIN_EMAIL,
      password: SUPERADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        first_name: 'Super',
        last_name: 'Admin'
      }
    });

    if (error) {
      console.error('❌ Erreur:', error.message);
      process.exit(1);
    }

    console.log('✅ Compte créé avec succès !');
    console.log(`   ID: ${data.user.id}`);
    console.log('\n📧 Informations de connexion:');
    console.log(`   Email   : ${SUPERADMIN_EMAIL}`);
    console.log(`   Password: ${SUPERADMIN_PASSWORD}`);
    console.log('\n⚠️  IMPORTANT: Changez le mot de passe après la première connexion!\n');

  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

main();
