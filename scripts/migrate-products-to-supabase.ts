/**
 * Script de migration des produits statiques vers Supabase
 * 
 * Instructions:
 * 1. Assurez-vous que votre fichier .env.local contient les variables Supabase
 * 2. Exécutez: npx tsx scripts/migrate-products-to-supabase.ts
 * 
 * Ou utilisez ce script dans la console Supabase SQL Editor
 */

import { createClient } from '@supabase/supabase-js';
import { sampleProducts } from '../src/data/products';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes!');
  console.error('Assurez-vous que .env.local contient:');
  console.error('  VITE_SUPABASE_URL=...');
  console.error('  VITE_SUPABASE_ANON_KEY=...');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction pour obtenir ou créer une catégorie
async function getOrCreateCategory(slug: string, name: string): Promise<string | null> {
  // Chercher la catégorie existante
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single();

  if (existing) {
    return existing.id;
  }

  // Créer la catégorie si elle n'existe pas
  const { data: newCategory, error } = await supabase
    .from('categories')
    .insert({
      name: name,
      name_fr: name,
      slug: slug,
      is_active: true,
    })
    .select('id')
    .single();

  if (error) {
    console.error(`Erreur lors de la création de la catégorie ${slug}:`, error);
    return null;
  }

  return newCategory.id;
}

// Fonction pour générer un slug unique
function generateSlug(name: string, id: string): string {
  const baseSlug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${baseSlug}-${id}`;
}

// Fonction pour migrer un produit
async function migrateProduct(product: any, index: number) {
  try {
    // Obtenir l'ID de la catégorie
    const categoryId = await getOrCreateCategory(product.category, product.category);

    if (!categoryId) {
      console.error(`⚠️  Impossible de trouver/créer la catégorie pour ${product.name}`);
      return false;
    }

    // Générer un slug unique
    const slug = generateSlug(product.name, product.id);

    // Générer un UUID déterministe à partir de l'ID du produit
    // Utilise crypto pour générer un UUID v5 déterministe
    const generateUUID = (id: string): string => {
      // Pour un UUID v5 déterministe, on utilise un namespace fixe
      // En TypeScript, on peut utiliser crypto.randomUUID() mais pour la cohérence,
      // on génère un UUID basé sur l'ID
      const namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
      // Simple hash pour générer un UUID (approximation)
      // En production, utilisez une bibliothèque UUID appropriée
      const hash = require('crypto').createHash('sha1').update(namespace + id).digest('hex');
      return [
        hash.substring(0, 8),
        hash.substring(8, 12),
        '5' + hash.substring(13, 16),
        ((parseInt(hash.substring(16, 18), 16) & 0x3f) | 0x80).toString(16) + hash.substring(18, 20),
        hash.substring(20, 32)
      ].join('-');
    };

    // Préparer les données pour Supabase
    const productData = {
      id: generateUUID(product.id), // Générer un UUID à partir de l'ID
      sku: `PROD-${product.id}`, // Garder l'ID original dans SKU
      name: product.name,
      name_ar: product.nameAr || product.name,
      name_fr: product.nameFr || product.name,
      name_it: product.nameIt || product.name,
      name_es: product.nameEs || product.name,
      slug: slug,
      price: product.price,
      original_price: product.originalPrice || null,
      image: product.image,
      images: product.images || [product.image],
      category_id: categoryId,
      subcategory: product.subcategory || null,
      description: product.description || '',
      description_ar: product.descriptionAr || product.description || '',
      description_fr: product.descriptionFr || product.description || '',
      description_it: product.descriptionIt || product.description || '',
      description_es: product.descriptionEs || product.description || '',
      colors: product.colors || [],
      sizes: product.sizes || [],
      in_stock: product.inStock !== false,
      stock_quantity: 0,
      is_new: product.isNew || false,
      new_arrival: product.newArrival || false,
      is_best_seller: product.isBestSeller || false,
      is_on_sale: product.isOnSale || false,
      is_featured: product.isBestSeller || false,
      rating: product.rating || 0,
      review_count: product.reviewCount || 0,
      tags: product.tags || [],
    };

    // Vérifier si le produit existe déjà (par SKU)
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('sku', `PROD-${product.id}`)
      .single();

    if (existing) {
      // Mettre à jour le produit existant
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('sku', `PROD-${product.id}`);

      if (error) {
        console.error(`❌ Erreur lors de la mise à jour de ${product.name}:`, error);
        return false;
      }
      console.log(`✅ Mis à jour: ${product.name}`);
    } else {
      // Créer un nouveau produit
      const { error } = await supabase
        .from('products')
        .insert(productData);

      if (error) {
        console.error(`❌ Erreur lors de la création de ${product.name}:`, error);
        return false;
      }
      console.log(`✅ Créé: ${product.name}`);
    }

    return true;
  } catch (error) {
    console.error(`❌ Erreur pour ${product.name}:`, error);
    return false;
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Début de la migration des produits vers Supabase...\n');
  console.log(`📦 Nombre de produits à migrer: ${sampleProducts.length}\n`);

  let successCount = 0;
  let errorCount = 0;

  // Migrer chaque produit
  for (let i = 0; i < sampleProducts.length; i++) {
    const product = sampleProducts[i];
    console.log(`[${i + 1}/${sampleProducts.length}] Migration de: ${product.name}`);
    
    const success = await migrateProduct(product, i);
    if (success) {
      successCount++;
    } else {
      errorCount++;
    }

    // Petite pause pour éviter de surcharger l'API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Résumé de la migration:');
  console.log(`✅ Succès: ${successCount}`);
  console.log(`❌ Erreurs: ${errorCount}`);
  console.log('='.repeat(50));

  if (errorCount === 0) {
    console.log('\n🎉 Migration terminée avec succès!');
  } else {
    console.log('\n⚠️  Certains produits n\'ont pas pu être migrés. Vérifiez les erreurs ci-dessus.');
  }
}

// Exécuter le script
main().catch(console.error);

