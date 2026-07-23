// const mongoose = require('mongoose');

// const serviceSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   description: {
//     type: String,
//     required: true
//   },
//   category: {
//     type: String,
//     required: true,
//     enum: ['veterinary', 'grooming', 'boarding', 'training', 'emergency', 'wellness']
//   },
//   price: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   duration: {
//     type: Number, // in minutes
//     required: true
//   },
//   image: {
//     type: String,
//     default: ''
//   },
//   availability: [{
//     day: {
//       type: String,
//       enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
//     },
//     timeSlots: [{
//       start: String, // "09:00"
//       end: String    // "17:00"
//     }]
//   }],
//   provider: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   rating: {
//     type: Number,
//     default: 0,
//     min: 0,
//     max: 5
//   },
//   reviewCount: {
//     type: Number,
//     default: 0
//   },
//   tags: [String],
//   features: [String], // e.g., ["Home pickup", "Emergency available", "Certified"]
//   location: {
//     address: String,
//     city: String,
//     state: String,
//     zipCode: String,
//     coordinates: {
//       lat: Number,
//       lng: Number
//     }
//   }
// }, {
//   timestamps: true
// });

// serviceSchema.index({ category: 1, isActive: 1 });
// serviceSchema.index({ provider: 1 });
// serviceSchema.index({ rating: -1 });

// module.exports = mongoose.model('Service', serviceSchema);

const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ["walking", "boarding", "grooming", "vet", "sitting"],
    required: true,
  },
  phone: String,
  vetName: String,
  vetSpecialization: String,
  // GeoJSON point
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
      default: "Point",
    },
    coordinates: {
      type: [Number], // [lng, lat] order!
      required: true,
    },
    address: String,
  },
  servicesOffered: [
    {
      type: String, // example: "Dog Walking", "Pet Sitting"
    },
  ],
});

// Geospatial index
ServiceSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Service", ServiceSchema);
