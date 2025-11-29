#!/usr/bin/env node

/**
 * Script de mise à jour du rôle Super Admin
 * Change le rôle de 'user' vers 'admin'
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env.local') });

const SUPERADMIN_EMAIL = 'superadmin@maxiimarket.com';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🔧 Mise à jour du rôle Super Admin\n');

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
    // Vérifier l'utilisateur actuel
    console.log('📋 Vérification du compte...');
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('id, email, role, is_verified, status')
      .eq('email', SUPERADMIN_EMAIL)
      .single();

    if (fetchError) {
      console.error('❌ Compte non trouvé:', fetchError.message);
      process.exit(1);
    }

    console.log(`   Email: ${currentUser.email}`);
    console.log(`   Rôle actuel: ${currentUser.role}`);
    console.log(`   Vérifié: ${currentUser.is_verified}`);
    console.log(`   Statut: ${currentUser.status}`);

    if (currentUser.role === 'admin') {
      console.log('\n✅ Le compte est déjà admin !');
      return;
    }

    // Mettre à jour vers admin
    console.log('\n🔨 Mise à jour du rôle vers admin...');
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
      console.error('❌ Erreur lors de la mise à jour:', updateError.message);
      process.exit(1);
    }

    // Vérifier la mise à jour
    const { data: updatedUser } = await supabase
      .from('users')
      .select('id, email, role, is_verified, status')
      .eq('email', SUPERADMIN_EMAIL)
      .single();

    console.log('✅ Rôle mis à jour avec succès !');
    console.log(`   Nouveau rôle: ${updatedUser.role}`);
    console.log(`   Vérifié: ${updatedUser.is_verified}`);
    console.log(`   Statut: ${updatedUser.status}`);
    console.log('\n🎉 Vous pouvez maintenant vous connecter et accéder au dashboard admin !\n');

  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

main();
