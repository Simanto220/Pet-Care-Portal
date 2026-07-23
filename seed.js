// require("dotenv").config();
// const mongoose = require("mongoose");

// // Import models
//const User = require("./models/User");
// const Pet = require("./models/Pet");
// const Product = require("./models/Product");
// const Service = require("./models/Service");
// const Appointment = require("./models/Appointment");
// const Cart = require("./models/Cart");
// const Order = require("./models/Order");
// const OtpCache = require("./models/OtpCache");
// const AdoptionHome = require("./models/AdoptionHome");
// const AdoptionRequest = require("./models/AdoptionRequest");
// const PetAdoption = require("./models/PetAdoption");
// //const DiscussionForum = require("./models/DiscussionForun");
// // const Donation = require("./models/donation");
// // const MedicalRecord = require("./models/MedicalRecord");

// const MONGO_URI =
//   process.env.MongoDB_URL || "mongodb://127.0.0.1:27017/dbConnect1";

// async function seed() {
//   await mongoose.connect(MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });

//   // Clear collections
//   //   await Promise.all([
//   //     User.deleteMany({}),
//   //     Pet.deleteMany({}),
//   //     Product.deleteMany({}),
//   //     Service.deleteMany({}),
//   //     Appointment.deleteMany({}),
//   //     Cart.deleteMany({}),
//   //     Order.deleteMany({}),
//   //     OtpCache.deleteMany({}),
//   //     AdoptionHome.deleteMany({}),
//   //     AdoptionRequest.deleteMany({}),
//   //     PetAdoption.deleteMany({}),
//   //     DiscussionForum.deleteMany({}),
//   //     Donation.deleteMany({}),
//   //     MedicalRecord.deleteMany({}),
//   //   ]);

// //   // 1. Users
// //   const user1 = await User.create({
// //     name: "Alice",
// //     username: "alice123",
// //     email: "alice@example.com",
// //     phone: "1234567890",
// //     password: "hashedpassword",
// //     role: "user",
// //   });
// //   const user2 = await User.create({
// //     name: "Bob",
// //     username: "bob456",
// //     email: "bob@example.com",
// //     phone: "0987654321",
// //     password: "hashedpassword",
// //     role: "user",
// //   });

// //   // 2. Pets
// //   const pet1 = await Pet.create({
// //     name: "Buddy",
// //     ownerId: user1._id,
// //     species: "Dog",
// //     dateOfBirth: new Date(2020, 5, 15),
// //     breed: "Labrador",
// //     color: "Yellow",
// //     description: "Friendly dog",
// //     status: "Adopted",
// //     profilePhoto: "",
// //     photos: [],
// //     healthRecords: [],
// //     traits: ["playful", "friendly"],
// //   });

// //   // 3. Products
// //   const product1 = await Product.create({
// //     name: "Dog Food",
// //     description: "Nutritious dog food",
// //     price: 20,
// //     stock: 100,
// //     category: "Food",
// //   });

// //   // 4. Services
// //   const service1 = await Service.create({
// //     name: "Grooming",
// //     description: "Full grooming service",
// //     category: "grooming",
// //     price: 30,
// //     duration: 60,
// //     provider: user2._id,
// //     availability: [
// //       { day: "monday", timeSlots: [{ start: "09:00", end: "17:00" }] },
// //     ],
// //     location: {
// //       address: "123 Main St",
// //       city: "Cityville",
// //       state: "State",
// //       zipCode: "12345",
// //       coordinates: { lat: 0, lng: 0 },
// //     },
// //   });

// //   // 5. Appointment
// //   await Appointment.create({
// //     service: service1._id,
// //     customer: user1._id,
// //     provider: user2._id,
// //     pet: pet1._id,
// //     appointmentDate: new Date(),
// //     timeSlot: { start: "10:00", end: "11:00" },
// //     status: "scheduled",
// //     price: 30,
// //     notes: {
// //       customerNotes: "Please be gentle",
// //       providerNotes: "",
// //       internalNotes: "",
// //     },
// //     location: "clinic",
// //     paymentStatus: "pending",
// //   });

// //   // 6. Cart
// //   await Cart.create({
// //     user: user1._id,
// //     items: [{ product: product1._id, quantity: 2 }],
// //   });

// //   // 7. Order
// //   await Order.create({
// //     user: user1._id,
// //     items: [
// //       { product: product1._id, name: "Dog Food", price: 20, quantity: 2 },
// //     ],
// //     total: 40,
// //     status: "pending",
// //   });

// //   // 8. OtpCache
// //   await OtpCache.create({
// //     phone: user1.phone,
// //     otp: "123456",
// //   });

// //   // 9. AdoptionHome
// //   await AdoptionHome.create({
// //     name: "Happy Paws Home",
// //     city: "Cityville",
// //     location: "North Side",
// //     address: "456 Pet Lane",
// //     services: [
// //       {
// //         name: "Boarding",
// //         description: "Pet boarding",
// //         price: 100,
// //         discount: 10,
// //       },
// //     ],
// //     createdBy: user2._id,
// //     updatedBy: user2._id,
// //   });

// //   // 10. PetAdoption
// //   const petAdoption1 = await PetAdoption.create({
// //     PetID: pet1._id,
// //     AdoptionDescription: "Looking for a loving home for Buddy.",
// //     adoptionType: "permanent",
// //     comments: [{ userId: user2._id, comment: "Is Buddy good with kids?" }],
// //   });

// //   // 11. AdoptionRequest
// //   await AdoptionRequest.create({
// //     adoptionId: petAdoption1._id,
// //     requesterId: user2._id,
// //     status: "under review",
// //     notes: "Interested in adopting Buddy",
// //   });

// //   console.log("Sample data inserted!");
// //   mongoose.disconnect();
// // }

// seed().catch((err) => {
//   console.error(err);
//   mongoose.disconnect();
// });
// Run: node seed.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Service = require("./models/Service");
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MongoDB_URL);

  await Service.deleteMany({});
  await Service.insertMany([
    {
      name: "Board Bazar Pet Haven",
      category: "boarding",
      phone: "01711-445566",
      location: {
        type: "Point",
        coordinates: [90.3882, 23.9223], // lng, lat
        address: "Board Bazar, Gazipur",
      },
      servicesOffered: ["Pet Boarding", "Daycare", "Overnight Stay"],
    },
    {
      name: "Happy Tails Grooming",
      category: "grooming",
      phone: "01622-998877",
      location: {
        type: "Point",
        coordinates: [90.3895, 23.9215],
        address: "Board Bazar, Gazipur",
      },
      servicesOffered: [
        "Bath & Brush",
        "Haircut",
        "Nail Trimming",
        "Ear Cleaning",
      ],
    },
    {
      name: "Paws & Walks",
      category: "walking",
      phone: "01555-334455",
      location: {
        type: "Point",
        coordinates: [90.3877, 23.923],
        address: "Board Bazar, Gazipur",
      },
      servicesOffered: ["Daily Walks", "Exercise Runs", "Pet Taxi"],
    },
    {
      name: "CareVet Board Bazar",
      category: "vet",
      phone: "01888-667788",
      location: {
        type: "Point",
        coordinates: [90.3891, 23.922],
        address: "Board Bazar, Gazipur",
      },
      servicesOffered: [
        "General Checkup",
        "Vaccination",
        "Surgery",
        "Emergency Care",
      ],
    },
    {
      name: "Furry Friends Sitting",
      category: "sitting",
      phone: "01999-112233",
      location: {
        type: "Point",
        coordinates: [90.39, 23.9217],
        address: "Board Bazar, Gazipur",
      },
      servicesOffered: ["Home Sitting", "Overnight Stay", "Pet Feeding"],
    },
    {
      name: "Board Bazar Pet World",
      category: "boarding",
      phone: "01777-445522",
      location: {
        type: "Point",
        coordinates: [90.3879, 23.9228],
        address: "Board Bazar, Gazipur",
      },
      servicesOffered: ["Pet Boarding", "Training", "Pet Taxi"],
    },
  ]);

  await mongoose.disconnect();

  console.log("Seeded!");
}
run().catch(console.error);
