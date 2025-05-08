// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { slugify } from 'transliteration'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

const nameTemplates: Record<string, string[]> = {
  // Woman’s Fashion
  'womans-fashion': [
    'Dress','Skirt','Blouse','Jeans','Cardigan','T-Shirt','Pants','Jumpsuit','Romper',
    'Coat','Sweater','Tunic','Top','Leggings','Shorts','Kimono','Wrap','Crop Top',
    'Tank Top','Midi Skirt'
  ],
  'womans-fashion-dresses': [
    'Summer Dress','Evening Gown','Cocktail Dress','Maxi Dress','Midi Dress','Mini Dress',
    'Wrap Dress','Sheath Dress','Shift Dress','Bodycon Dress','Slip Dress','Shirt Dress',
    'Sundress','Ball Gown','A-Line Dress','Pencil Dress','Tea Dress','Lace Dress',
    'Boho Dress','Mermaid Dress'
  ],
  'womans-fashion-shoes': [
    'Sneakers','Heels','Boots','Loafers','Flats','Sandals','Wedges','Mules','Oxfords',
    'Ankle Boots','Knee-high Boots','Slip-ons','Espadrilles','Clogs','Mary Janes',
    'Ballet Flats','Platform Heels','Kitten Heels','Stilettos','Derby Shoes'
  ],
  'womans-fashion-bags': [
    'Handbag','Clutch','Tote','Backpack','Satchel','Crossbody Bag','Hobo Bag','Messenger Bag',
    'Bucket Bag','Shoulder Bag','Wristlet','Belt Bag','Cosmetic Bag','Drawstring Bag',
    'Top Handle Bag','Duffel Bag','Briefcase','Laptop Bag','Bucket Tote','Sling Bag'
  ],
  'womans-fashion-accessories': [
    'Scarf','Belt','Hat','Sunglasses','Watch','Necklace','Bracelet','Earrings','Brooch',
    'Hair Accessory','Gloves','Headband','Socks','Tights','Umbrella','Cufflinks','Tie',
    'Choker','Anklet','Keychain'
  ],
  'womans-fashion-outerwear': [
    'Trench Coat','Parka','Blazer','Leather Jacket','Denim Jacket','Bomber Jacket','Peacoat',
    'Puffer Jacket','Windbreaker','Raincoat','Cape','Duster Coat','Overcoat','Moto Jacket',
    'Quilted Jacket','Fleece Jacket','Military Jacket','Varsity Jacket','Safari Jacket','Shawl'
  ],
  'womans-fashion-lingerie': [
    'Bra','Panties','Chemise','Bodysuit','Teddy','Bustier','Nightgown','Camisole','Briefs',
    'Thong','Boyshorts','Garter Belt','Corset','Bralette','Lingerie Set','Bust Bandeau',
    'Hipster','Brazilian Briefs','Lace Panties','Sports Bra'
  ],

  // Men’s Fashion
  'mens-fashion': [
    'Suit','T-Shirt','Jeans','Jacket','Tie','Polo Shirt','Hoodie','Sweatshirt','Dress Shirt',
    'Chinos','Shorts','Blazer','Overcoat','Leather Jacket','Bomber Jacket','Denim Jacket',
    'Cardigan','Vest','Turtleneck','Sweater'
  ],
  'mens-fashion-suits': [
    'Business Suit','Tuxedo','Three-piece Suit','Dinner Suit','Lounge Suit','Morning Suit',
    'Safari Suit','Seersucker Suit','Tweed Suit','Linen Suit','Double-breasted Suit',
    'Single-breasted Suit','Slim-fit Suit','Tailored Suit','Executive Suit','Wedding Suit',
    'Groom Suit','Boy’s Suit','Designer Suit','Formal Suit'
  ],
  'mens-fashion-casual-wear': [
    'Chinos','Hoodie','Sweatshirt','Cargo Pants','Joggers','Graphic Tee','Henley Shirt',
    'Polo Shirt','Denim Shirt','Flannel Shirt','Bomber Jacket','Cardigan','Shorts',
    'Baseball Cap','Tracksuit','Denim Jacket','Beanie','Tank Top','Crewneck','Pullover'
  ],
  'mens-fashion-shoes': [
    'Loafers','Boots','Sneakers','Oxfords','Derbies','Brogues','Monk Straps','Slip-ons',
    'Chelsea Boots','Chukka Boots','Hiking Boots','Dress Shoes','Running Shoes','Skate Shoes',
    'Boat Shoes','Espadrilles','Sandals','Flip Flops','Wingtips','Driving Shoes'
  ],
  'mens-fashion-watches': [
    'Wrist Watch','Chronograph','Smartwatch','Mechanical Watch','Quartz Watch','Dive Watch',
    'Dress Watch','Field Watch','Pilot Watch','Racing Watch','GMT Watch','Skeleton Watch',
    'Tourbillon Watch','Digital Watch','Hybrid Watch','Luxury Watch','Sport Watch',
    'Military Watch','Pocket Watch','Casual Watch'
  ],
  'mens-fashion-jackets': [
    'Leather Jacket','Bomber Jacket','Denim Jacket','Blazer','Overcoat','Trench Coat',
    'Puffer Jacket','Peacoat','Parka','Windbreaker','Moto Jacket','Harrington Jacket',
    'Varsity Jacket','Duster Coat','Fleece Jacket','Military Jacket','Safari Jacket',
    'Rain Jacket','Tailored Jacket','Hooded Jacket'
  ],
  'mens-fashion-t-shirts': [
    'Graphic Tee','Polo Shirt','V-neck Tee','Crew Neck Tee','Long Sleeve Tee','Henley Tee',
    'Striped Tee','Plain Tee','Performance Tee','Muscle Tee','Pocket Tee','Baseball Tee',
    'Raglan Tee','Tank Top','Oversized Tee','Slim-fit Tee','Vintage Tee','Logo Tee',
    'Designer Tee','Custom Tee'
  ],

  // Electronics
  'electronics': [
    'Headphones','Smartphone','Laptop','Tablet','Camera','Monitor','TV','Speaker','Router',
    'Hard Drive','USB Drive','Keyboard','Mouse','Printer','Projector','Microphone','Webcam',
    'Charger','Power Bank','Smartwatch'
  ],
  'electronics-phones': [
    'Smartphone','Feature Phone','Rugged Phone','Flip Phone','Satellite Phone','Gaming Phone',
    'Camera Phone','Business Phone','5G Phone','Dual SIM Phone','Waterproof Phone',
    'Battery Phone','Touchscreen Phone','QWERTY Phone','Slider Phone','Android Phone',
    'iPhone','Refurbished Phone','Mini Phone','Pro Phone'
  ],
  'electronics-laptops': [
    'Ultrabook','Gaming Laptop','Notebook','Chromebook','Workstation','2-in-1 Laptop',
    'MacBook','Budget Laptop','Business Laptop','Student Laptop','Refurbished Laptop',
    'Convertible Laptop','Portable Laptop','Desktop Replacement','Thin Laptop','Rugged Laptop',
    'Designer Laptop','Mini Laptop','Premium Laptop','Touchscreen Laptop'
  ],
  'electronics-tablets': [
    'Android Tablet','iPad','E-Reader','Windows Tablet','Drawing Tablet','Kids Tablet',
    'Rugged Tablet','Stylus Tablet','2-in-1 Tablet','Phablet','Gaming Tablet','Budget Tablet',
    'High-End Tablet','Business Tablet','Refurbished Tablet','Pro Tablet','LTE Tablet',
    'WiFi Tablet','Graphics Tablet','Signature Tablet'
  ],
  'electronics-cameras': [
    'DSLR Camera','Mirrorless Camera','Action Camera','Point-and-Shoot Camera','Film Camera',
    'Instant Camera','Security Camera','Drone Camera','360 Camera','Webcam','Digital Camera',
    'Medium Format Camera','GoPro','Bridge Camera','Rangefinder Camera','Bullet Camera',
    'Digital SLR','Underwater Camera','Polaroid','Disposable Camera'
  ],
  'electronics-accessories': [
    'USB Cable','Charger','Case','Screen Protector','Headphone Adapter','Cable Organizer',
    'Mouse Pad','Docking Station','Card Reader','HDMI Cable','Tripod','Stand','Lens',
    'Remote','Battery Pack','MicroSD Card','Keyboard Cover','Cleaning Kit','VR Adapter','Ear Wrap'
  ],
  'electronics-wearables': [
    'Smartwatch','Fitness Tracker','VR Headset','AR Glasses','Smart Ring','Heart Rate Monitor',
    'Smart Glasses','Activity Tracker','Wearable Camera','Health Monitor','GPS Watch',
    'Sleep Tracker','Cycling Computer','Smart Bracelet','Trackable Tag','Smart Clothing',
    'Hearable','Smart Helmet','Smart Band','Stylish Watch'
  ],
  'electronics-gaming': [
    'Game Console','Gamepad','Gaming Mouse','Gaming Keyboard','VR Headset','Gaming Chair',
    'Gaming Desk','Headset','Controller','Joystick','Game Drive','Racing Wheel','Arcade Stick',
    'Gaming Monitor','Capture Card','Gaming Router','LED Strip','Gaming Glasses','Gaming Backpack','Pro Controller'
  ],

  // Прочие топ-категории
  'home-garden': [
    'Garden Tool','Furniture','Home Decor','Lawn Mower','Planter','Grill','Patio Set',
    'Landscaping Tool','Garden Hose','Outdoor Lighting','Bird Feeder','Storage Shed',
    'Garden Bench','Wind Chime','Hammock','Outdoor Rug','Planter Box','Greenhouse',
    'Plant Stand','Fire Pit'
  ],
  'sports': [
    'Football','Tennis Racket','Yoga Mat','Dumbbell','Baseball Bat','Basketball','Soccer Ball',
    'Golf Club','Hockey Stick','Skateboard','Surfboard','Helmet','Gloves','Running Shoes',
    'Swimwear','Ski Poles','Camping Tent','Fishing Rod','Tennis Ball','Frisbee'
  ],
  'toys': [
    'Toy Car','Doll','Puzzle','Board Game','Lego Set','Plush Toy','Action Figure','RC Car',
    'Drone Toy','Educational Toy','Stuffed Animal','Toy Train','Building Blocks','Puzzle Cube',
    'Playset','Toy Gun','Kite','Dollhouse','Yo-Yo','Marble Set'
  ],
  'medicine': [
    'Painkiller','Antibiotic','Vitamin','Supplement','Ointment','Syrup','Capsule','Tablet',
    'Injection','Cream','Bandage','Antiseptic','Inhaler','Drops','Vaccine','Antacid',
    'Probiotic','Cough Syrup','Eye Drops','Nasal Spray'
  ],
  'groceries-pets': [
    'Dog Food','Cat Toy','Canned Goods','Pet Bed','Cat Litter','Leash','Pet Shampoo',
    'Bird Seed','Aquarium','Pet Collar','Dog Treat','Cat Tree','Pet Carrier','Fish Food',
    'Pet Bowl','Rabbit Hay','Guinea Pig Pellets','Cheese','Bread','Milk'
  ],
  'health-beauty': [
    'Skincare Cream','Perfume','Shampoo','Body Lotion','Makeup','Hair Oil','Face Mask',
    'Toothpaste','Deodorant','Sunscreen','Lip Balm','Nail Polish','Conditioner','Bath Bomb',
    'Hair Spray','Foundation','Toner','Serum','Eye Cream','Facial Cleanser'
  ],
}

export async function seedProducts() {
  const allCategories = await prisma.category.findMany({
    include: { children: true },
  })
  const leafCategories = allCategories.filter(cat => cat.children.length === 0)
  let totalCount = 0

  for (const category of leafCategories) {
    const count = faker.number.int({ min: 50, max: 100 })
    totalCount += count

    for (let i = 0; i < count; i++) {
      const templates = nameTemplates[category.slug] || []
      const baseName = templates.length
        ? faker.helpers.arrayElement(templates)
        : faker.commerce.productName()

      const adjective = faker.commerce.productAdjective()
      const name = `${adjective} ${baseName}`

      const baseSlug = slugify(name)
      const randomSuffix = faker.string.alphanumeric(6).toLowerCase()
      const slug = `${baseSlug}-${randomSuffix}`

      const description = faker.commerce.productDescription()
      const price = parseFloat(faker.commerce.price({ min: 10, max: 500, dec: 2 }))

      let oldPrice: number | null = null
      let discount: number | null = null
      if (faker.datatype.boolean()) {
        oldPrice = parseFloat(
          faker.commerce.price({ min: price * 1.1, max: price * 1.5, dec: 2 })
        )
        discount = Math.round(((oldPrice - price) / oldPrice) * 100)
      }

      const stock = faker.number.int({ min: 0, max: 200 })
      let colors: string[] = []
      if (
        category.slug.startsWith('womans-fashion') ||
        category.slug.startsWith('mens-fashion') ||
        (category.slug.startsWith('electronics') && faker.datatype.boolean(0.6))
      ) {
        colors = Array.from(
          { length: faker.number.int({ min: 1, max: 5 }) },
          () => faker.color.rgb({ format: 'hex' })
        )
      }

      let sizes: Array<'XS'|'S'|'M'|'L'|'XL'> = []
      if (category.slug.includes('fashion')) {
        const allSizes = ['XS','S','M','L','XL'] as const
        const pickCount = faker.number.int({ min: 1, max: allSizes.length })
        sizes = faker.helpers.shuffle([...allSizes]).slice(0, pickCount) as Array<'XS'|'S'|'M'|'L'|'XL'>
      }

      const isNew = faker.datatype.boolean()
      const images = Array.from(
        { length: faker.number.int({ min: 1, max: 4 }) },
        (_, idx) => ({
          url: `https://loremflickr.com/640/480/${encodeURIComponent(
            category.slug
          )}?random=${faker.string.uuid()}`,
          isMain: idx === 0,
        })
      )

      try {
        await prisma.product.create({
          data: {
            name,
            slug,
            description,
            price,
            oldPrice,
            discount,
            stock,
            categoryId: category.id,
            colors,
            sizes,
            isNew,
            images: { create: images },
          },
        })
      } catch (e: any) {
        // пропускаем дубликаты slug
        if (e.code === 'P2002' && e.meta?.target?.includes('slug')) {
          console.warn(`⚠️  Дубликат slug=${slug}, пропускаю`)
          continue
        }
        throw e
      }
    }
  }

  return totalCount
}
