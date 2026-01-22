import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Hash password using SHA-256 (same as login route)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  // Create Admin User
  const adminEmail = 'mymarketing123@yahoo.com';
  const adminPassword = 'Jorge123';
  
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash: hashPassword(adminPassword) },
    create: {
      email: adminEmail,
      passwordHash: hashPassword(adminPassword),
      name: 'Admin',
    },
  });
  console.log('✅ Admin user created: ' + adminEmail);

  // Create Settings if not exists
  await prisma.settings.upsert({
    where: { id: 'settings' },
    update: {},
    create: { id: 'settings', galleryPassword: 'welcome2024', nextFlyerNumber: 1 },
  });

  // Define categories and subcategories
  const categoriesData = [
    {
      name: 'Flyers',
      slug: 'flyers',
      description: 'Promotional flyers for various campaigns',
      sortOrder: 1,
      subcategories: [
        { name: 'For Sale By Owner', slug: 'fsbo', sortOrder: 1 },
        { name: 'Divorced', slug: 'divorced', sortOrder: 2 },
        { name: 'Sellers', slug: 'sellers', sortOrder: 3 },
        { name: 'Buyers', slug: 'buyers', sortOrder: 4 },
        { name: 'Expired Listings', slug: 'expired', sortOrder: 5 },
        { name: 'Just Listed', slug: 'just-listed', sortOrder: 6 },
        { name: 'Just Sold', slug: 'just-sold', sortOrder: 7 },
      ],
    },
    {
      name: 'Letters',
      slug: 'letters',
      description: 'Professional letter templates',
      sortOrder: 2,
      subcategories: [
        { name: 'For Sale By Owner', slug: 'fsbo', sortOrder: 1 },
        { name: 'Divorced', slug: 'divorced', sortOrder: 2 },
        { name: 'Sellers', slug: 'sellers', sortOrder: 3 },
        { name: 'Buyers', slug: 'buyers', sortOrder: 4 },
        { name: 'Introduction', slug: 'introduction', sortOrder: 5 },
        { name: 'Follow Up', slug: 'follow-up', sortOrder: 6 },
      ],
    },
    {
      name: 'Postcards',
      slug: 'postcards',
      description: 'Eye-catching postcard designs',
      sortOrder: 3,
      subcategories: [
        { name: 'For Sale By Owner', slug: 'fsbo', sortOrder: 1 },
        { name: 'Divorced', slug: 'divorced', sortOrder: 2 },
        { name: 'Sellers', slug: 'sellers', sortOrder: 3 },
        { name: 'Buyers', slug: 'buyers', sortOrder: 4 },
        { name: 'Market Update', slug: 'market-update', sortOrder: 5 },
        { name: 'Holidays', slug: 'holidays', sortOrder: 6 },
      ],
    },
    {
      name: 'Signs',
      slug: 'signs',
      description: 'Yard signs and banners',
      sortOrder: 4,
      subcategories: [
        { name: 'For Sale By Owner', slug: 'fsbo', sortOrder: 1 },
        { name: 'Open House', slug: 'open-house', sortOrder: 2 },
        { name: 'For Sale', slug: 'for-sale', sortOrder: 3 },
        { name: 'Sold', slug: 'sold', sortOrder: 4 },
        { name: 'Coming Soon', slug: 'coming-soon', sortOrder: 5 },
      ],
    },
  ];

  // Create categories with subcategories
  for (const catData of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: catData.slug },
      update: { name: catData.name, description: catData.description, sortOrder: catData.sortOrder },
      create: {
        name: catData.name,
        slug: catData.slug,
        description: catData.description,
        sortOrder: catData.sortOrder,
      },
    });

    for (const subData of catData.subcategories) {
      await prisma.subcategory.upsert({
        where: { categoryId_slug: { categoryId: category.id, slug: subData.slug } },
        update: { name: subData.name, sortOrder: subData.sortOrder },
        create: {
          name: subData.name,
          slug: subData.slug,
          sortOrder: subData.sortOrder,
          categoryId: category.id,
        },
      });
    }
  }

  // Get current flyer number
  let settings = await prisma.settings.findFirst();
  let flyerNumber = settings?.nextFlyerNumber || 1;

  // Sample flyers - using placeholder images
  const sampleFlyers = [
    // Flyers
    { category: 'flyers', subcategory: 'fsbo', title: 'FSBO Expert Help', description: 'Help For Sale By Owner sellers get top dollar' },
    { category: 'flyers', subcategory: 'fsbo', title: 'FSBO Success Guide', description: 'Free guide for FSBO sellers' },
    { category: 'flyers', subcategory: 'divorced', title: 'Divorce Home Solutions', description: 'Sensitive handling of divorce home sales' },
    { category: 'flyers', subcategory: 'sellers', title: 'Home Value Report', description: 'Free home valuation for sellers' },
    { category: 'flyers', subcategory: 'sellers', title: 'Seller Success Program', description: 'Our proven selling system' },
    { category: 'flyers', subcategory: 'buyers', title: 'First Time Buyer Guide', description: 'Everything first-time buyers need to know' },
    { category: 'flyers', subcategory: 'buyers', title: 'Buyer Advantage Program', description: 'Get ahead in competitive markets' },
    { category: 'flyers', subcategory: 'expired', title: 'Expired Listing Revival', description: 'We sell homes others couldnt' },
    { category: 'flyers', subcategory: 'just-listed', title: 'Just Listed Announcement', description: 'New property on the market' },
    { category: 'flyers', subcategory: 'just-sold', title: 'Just Sold Celebration', description: 'Another successful sale' },
    
    // Letters
    { category: 'letters', subcategory: 'fsbo', title: 'FSBO Introduction Letter', description: 'Professional intro to FSBO sellers' },
    { category: 'letters', subcategory: 'divorced', title: 'Divorce Situation Letter', description: 'Compassionate outreach letter' },
    { category: 'letters', subcategory: 'sellers', title: 'Seller Prospecting Letter', description: 'Generate seller leads' },
    { category: 'letters', subcategory: 'buyers', title: 'Buyer Welcome Letter', description: 'Welcome new buyer clients' },
    { category: 'letters', subcategory: 'introduction', title: 'Agent Introduction', description: 'Introduce yourself to the neighborhood' },
    { category: 'letters', subcategory: 'follow-up', title: 'Follow Up Letter', description: 'Stay in touch with prospects' },
    
    // Postcards
    { category: 'postcards', subcategory: 'fsbo', title: 'FSBO Postcard Series #1', description: 'First touch FSBO postcard' },
    { category: 'postcards', subcategory: 'fsbo', title: 'FSBO Postcard Series #2', description: 'Follow-up FSBO postcard' },
    { category: 'postcards', subcategory: 'divorced', title: 'Life Changes Postcard', description: 'Sensitive outreach postcard' },
    { category: 'postcards', subcategory: 'sellers', title: 'Thinking of Selling?', description: 'Seller prospecting postcard' },
    { category: 'postcards', subcategory: 'buyers', title: 'Dream Home Awaits', description: 'Buyer attraction postcard' },
    { category: 'postcards', subcategory: 'market-update', title: 'Q1 Market Update', description: 'Quarterly market statistics' },
    { category: 'postcards', subcategory: 'holidays', title: 'Holiday Greetings', description: 'Seasonal holiday postcard' },
    
    // Signs
    { category: 'signs', subcategory: 'fsbo', title: 'FSBO Rider Sign', description: 'Add-on sign for FSBO properties' },
    { category: 'signs', subcategory: 'open-house', title: 'Open House Directional', description: 'Arrow sign for open houses' },
    { category: 'signs', subcategory: 'open-house', title: 'Open House Main Sign', description: 'Primary open house sign' },
    { category: 'signs', subcategory: 'for-sale', title: 'For Sale Yard Sign', description: 'Standard for sale sign' },
    { category: 'signs', subcategory: 'sold', title: 'SOLD Rider', description: 'Sold overlay for signs' },
    { category: 'signs', subcategory: 'coming-soon', title: 'Coming Soon Sign', description: 'Pre-listing announcement sign' },
  ];

  for (const flyer of sampleFlyers) {
    const subcategory = await prisma.subcategory.findFirst({
      where: {
        slug: flyer.subcategory,
        category: { slug: flyer.category },
      },
    });

    if (subcategory) {
      const code = `PROMO-${String(flyerNumber).padStart(4, '0')}`;
      
      // Check if flyer already exists
      const existingFlyer = await prisma.flyer.findUnique({ where: { code } });
      if (!existingFlyer) {
        // Use placeholder image - in production, replace with real images
        const colors = ['1a1a2e', '16213e', '0f3460', '533483', '4a0e4e', '2c3e50', '1e3d59', '2d4059'];
        const color = colors[flyerNumber % colors.length];
        const imageUrl = `https://placehold.co/600x800/${color}/d4af37?text=${encodeURIComponent(flyer.title.split(' ').slice(0, 2).join('+'))}`;
        
        await prisma.flyer.create({
          data: {
            code,
            title: flyer.title,
            description: flyer.description,
            imageUrl,
            subcategoryId: subcategory.id,
          },
        });
        
        flyerNumber++;
      }
    }
  }

  // Update next flyer number
  await prisma.settings.update({
    where: { id: 'settings' },
    data: { nextFlyerNumber: flyerNumber },
  });

  console.log('✅ Seed completed!');
  console.log(`   - 1 admin user created`);
  console.log(`   - 4 categories created`);
  console.log(`   - ${sampleFlyers.length} sample flyers created`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

