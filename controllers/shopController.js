const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

// Products
exports.listProducts = async (req, res) => {
  try {
    const products = await Product.find();
    return res.json(products);
  } catch (e) {
    console.error('listProducts error:', e.message);
    // Fallback demo list so the Shop page remains usable in dev even if DB is down
    const fallback = [
      {
        _id: 'seed-1',
        name: 'Premium Dog Food',
        description: 'Nutritious and delicious food for all breeds.',
        price: 25,
        image:
          'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=400&q=80',
        category: 'Food',
      },
      {
        _id: 'seed-2',
        name: 'Cat Scratching Post',
        description: 'Durable and fun for your feline friends.',
        price: 18,
        image:
          'https://images.unsplash.com/photo-1518715308788-300e1e1e2dba?auto=format&fit=crop&w=400&q=80',
        category: 'Accessories',
      },
      {
        _id: 'seed-3',
        name: 'Pet Shampoo',
        description: 'Gentle shampoo for a shiny, healthy coat.',
        price: 12,
        image:
          'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=400&q=80',
        category: 'Care',
      },
      {
        _id: 'seed-4',
        name: 'Bird Cage',
        description: 'Spacious and safe for small birds.',
        price: 40,
        image:
          'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
        category: 'Housing',
      },
    ];
    return res.json(fallback);
  }
};

exports.seedProducts = async (req, res) => {
  try {
    const count = await Product.countDocuments();
    if (count > 0 && !req.query.force) return res.json({ message: 'Products already exist', count });

    if (req.query.force) {
      await Product.deleteMany({});
    }

    const seed = [
      // Food - Dog
      { name: 'Premium Dog Kibble - Chicken', description: 'High-protein kibble for active dogs.', price: 22, category: 'Food', brand: 'PetPro', tags: ['dog', 'food', 'chicken'], image: '/products/premium-dog-kibble-chicken.jpg', images: ['/products/premium-dog-kibble-chicken.jpg'], variants: [{ name: '2kg', price: 22, sku: 'PP-DK-CH-2', stock: 50 }, { name: '5kg', price: 45, sku: 'PP-DK-CH-5', stock: 30 }] },
      { name: 'Grain-Free Dog Food - Salmon', description: 'Gentle on tummies, rich in omega-3.', price: 28, category: 'Food', brand: 'CanineCare', tags: ['dog', 'food', 'salmon'], image: '/products/grain-free-dog-food-salmon.jpg', images: ['/products/grain-free-dog-food-salmon.jpg'] },
      { name: 'Puppy Starter Food', description: 'Balanced nutrition for puppies.', price: 18, category: 'Food', brand: 'StartPaws', tags: ['dog', 'food', 'puppy'], image: '/products/puppy-starter-food.jpg', images: ['/products/puppy-starter-food.jpg'] },
      // Food - Cat
      { name: 'Cat Dry Food - Tuna', description: 'Crunchy bites with tuna flavor.', price: 16, category: 'Food', brand: 'FelineFine', tags: ['cat', 'food', 'tuna'], image: '/products/cat-dry-food-tuna.jpg', images: ['/products/cat-dry-food-tuna.jpg'], variants: [{ name: '1.5kg', price: 16, sku: 'FF-CF-TU-1.5', stock: 70 }] },
      { name: 'Wet Cat Food Variety Pack', description: '12-pack wet food for picky eaters.', price: 20, category: 'Food', brand: 'MeowMix', tags: ['cat', 'food', 'wet'], image: '/products/wet-cat-food-variety-pack.jpg', images: ['/products/wet-cat-food-variety-pack.jpg'] },
      // Accessories
      { name: 'Cat Scratching Post Deluxe', description: 'Tall, sturdy scratching post.', price: 32, category: 'Accessories', brand: 'Purrfect', tags: ['cat', 'scratcher'], image: '/products/cat-scratching-post-deluxe.jpg', images: ['/products/cat-scratching-post-deluxe.jpg'] },
      { name: 'Adjustable Dog Collar', description: 'Comfortable nylon dog collar.', price: 10, category: 'Accessories', brand: 'PetPro', tags: ['dog', 'collar'], image: '/products/adjustable-dog-collar.jpg', images: ['/products/adjustable-dog-collar.jpg'], variants: [{ name: 'Small', price: 10, sku: 'PP-DC-S', stock: 40 }, { name: 'Medium', price: 12, sku: 'PP-DC-M', stock: 40 }, { name: 'Large', price: 14, sku: 'PP-DC-L', stock: 40 }] },
      { name: 'Leash - Reflective', description: 'Reflective leash for night walks.', price: 15, category: 'Accessories', brand: 'NightPaws', tags: ['dog', 'leash', 'reflective'], image: '/products/leash-reflective.jpg', images: ['/products/leash-reflective.jpg'] },
      { name: 'Bird Cage - Medium', description: 'Ideal for parakeets and finches.', price: 55, category: 'Housing', brand: 'FeatherHome', tags: ['bird', 'cage'], image: '/products/bird-cage-medium.jpg', images: ['/products/bird-cage-medium.jpg'] },
      // Care & Grooming
      { name: 'Pet Shampoo - Sensitive Skin', description: 'Soap-free, tearless formula.', price: 12, category: 'Care', brand: 'GentlePet', tags: ['grooming', 'shampoo'], image: '/products/pet-shampoo-sensitive-skin.jpg', images: ['/products/pet-shampoo-sensitive-skin.jpg'] },
      { name: 'Pet Conditioner', description: 'Silky coat conditioner.', price: 13, category: 'Care', brand: 'GentlePet', tags: ['grooming', 'conditioner'], image: '/products/pet-conditioner.jpg', images: ['/products/pet-conditioner.jpg'] },
      { name: 'Nail Clippers', description: 'Safe and easy nail trimming.', price: 9, category: 'Care', brand: 'TrimPaws', tags: ['grooming'], image: '/products/nail-clippers.jpg', images: ['/products/nail-clippers.jpg'] },
      // Litter & Hygiene
      { name: 'Clumping Cat Litter 10kg', description: 'Low dust, strong clumping.', price: 19, category: 'Hygiene', brand: 'CleanKitty', tags: ['cat', 'litter'], image: '/products/clumping-cat-litter-10kg.jpg', images: ['/products/clumping-cat-litter-10kg.jpg'] },
      { name: 'Puppy Training Pads - 50 pack', description: 'Leak-proof and quick-dry.', price: 17, category: 'Hygiene', brand: 'HouseTrain', tags: ['dog', 'pads'], image: '/products/puppy-training-pads-50-pack.jpg', images: ['/products/puppy-training-pads-50-pack.jpg'] },
      // Treats
      { name: 'Dog Treats - Beef Jerky', description: 'High-value training treats.', price: 11, category: 'Treats', brand: 'GoodBoy', tags: ['dog', 'treats'], image: '/products/dog-treats-beef-jerky.jpg', images: ['/products/dog-treats-beef-jerky.jpg'] },
      { name: 'Cat Treats - Salmon Bites', description: 'Crunchy snack for cats.', price: 8, category: 'Treats', brand: 'PurrSnacks', tags: ['cat', 'treats'], image: '/products/cat-treats-salmon-bites.jpg', images: ['/products/cat-treats-salmon-bites.jpg'] },
      // Toys
      { name: 'Squeaky Ball - 3 Pack', description: 'Durable squeaky balls.', price: 9, category: 'Toys', brand: 'PlayPaws', tags: ['dog', 'toy'], image: '/products/squeaky-ball-3-pack.jpg', images: ['/products/squeaky-ball-3-pack.jpg'] },
      { name: 'Feather Wand Toy', description: 'Interactive cat wand.', price: 7, category: 'Toys', brand: 'Purrfect', tags: ['cat', 'toy'], image: '/products/feather-wand-toy.jpg', images: ['/products/feather-wand-toy.jpg'] },
      // Bowls & Feeders
      { name: 'Stainless Steel Bowl', description: 'Non-slip pet bowl.', price: 8, category: 'Feeders', brand: 'PetPro', tags: ['bowl'], image: '/products/stainless-steel-bowl.jpg', images: ['/products/stainless-steel-bowl.jpg'] },
      { name: 'Automatic Water Dispenser', description: 'Gravity-fed waterer.', price: 20, category: 'Feeders', brand: 'HydraPet', tags: ['water', 'dispenser'], image: '/products/automatic-water-dispenser.jpg', images: ['/products/automatic-water-dispenser.jpg'] },
    ];

    const result = await Product.insertMany(seed);
    res.json({ message: 'Seeded products', count: result.length });
  } catch (e) {
    res.status(500).json({ error: 'Failed to seed products' });
  }
};

// Append more sample products without clearing
exports.appendProducts = async (req, res) => {
  try {
    const extra = [
      { name: 'Orthopedic Dog Bed', description: 'Memory foam bed for joint support.', price: 49, category: 'Accessories', brand: 'SleepPaws', tags: ['dog', 'bed'], image: '/products/orthopedic-dog-bed.jpg', images: ['/products/orthopedic-dog-bed.jpg'] },
      { name: 'No-Pull Harness', description: 'Comfortable harness to reduce pulling.', price: 24, category: 'Accessories', brand: 'PetPro', tags: ['dog', 'harness'], image: '/products/no-pull-harness.jpg', images: ['/products/no-pull-harness.jpg'] },
      { name: 'Elevated Feeder Stand', description: 'Improves posture and digestion.', price: 26, category: 'Feeders', brand: 'PetPro', tags: ['feeder'], image: '/products/elevated-feeder-stand.jpg', images: ['/products/elevated-feeder-stand.jpg'] },
      { name: 'Interactive Treat Puzzle', description: 'Mental stimulation toy for pets.', price: 19, category: 'Toys', brand: 'BrainyPets', tags: ['toy', 'puzzle'], image: '/products/interactive-treat-puzzle.jpg', images: ['/products/interactive-treat-puzzle.jpg'] },
      { name: 'Cat Litter Mat', description: 'Traps litter from paws to keep floors clean.', price: 14, category: 'Hygiene', brand: 'CleanKitty', tags: ['cat', 'litter'], image: '/products/cat-litter-mat.jpg', images: ['/products/cat-litter-mat.jpg'] },
      { name: 'Deshedding Brush', description: 'Reduces shedding up to 90%.', price: 15, category: 'Care', brand: 'TrimPaws', tags: ['grooming', 'brush'], image: '/products/deshedding-brush.jpg', images: ['/products/deshedding-brush.jpg'] },
      { name: 'Catnip Mice 5-Pack', description: 'Irresistible catnip-filled toys.', price: 9, category: 'Toys', brand: 'Purrfect', tags: ['cat', 'toy'], image: '/products/catnip-mice-5-pack.jpg', images: ['/products/catnip-mice-5-pack.jpg'] },
      { name: 'LED Safety Collar', description: 'High-visibility for night walks.', price: 13, category: 'Accessories', brand: 'NightPaws', tags: ['collar', 'led'], image: '/products/led-safety-collar.jpg', images: ['/products/led-safety-collar.jpg'] },
      { name: 'Dog Raincoat', description: 'Waterproof coat for rainy days.', price: 21, category: 'Accessories', brand: 'DryDog', tags: ['coat', 'rain'], image: '/products/dog-raincoat.jpg', images: ['/products/dog-raincoat.jpg'], variants: [
        { name: 'Small', price: 21, sku: 'DD-RC-S', stock: 25 },
        { name: 'Medium', price: 23, sku: 'DD-RC-M', stock: 25 },
        { name: 'Large', price: 25, sku: 'DD-RC-L', stock: 25 },
      ] },
      { name: 'Cooling Mat', description: 'Keeps pets cool in hot weather.', price: 27, category: 'Accessories', brand: 'ChillPet', tags: ['cooling'], image: '/products/cooling-mat.jpg', images: ['/products/cooling-mat.jpg'] },
      { name: 'Travel Water Bottle', description: 'Leak-proof bottle with bowl.', price: 12, category: 'Feeders', brand: 'HydraPet', tags: ['travel', 'water'], image: '/products/travel-water-bottle.jpg', images: ['/products/travel-water-bottle.jpg'] },
      { name: 'Slow Feeder Bowl', description: 'Helps prevent bloating and gulping.', price: 11, category: 'Feeders', brand: 'PetPro', tags: ['bowl', 'slow'], image: '/products/slow-feeder-bowl.jpg', images: ['/products/slow-feeder-bowl.jpg'] },
      { name: 'Dental Chews - Large', description: 'Supports dental health.', price: 15, category: 'Treats', brand: 'GoodBoy', tags: ['dog', 'dental'], image: '/products/dental-chews-large.jpg', images: ['/products/dental-chews-large.jpg'] },
      { name: 'Freeze-Dried Liver Treats', description: 'Single-ingredient training treats.', price: 13, category: 'Treats', brand: 'PureBites', tags: ['treats'], image: '/products/freeze-dried-liver-treats.jpg', images: ['/products/freeze-dried-liver-treats.jpg'] },
      { name: 'Flea & Tick Spot-On (Medium Dogs)', description: 'Monthly protection.', price: 29, category: 'Care', brand: 'ShieldPet', tags: ['flea', 'tick'], image: '/products/flea-tick-spot-on-medium-dogs.jpg', images: ['/products/flea-tick-spot-on-medium-dogs.jpg'] },
      { name: 'Ear Cleaning Solution', description: 'Gentle cleanser for sensitive ears.', price: 10, category: 'Care', brand: 'GentlePet', tags: ['ear', 'cleaning'], image: '/products/ear-cleaning-solution.jpg', images: ['/products/ear-cleaning-solution.jpg'] },
      { name: 'Calming Spray', description: 'Reduces stress and anxiety.', price: 16, category: 'Care', brand: 'CalmPaws', tags: ['calming'], image: '/products/calming-spray.jpg', images: ['/products/calming-spray.jpg'] },
      { name: 'Training Clicker', description: 'Effective positive reinforcement tool.', price: 6, category: 'Accessories', brand: 'TrainPro', tags: ['training'], image: '/products/training-clicker.jpg', images: ['/products/training-clicker.jpg'] },
      { name: 'Retractable Leash 5m', description: 'Durable leash with lock.', price: 17, category: 'Accessories', brand: 'WalkEasy', tags: ['leash'], image: '/products/retractable-leash-5m.jpg', images: ['/products/retractable-leash-5m.jpg'] },
      { name: 'Bird Perch Set', description: 'Natural wood perches for cages.', price: 12, category: 'Accessories', brand: 'FeatherHome', tags: ['bird'], image: '/products/bird-perch-set.jpg', images: ['/products/bird-perch-set.jpg'] },
      { name: 'Hamster Wheel - Silent', description: 'Noise-free running wheel.', price: 14, category: 'Accessories', brand: 'QuietRun', tags: ['small-pet'], image: '/products/hamster-wheel-silent.jpg', images: ['/products/hamster-wheel-silent.jpg'] },
      { name: 'Aquarium Water Conditioner', description: 'Removes chlorine and chloramine.', price: 9, category: 'Care', brand: 'AquaSafe', tags: ['aquarium'], image: '/products/aquarium-water-conditioner.jpg', images: ['/products/aquarium-water-conditioner.jpg'] },
      { name: 'Reptile Heat Lamp 75W', description: 'Provides basking heat.', price: 22, category: 'Accessories', brand: 'ReptiGlow', tags: ['reptile'], image: '/products/reptile-heat-lamp-75w.jpg', images: ['/products/reptile-heat-lamp-75w.jpg'] },
      { name: 'Cat Window Hammock', description: 'Cozy perch for window lounging.', price: 25, category: 'Accessories', brand: 'PurrLounge', tags: ['cat', 'bed'], image: '/products/cat-window-hammock.jpg', images: ['/products/cat-window-hammock.jpg'] },
    ];
    const result = await Product.insertMany(extra);
    res.json({ message: 'Appended products', count: result.length });
  } catch (e) {
    res.status(500).json({ error: 'Failed to append products' });
  }
};

// Cart helpers
const cleanupCart = async (cart) => {
  const before = cart.items.length;
  cart.items = cart.items.filter((i) => i.product); // remove items with missing product
  if (cart.items.length !== before) {
    cart.updatedAt = new Date();
    await cart.save();
    await cart.populate('items.product');
  }
  return cart;
};

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cleanupCart(cart);
};

exports.getCart = async (req, res) => {
  try {
  const cart = await getOrCreateCart(req.user._id);
  res.json(cart);
  } catch (e) {
    res.status(500).json({ error: 'Failed to get cart' });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const cart = await getOrCreateCart(req.user._id);
    const idx = cart.items.findIndex((i) => i.product.equals(productId));
    if (idx === -1) {
      cart.items.push({ product: productId, quantity });
    } else {
      cart.items[idx].quantity += quantity;
    }
    cart.updatedAt = new Date();
    await cart.save();
    await cart.populate('items.product');
    res.json(cart);
  } catch (e) {
    res.status(500).json({ error: 'Failed to add to cart' });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.find((i) => i.product && i.product.equals && i.product.equals(productId));
    if (!item) return res.status(404).json({ error: 'Item not found in cart' });
    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => !i.product.equals(productId));
    } else {
      item.quantity = quantity;
    }
    cart.updatedAt = new Date();
    await cart.save();
    await cart.populate('items.product');
  res.json(await cleanupCart(cart));
  } catch (e) {
    res.status(500).json({ error: 'Failed to update cart item' });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    await cart.save();
    res.json(cart);
  } catch (e) {
    res.status(500).json({ error: 'Failed to clear cart' });
  }
};

// Mock SSLCommerz checkout
exports.createCheckout = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    await cart.populate('items.product');
    if (cart.items.length === 0) return res.status(400).json({ error: 'Cart is empty' });

    const items = cart.items.map((i) => ({
      product: i.product._id,
      name: i.product.name,
      price: i.product.price,
      quantity: i.quantity,
      image: i.product.image,
    }));
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await Order.create({ user: req.user._id, items, total, status: 'pending' });

    // For mock gateway, respond with a fake payment URL including order id
    const paymentUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/shop/payment?orderId=${order._id}`;
    res.json({ paymentUrl, orderId: order._id, amount: total });
  } catch (e) {
    res.status(500).json({ error: 'Failed to create checkout' });
  }
};

exports.paymentSuccess = async (req, res) => {
  try {
    const { orderId, txId } = req.body; // txId optional in mock
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    order.status = 'paid';
    order.transactionId = txId || `MOCK-${Date.now()}`;
    await order.save();

    // Clear cart after successful payment
    const cart = await Cart.findOne({ user: order.user });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.json({ message: 'Payment recorded', order });
  } catch (e) {
    res.status(500).json({ error: 'Failed to record payment' });
  }
};

exports.paymentFail = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    order.status = 'failed';
    await order.save();
    res.json({ message: 'Marked as failed', order });
  } catch (e) {
    res.status(500).json({ error: 'Failed to mark payment failed' });
  }
};

// Admin/dev helper: set one image for all products quickly
exports.setImageForAllProducts = async (req, res) => {
  try {
    const { image } = req.body; // e.g., '/products/ear-cleaning-solution.jpg'
    if (!image || typeof image !== 'string') return res.status(400).json({ error: 'Provide image path string (e.g., /products/your-file.jpg)' });
    const result = await Product.updateMany({}, { $set: { image, images: [image], updatedAt: new Date() } });
    res.json({ message: 'Updated image for all products', matched: result.matchedCount || result.nMatched, modified: result.modifiedCount || result.nModified });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update images for all products' });
  }
};

exports.getPurchaseHistory = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('items.product');
    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: 'Failed to retrieve purchase history' });
  }
};