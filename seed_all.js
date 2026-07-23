require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Pet = require("./models/Pet");
const Product = require("./models/Product");
const Service = require("./models/Service");
const PetAdoption = require("./models/PetAdoption");

const MONGO_URI = process.env.MongoDB_URL || "mongodb://localhost:27017/petcare";

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ MongoDB connected");

  // ─── 1. Services ───────────────────────────────────────────────
  await Service.deleteMany({});
  await Service.insertMany([
    { name: "Board Bazar Pet Haven", category: "boarding", phone: "01711-445566", location: { type: "Point", coordinates: [90.3882, 23.9223], address: "Board Bazar, Gazipur" }, servicesOffered: ["Pet Boarding", "Daycare", "Overnight Stay"] },
    { name: "Happy Tails Grooming", category: "grooming", phone: "01622-998877", location: { type: "Point", coordinates: [90.3895, 23.9215], address: "Mirpur, Dhaka" }, servicesOffered: ["Bath & Brush", "Haircut", "Nail Trimming", "Ear Cleaning"] },
    { name: "Paws & Walks", category: "walking", phone: "01555-334455", location: { type: "Point", coordinates: [90.3877, 23.923], address: "Dhanmondi, Dhaka" }, servicesOffered: ["Daily Walks", "Exercise Runs", "Pet Taxi"] },
    { name: "CareVet Dhaka", category: "vet", phone: "01888-667788", location: { type: "Point", coordinates: [90.3891, 23.922], address: "Gulshan, Dhaka" }, servicesOffered: ["General Checkup", "Vaccination", "Surgery", "Emergency Care"] },
    { name: "Furry Friends Sitting", category: "sitting", phone: "01999-112233", location: { type: "Point", coordinates: [90.39, 23.9217], address: "Uttara, Dhaka" }, servicesOffered: ["Home Sitting", "Overnight Stay", "Pet Feeding"] },
    { name: "Pet World Banani", category: "boarding", phone: "01777-445522", location: { type: "Point", coordinates: [90.3879, 23.9228], address: "Banani, Dhaka" }, servicesOffered: ["Pet Boarding", "Training", "Pet Taxi"] },
  ]);
  console.log("✅ Services seeded (6)");

  // ─── 2. Products ───────────────────────────────────────────────
  await Product.deleteMany({});
  await Product.insertMany([
    { name: "Royal Canin Dog Food (3kg)", description: "Premium dry food for adult dogs. Rich in protein and nutrients.", price: 1850, stock: 50, category: "Food", image: "https://images.unsplash.com/photo-1589924749748-45697cf8a8e3?w=400", brand: "Royal Canin", rating: 4.8 },
    { name: "Whiskas Cat Food (1.2kg)", description: "Delicious ocean fish flavored food for cats of all ages.", price: 650, stock: 80, category: "Food", image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400", brand: "Whiskas", rating: 4.6 },
    { name: "Pet Grooming Brush", description: "Soft bristle brush for dogs and cats. Removes loose fur gently.", price: 350, stock: 30, category: "Grooming", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400", brand: "PetPro", rating: 4.5 },
    { name: "Dog Chew Toy (Rope)", description: "Durable rope toy for medium to large dogs. Great for dental health.", price: 280, stock: 45, category: "Toys", image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400", brand: "ZippyPaws", rating: 4.3 },
    { name: "Cat Scratching Post", description: "Tall sisal scratching post keeps cats entertained and claws healthy.", price: 950, stock: 20, category: "Accessories", image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400", brand: "CatComfort", rating: 4.7 },
    { name: "Pet Carrier Bag (Medium)", description: "Lightweight and breathable carrier bag for cats and small dogs.", price: 1200, stock: 15, category: "Accessories", image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400", brand: "PetTravel", rating: 4.4 },
    { name: "Pedigree Adult Dog Food (5kg)", description: "Complete nutrition for adult dogs with chicken and vegetables.", price: 2100, stock: 35, category: "Food", image: "https://images.unsplash.com/photo-1589924749748-45697cf8a8e3?w=400", brand: "Pedigree", rating: 4.5 },
    { name: "Anti-Flea Shampoo for Dogs", description: "Medicated shampoo that kills fleas and ticks on contact. Safe formula.", price: 420, stock: 60, category: "Grooming", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400", brand: "FleaGone", rating: 4.2 },
    { name: "Cat Interactive Feather Toy", description: "Telescopic wand with colorful feathers. Keeps cats active and playful.", price: 180, stock: 70, category: "Toys", image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400", brand: "CatPlay", rating: 4.6 },
    { name: "Stainless Steel Pet Bowl Set", description: "Set of 2 non-slip food and water bowls for dogs and cats.", price: 450, stock: 40, category: "Accessories", image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400", brand: "PetEat", rating: 4.8 },
  ]);
  console.log("✅ Products seeded (10)");

  // ─── 3. Demo User ──────────────────────────────────────────────
  const existingUser = await User.findOne({ username: "demo" });
  let demoUser = existingUser;
  if (!demoUser) {
    const hashedPassword = await bcrypt.hash("demo1234", 10);
    demoUser = await User.create({
      name: "Demo User",
      username: "demo",
      email: "demo@petcare.com",
      password: hashedPassword,
      phone: "01700000000",
      location: "Dhaka",
      role: "user",
    });
    console.log("✅ Demo user created (username: demo, password: demo1234)");
  } else {
    console.log("ℹ️  Demo user already exists");
  }

  // ─── 4. Demo Pets ──────────────────────────────────────────────
  const existingPets = await Pet.countDocuments({ ownerId: demoUser._id });
  let pets = [];
  if (existingPets === 0) {
    pets = await Pet.insertMany([
      { name: "Biscuit", ownerId: demoUser._id, species: "Dog", breed: "Golden Retriever", dateOfBirth: new Date("2021-03-15"), color: "Golden", description: "Friendly and playful dog. Loves cuddles and outdoor walks.", status: "Available", traits: ["Friendly", "Playful", "Loyal"], healthRecords: ["Vaccinated", "Dewormed"] },
      { name: "Mimi", ownerId: demoUser._id, species: "Cat", breed: "Persian", dateOfBirth: new Date("2022-07-20"), color: "White", description: "Calm and affectionate indoor cat. Great with kids.", status: "Available", traits: ["Calm", "Gentle", "Indoor"], healthRecords: ["Vaccinated", "Spayed"] },
      { name: "Rocky", ownerId: demoUser._id, species: "Dog", breed: "German Shepherd", dateOfBirth: new Date("2020-11-05"), color: "Black & Tan", description: "Smart and protective dog. Well-trained and obedient.", status: "Available", traits: ["Smart", "Protective", "Trained"], healthRecords: ["Vaccinated", "Neutered", "Microchipped"] },
    ]);
    console.log("✅ Pets seeded (3)");
  } else {
    pets = await Pet.find({ ownerId: demoUser._id });
    console.log("ℹ️  Pets already exist");
  }

  // ─── 5. Adoption Posts ─────────────────────────────────────────
  const existingPosts = await PetAdoption.countDocuments();
  if (existingPosts === 0 && pets.length > 0) {
    await PetAdoption.insertMany([
      { PetID: pets[0]._id, AdoptionDescription: "Biscuit is looking for a loving forever home! He is great with children and other pets. Comes fully vaccinated and dewormed.", adoptionType: "permanent", status: "available", postedBy: demoUser._id, comments: [] },
      { PetID: pets[1]._id, AdoptionDescription: "Sweet Mimi needs a calm indoor home. She loves being pampered and is perfect for apartment living.", adoptionType: "permanent", status: "available", postedBy: demoUser._id, comments: [] },
      { PetID: pets[2]._id, AdoptionDescription: "Rocky is a well-trained German Shepherd. Looking for a spacious home with an outdoor area. Ideal for families.", adoptionType: "permanent", status: "available", postedBy: demoUser._id, comments: [] },
    ]);
    console.log("✅ Adoption posts seeded (3)");
  } else {
    console.log("ℹ️  Adoption posts already exist");
  }

  await mongoose.disconnect();
  console.log("\n🎉 সব seed data সফলভাবে database এ ঢুকেছে!");
  console.log("─────────────────────────────────────");
  console.log("Demo Login → username: demo | password: demo1234");
  console.log("─────────────────────────────────────");
}

seed().catch((err) => {
  console.error("❌ Seed error:", err.message);
  mongoose.disconnect();
});
