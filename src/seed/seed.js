require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Restaurant = require("../models/restaurant");
const Menu = require("../models/Menu");
const Coupon = require("../models/Coupon");
const DeliveryPartner = require("../models/DeliveryPartner");
const SurgeSettings = require("../models/SurgeSettings");
const Order = require("../models/order");
const FraudLog = require("../models/FraudLog");
const UserPreference = require("../models/UserPreference");
const connectDB = require("../config/db");

const restaurantsData = [
  {
    name: "Delhi Zaika",
    description: "Authentic North Indian curries, butter chicken, dal makhani & garlic naans.",
    cuisine: ["North Indian", "Mughlai", "Biryani"],
    rating: 4.8,
    numRatings: 340,
    deliveryTime: 25,
    priceCategory: 2,
    isVegetarian: false,
    popularityScore: 95,
    address: "Connaught Place, Central City",
    location: { type: "Point", coordinates: [77.5946, 12.9716] },
    image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=800&q=80",
    coverImage: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=80",
    menu: [
      { name: "Butter Chicken", description: "Tender chicken cooked in rich makhani gravy", price: 349, category: "Main Course", isVeg: false, isBestSeller: true },
      { name: "Dal Makhani", description: "Black lentils slow-cooked overnight with cream & butter", price: 249, category: "Main Course", isVeg: true, isBestSeller: true },
      { name: "Paneer Tikka Masala", description: "Grilled cottage cheese cubes in spiced onion tomato gravy", price: 299, category: "Main Course", isVeg: true },
      { name: "Garlic Butter Naan", description: "Leavened flatbread topped with minced garlic & fresh butter", price: 59, category: "Breads", isVeg: true, isBestSeller: true },
      { name: "Chicken Dum Biryani", description: "Fragrant basmati rice cooked with marinated chicken & spices", price: 329, category: "Biryani", isVeg: false, isBestSeller: true },
      { name: "Gulab Jamun (2 Pcs)", description: "Soft fried dough balls soaked in cardamom sugar syrup", price: 89, category: "Desserts", isVeg: true },
    ]
  },
  {
    name: "Punjabi Rasoi",
    description: "Traditional Punjabi thalis, chole bhature, sarson ka saag & lassi.",
    cuisine: ["North Indian", "Punjabi", "Thali"],
    rating: 4.6,
    numRatings: 280,
    deliveryTime: 30,
    priceCategory: 1,
    isVegetarian: true,
    popularityScore: 90,
    address: "MG Road, Central City",
    location: { type: "Point", coordinates: [77.6000, 12.9750] },
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
    coverImage: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80",
    menu: [
      { name: "Amritsari Chole Bhature", description: "Spicy chickpeas served with fluffy deep fried bhaturas", price: 189, category: "Main Course", isVeg: true, isBestSeller: true },
      { name: "Special Punjabi Thali", description: "Paneer butter masala, dal fry, rice, 2 parathas & sweet", price: 279, category: "Main Course", isVeg: true, isBestSeller: true },
      { name: "Kadhai Paneer", description: "Cottage cheese stir-fried with bell peppers & pounded spices", price: 259, category: "Main Course", isVeg: true },
      { name: "Sweet Kulhad Lassi", description: "Thick creamy Punjabi yogurt beverage with saffron", price: 79, category: "Beverages", isVeg: true, isBestSeller: true },
    ]
  },
  {
    name: "South Spice",
    description: "Crispy dosas, fluffy idlis, vada, sambar & authentic filter coffee.",
    cuisine: ["South Indian", "Dosa", "Breakfast"],
    rating: 4.9,
    numRatings: 520,
    deliveryTime: 20,
    priceCategory: 1,
    isVegetarian: true,
    popularityScore: 98,
    address: "Indiranagar, East Region",
    location: { type: "Point", coordinates: [77.6400, 12.9780] },
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
    coverImage: "https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=1200&q=80",
    menu: [
      { name: "Masala Dosa", description: "Golden crispy crepe stuffed with spiced potato mash & chutney", price: 120, category: "Main Course", isVeg: true, isBestSeller: true },
      { name: "Button Ghee Idli (10 Pcs)", description: "Mini steamed rice cakes immersed in spicy sambar & ghee", price: 110, category: "Main Course", isVeg: true, isBestSeller: true },
      { name: "Medu Vada (2 Pcs)", description: "Crispy lentil donuts served with coconut chutney & sambar", price: 90, category: "Starters", isVeg: true },
      { name: "Filter Coffee", description: "Traditional South Indian hot decoction coffee with frothy milk", price: 45, category: "Beverages", isVeg: true, isBestSeller: true },
    ]
  },
  {
    name: "Urban Biryani",
    description: "Hyderabadi dum biryani cooked over charcoal with authentic spices.",
    cuisine: ["Biryani", "Hyderabadi", "Kebab"],
    rating: 4.7,
    numRatings: 410,
    deliveryTime: 35,
    priceCategory: 2,
    isVegetarian: false,
    popularityScore: 92,
    address: "Koramangala, South Region",
    location: { type: "Point", coordinates: [77.6200, 12.9350] },
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    coverImage: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=1200&q=80",
    menu: [
      { name: "Special Mutton Dum Biryani", description: "Succulent mutton pieces layered with fragrant long grain basmati rice", price: 449, category: "Biryani", isVeg: false, isBestSeller: true },
      { name: "Chicken Boneless Biryani", description: "Tender boneless chicken tikka cooked with aromatic biryani spices", price: 349, category: "Biryani", isVeg: false, isBestSeller: true },
      { name: "Tangdi Kebab (4 Pcs)", description: "Chicken drumsticks marinated in spiced yogurt and roasted in tandoor", price: 310, category: "Starters", isVeg: false },
      { name: "Mirchi Ka Salan", description: "Traditional Hyderabadi chili curry gravy for biryani", price: 80, category: "Sides", isVeg: true },
    ]
  },
  {
    name: "The Tandoor House",
    description: "Juicy kebabs, tandoori platters, tikka & charcoal grilled specialties.",
    cuisine: ["North Indian", "Kebab", "Tandoor"],
    rating: 4.5,
    numRatings: 210,
    deliveryTime: 28,
    priceCategory: 3,
    isVegetarian: false,
    popularityScore: 88,
    address: "HSR Layout, South East",
    location: { type: "Point", coordinates: [77.6500, 12.9100] },
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80",
    coverImage: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    menu: [
      { name: "Non-Veg Tandoori Platter", description: "Assortment of chicken tikka, seekh kebab & fish tikka", price: 549, category: "Starters", isVeg: false, isBestSeller: true },
      { name: "Paneer Malai Tikka", description: "Creamy cottage cheese cubes marinated with cashew & cheese", price: 320, category: "Starters", isVeg: true, isBestSeller: true },
      { name: "Chicken Seekh Kebab", description: "Minced spiced chicken skewers grilled over tandoor charcoal", price: 329, category: "Starters", isVeg: false },
    ]
  },
  {
    name: "Pizza Craft",
    description: "Handcrafted sourdough pizzas, garlic bread, pastas & artisan dips.",
    cuisine: ["Italian", "Pizza", "Pasta"],
    rating: 4.6,
    numRatings: 190,
    deliveryTime: 30,
    priceCategory: 2,
    isVegetarian: false,
    popularityScore: 86,
    address: "Jayanagar, South Region",
    location: { type: "Point", coordinates: [77.5800, 12.9250] },
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
    coverImage: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1200&q=80",
    menu: [
      { name: "Classic Margherita Pizza", description: "Fresh mozzarella, tomato sauce & organic basil leaves", price: 299, category: "Main Course", isVeg: true, isBestSeller: true },
      { name: "Pepperoni Passion Pizza", description: "Loaded with pork pepperoni and extra mozzarella cheese", price: 449, category: "Main Course", isVeg: false, isBestSeller: true },
      { name: "Cheesy Garlic Breadsticks", description: "Baked breadsticks stuffed with melted mozzarella & garlic butter", price: 149, category: "Starters", isVeg: true, isBestSeller: true },
      { name: "Creamy Alfredo Pasta", description: "Penne pasta in rich parmesan cream sauce with garlic toast", price: 329, category: "Main Course", isVeg: true },
    ]
  },
  {
    name: "Dragon Express",
    description: "Pan-Asian noodles, dim sums, manchurian, fried rice & spicy momos.",
    cuisine: ["Chinese", "Asian", "Momos"],
    rating: 4.4,
    numRatings: 230,
    deliveryTime: 25,
    priceCategory: 2,
    isVegetarian: false,
    popularityScore: 84,
    address: "Whitefield, East Region",
    location: { type: "Point", coordinates: [77.7400, 12.9700] },
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800&q=80",
    coverImage: "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=1200&q=80",
    menu: [
      { name: "Steamed Chicken Momos (8 Pcs)", description: "Darjeeling style tender steamed dumplings served with red chili chutney", price: 169, category: "Starters", isVeg: false, isBestSeller: true },
      { name: "Chili Garlic Noodles", description: "Wok-tossed noodles with colorful peppers and chili garlic sauce", price: 199, category: "Main Course", isVeg: true, isBestSeller: true },
      { name: "Veg Manchurian Dry", description: "Crispy vegetable balls tossed in dark soy garlic sauce", price: 219, category: "Starters", isVeg: true },
      { name: "Schezwan Chicken Fried Rice", description: "Spicy wok fried rice loaded with diced chicken and egg", price: 259, category: "Main Course", isVeg: false, isBestSeller: true },
    ]
  }
];

async function seedDatabase() {
  try {
    await connectDB();

    console.log("🧹 Clearing old database entries...");
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await Menu.deleteMany({});
    await Coupon.deleteMany({});
    await DeliveryPartner.deleteMany({});
    await SurgeSettings.deleteMany({});
    await Order.deleteMany({});
    await FraudLog.deleteMany({});
    await UserPreference.deleteMany({});

    console.log("👤 Creating Demo Accounts...");
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash("admin123", salt);
    const customerPassword = await bcrypt.hash("customer123", salt);
    const deliveryPassword = await bcrypt.hash("delivery123", salt);

    const adminUser = await User.create({
      name: "System Admin",
      email: "admin@example.com",
      password: adminPassword,
      role: "admin",
      phone: "9998887770",
    });

    const customerUser = await User.create({
      name: "Mayank Patel",
      email: "customer@example.com",
      password: customerPassword,
      role: "customer",
      phone: "9876543210",
      addresses: [{ street: "123 Green Avenue", city: "Bangalore", state: "Karnataka", zipCode: "560001", isDefault: true }],
    });

    const deliveryUser = await User.create({
      name: "Ramesh Kumar (Delivery Pro)",
      email: "delivery@example.com",
      password: deliveryPassword,
      role: "delivery_partner",
      phone: "9123456789",
    });

    console.log("🛵 Creating Delivery Partner Profiles...");
    const deliveryPartner = await DeliveryPartner.create({
      user: deliveryUser._id,
      name: deliveryUser.name,
      phone: deliveryUser.phone,
      vehicleType: "BIKE",
      status: "AVAILABLE",
      currentLocation: { type: "Point", coordinates: [77.5946, 12.9716] },
      activeOrdersCount: 0,
      totalDeliveries: 45,
      rating: 4.9,
    });

    console.log("🏪 Seeding Restaurants and Menus...");
    for (const rData of restaurantsData) {
      const { menu, ...restFields } = rData;
      const restaurant = await Restaurant.create(restFields);

      for (const mItem of menu) {
        await Menu.create({
          ...mItem,
          restaurant: restaurant._id,
        });
      }
    }

    console.log("🎟️ Seeding Active Coupons...");
    await Coupon.create([
      { code: "WELCOME50", title: "50% OFF on First Order", discountType: "PERCENTAGE", discountValue: 50, minOrderAmount: 200, maxDiscountAmount: 150 },
      { code: "SWIGGYIT", title: "FLAT ₹100 Discount", discountType: "FLAT", discountValue: 100, minOrderAmount: 399, maxDiscountAmount: 100 },
      { code: "HUNGRY20", title: "20% OFF on All Cuisines", discountType: "PERCENTAGE", discountValue: 20, minOrderAmount: 150, maxDiscountAmount: 100 },
    ]);

    console.log("⚡ Seeding Surge Settings...");
    await SurgeSettings.create({
      region: "Central City",
      isSurgeActive: true,
      baseDeliveryFee: 40,
      surgeMultiplier: 1.5,
      demandThreshold: 5,
      peakHours: {
        lunchStart: "12:00",
        lunchEnd: "15:00",
        dinnerStart: "19:30",
        dinnerEnd: "22:30",
      },
    });

    console.log("✨ Seed database successfully completed!");
    console.log(`
-------------------------------------------------------
🔑 DEMO ACCOUNTS CREATED FOR ACADEMIC / REVIEWS:
-------------------------------------------------------
Admin Account:
   Email: admin@example.com
   Password: admin123

Customer Account:
   Email: customer@example.com
   Password: customer123

Delivery Partner Account:
   Email: delivery@example.com
   Password: delivery123
-------------------------------------------------------
    `);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
}

seedDatabase();
