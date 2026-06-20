const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const supabaseUrl = 'https://avibyiwrelvnxzctfdfw.supabase.co';
const serviceRoleKey = process.argv[2] || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('Error: Please provide the Supabase Service Role Key as an argument or set SUPABASE_SERVICE_ROLE_KEY env variable.');
  console.error('Usage: node seed_supabase.js <YOUR_SUPABASE_SERVICE_ROLE_KEY>');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const dbPath = path.join(__dirname, 'data', 'db.json');
if (!fs.existsSync(dbPath)) {
  console.error(`Error: Could not find db.json at ${dbPath}`);
  process.exit(1);
}
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

/**
 * Deterministically maps any string ID to a valid v4 UUID.
 * Keeps existing valid UUIDs as-is.
 */
function toUUID(id) {
  if (!id) return crypto.randomUUID();
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  const hash = crypto.createHash('sha256').update(id).digest('hex');
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    '4' + hash.substring(13, 16), // version 4 flag
    '8' + hash.substring(17, 20), // variant flag
    hash.substring(20, 32)
  ].join('-');
}

async function seed() {
  console.log('Seeding categories...');
  for (const cat of db.categories) {
    const uuidId = toUUID(cat.id);
    const { data, error } = await supabase.from('categories').upsert({
      id: uuidId,
      name: cat.name,
      slug: cat.slug,
      parent_type: cat.parent_type
    }).select();
    
    if (error) console.error(`Error seeding category ${cat.name}:`, error.message);
    else console.log(`Seeded category: ${cat.name} (UUID: ${uuidId})`);
  }

  console.log('\nSeeding products...');
  for (const prod of db.products) {
    const cat = db.categories.find(c => c.id === prod.category_id);
    const parentType = cat ? cat.parent_type : 'jewellery';
    const subcategory = cat ? cat.slug : (prod.category_id || '');
    
    const imageUrl = prod.images && prod.images.length > 0 ? prod.images[0] : '';
    const stock = prod.status === 'out_of_stock' ? 0 : (prod.status === 'low_stock' ? 3 : 10);
    const uuidId = toUUID(prod.id);

    const { data, error } = await supabase.from('products').upsert({
      id: uuidId,
      name: prod.name,
      category: parentType,
      subcategory: subcategory,
      description: prod.description || '',
      price: Number(prod.price),
      stock: stock,
      image_url: imageUrl,
      status: prod.status || 'in_stock'
    }).select();

    if (error) console.error(`Error seeding product ${prod.name}:`, error.message);
    else console.log(`Seeded product: ${prod.name} (UUID: ${uuidId})`);
  }

  console.log('\nSeeding completed successfully!');
}

seed();
