const Service = require("../models/Service");
const Appointment = require("../models/Appointment");
const User = require("../models/User");

exports.getNearbyServices = async (req, res) => {
  // try {
  //   const { location, distance } = req.query;

  //   if (!location) {
  //     return res.status(400).json({ error: "Location is required" });
  //   }

  //   const nearbyServices = await Service.find({
  //     location: {
  //       $near: {
  //         $geometry: {
  //           type: "Point",
  //           coordinates: location.coordinates,
  //         },
  //         $maxDistance: distance ? distance : 5000,
  //       },
  //     },
  //   });

  //   res.json(nearbyServices);
  // } catch (error) {
  //   console.error("Get nearby services error:", error);
  //   res.status(500).json({ error: "Failed to fetch nearby services" });
  // }

  try {
    const { lat, lng, radius } = req.query;

    let services = [];

    try {
      // Try geo query first (requires 2dsphere index)
      services = await Service.aggregate([
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [parseFloat(lng), parseFloat(lat)],
            },
            distanceField: "distance",
            maxDistance: parseInt(radius) || 50000,
            spherical: true,
          },
        },
      ]);
    } catch (geoErr) {
      // Fallback: return all services if geo index not available
      services = await Service.find({}).lean();
      services = services.map((s) => ({ ...s, distance: 5000 }));
    }

    res.json({ services });
  } catch (err) {
    console.error("Nearby services error:", err);
    res.status(500).json({ error: "Failed to fetch nearby services" });
  }
};

// Get all services with filtering
exports.getServices = async (req, res) => {
  try {
    const { category, location, priceRange, rating, search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    let filter = { isActive: true };

    // Apply filters
    if (category && category !== "all") {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number);
      filter.price = { $gte: min, $lte: max || 999999 };
    }

    if (rating) {
      filter.rating = { $gte: parseFloat(rating) };
    }

    if (location) {
      filter["location.city"] = { $regex: location, $options: "i" };
    }

    const services = await Service.find(filter)
      .populate("provider", "name email profilePicture role")
      .sort({ rating: -1, reviewCount: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Service.countDocuments(filter);

    res.json({
      services,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get services error:", error);
    res.status(500).json({ error: "Failed to fetch services" });
  }
};

// Get service by ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    console.log(req.params.id);
    if (!service) return res.status(404).json({ error: "Service not found" });
    res.json({ service });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch service" });
  }
};

// create booking
exports.createBooking = async (req, res) => {
  try {
    const { serviceId, date, time, pet, notes } = req.body;
    // Save booking into a Booking model
    const booking = new Booking({ serviceId, date, time, pet, notes });
    await booking.save();
    res.json({ message: "Booking confirmed!", booking });
  } catch (err) {
    res.status(500).json({ error: "Failed to create booking" });
  }
};

// Book an appointment
exports.bookAppointment = async (req, res) => {
  try {
    const { serviceId, appointmentDate, timeSlot, petId, notes, location } =
      req.body;

    const service = await Service.findById(serviceId).populate("provider");
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Check if time slot is available
    const existingAppointment = await Appointment.findOne({
      provider: service.provider._id,
      appointmentDate: new Date(appointmentDate),
      "timeSlot.start": timeSlot.start,
      status: { $in: ["scheduled", "confirmed", "in-progress"] },
    });

    if (existingAppointment) {
      return res.status(400).json({ error: "Time slot not available" });
    }

    const appointment = new Appointment({
      service: serviceId,
      customer: req.user._id,
      provider: service.provider._id,
      pet: petId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      price: service.price,
      notes: { customerNotes: notes },
      location: location || "clinic",
    });

    await appointment.save();
    await appointment.populate(["service", "customer", "provider", "pet"]);

    res.status(201).json(appointment);
  } catch (error) {
    console.error("Book appointment error:", error);
    res.status(500).json({ error: "Failed to book appointment" });
  }
};

// Get user's appointments
exports.getUserAppointments = async (req, res) => {
  try {
    const { status, upcoming } = req.query;
    let filter = { customer: req.user._id };

    if (status) {
      filter.status = status;
    }

    if (upcoming === "true") {
      filter.appointmentDate = { $gte: new Date() };
    }

    const appointments = await Appointment.find(filter)
      .populate("service", "name category duration image")
      .populate("provider", "name profilePicture role")
      .populate("pet", "name type breed age")
      .sort({ appointmentDate: 1 });

    res.json(appointments);
  } catch (error) {
    console.error("Get appointments error:", error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status, providerNotes } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Check if user has permission to update
    if (
      appointment.customer.toString() !== req.user._id.toString() &&
      appointment.provider.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    appointment.status = status;
    if (
      providerNotes &&
      appointment.provider.toString() === req.user._id.toString()
    ) {
      appointment.notes.providerNotes = providerNotes;
    }

    await appointment.save();
    await appointment.populate(["service", "customer", "provider", "pet"]);

    res.json(appointment);
  } catch (error) {
    console.error("Update appointment error:", error);
    res.status(500).json({ error: "Failed to update appointment" });
  }
};

// Seed services data
exports.seedServices = async (req, res) => {
  try {
    const count = await Service.countDocuments();
    if (count > 0 && !req.query.force) {
      return res.json({ message: "Services already exist", count });
    }

    if (req.query.force) {
      await Service.deleteMany({});
    }

    // Create sample provider users if they don't exist
    const providers = [];
    const providerData = [
      { name: "Dr. Sarah Johnson", email: "dr.sarah@petcare.com", role: "vet" },
      { name: "Mike Wilson", email: "mike@petcare.com", role: "groomer" },
      { name: "Lisa Chen", email: "lisa@petcare.com", role: "trainer" },
    ];

    for (const provider of providerData) {
      let user = await User.findOne({ email: provider.email });
      if (!user) {
        user = new User({
          ...provider,
          password: "password123", // In real app, this should be hashed
          isVerified: true,
        });
        await user.save();
      }
      providers.push(user);
    }

    const services = [
      // Veterinary Services
      {
        name: "General Health Checkup",
        description:
          "Comprehensive health examination for your pet including vital signs, weight check, and basic health assessment.",
        category: "veterinary",
        price: 75,
        duration: 45,
        image: "/services/health-checkup.jpg",
        provider: providers[0]._id,
        rating: 4.8,
        reviewCount: 124,
        tags: ["checkup", "health", "routine"],
        features: [
          "Digital records",
          "Follow-up included",
          "Vaccination reminder",
        ],
        availability: [
          { day: "monday", timeSlots: [{ start: "09:00", end: "17:00" }] },
          { day: "tuesday", timeSlots: [{ start: "09:00", end: "17:00" }] },
          { day: "wednesday", timeSlots: [{ start: "09:00", end: "17:00" }] },
          { day: "thursday", timeSlots: [{ start: "09:00", end: "17:00" }] },
          { day: "friday", timeSlots: [{ start: "09:00", end: "15:00" }] },
        ],
        location: {
          address: "123 Pet Care St",
          city: "New York",
          state: "NY",
          zipCode: "10001",
        },
      },
      {
        name: "Vaccination Package",
        description:
          "Complete vaccination package including core vaccines and health certificate.",
        category: "veterinary",
        price: 120,
        duration: 30,
        image: "/services/vaccination.jpg",
        provider: providers[0]._id,
        rating: 4.9,
        reviewCount: 89,
        tags: ["vaccination", "prevention", "immunity"],
        features: [
          "All core vaccines",
          "Health certificate",
          "1-year validity",
        ],
        availability: [
          { day: "monday", timeSlots: [{ start: "09:00", end: "17:00" }] },
          { day: "tuesday", timeSlots: [{ start: "09:00", end: "17:00" }] },
          { day: "wednesday", timeSlots: [{ start: "09:00", end: "17:00" }] },
          { day: "thursday", timeSlots: [{ start: "09:00", end: "17:00" }] },
          { day: "friday", timeSlots: [{ start: "09:00", end: "15:00" }] },
        ],
        location: {
          address: "123 Pet Care St",
          city: "New York",
          state: "NY",
          zipCode: "10001",
        },
      },
      {
        name: "Dental Cleaning",
        description:
          "Professional dental cleaning and oral health examination for your pet.",
        category: "veterinary",
        price: 200,
        duration: 90,
        image: "/services/dental-cleaning.jpg",
        provider: providers[0]._id,
        rating: 4.7,
        reviewCount: 56,
        tags: ["dental", "cleaning", "oral health"],
        features: ["Anesthesia included", "Dental X-rays", "Aftercare kit"],
        availability: [
          { day: "tuesday", timeSlots: [{ start: "08:00", end: "16:00" }] },
          { day: "thursday", timeSlots: [{ start: "08:00", end: "16:00" }] },
        ],
        location: {
          address: "123 Pet Care St",
          city: "New York",
          state: "NY",
          zipCode: "10001",
        },
      },
      // Grooming Services
      {
        name: "Full Service Grooming",
        description:
          "Complete grooming package including bath, brush, nail trim, ear cleaning, and styling.",
        category: "grooming",
        price: 85,
        duration: 120,
        image: "/services/full-grooming.jpg",
        provider: providers[1]._id,
        rating: 4.6,
        reviewCount: 203,
        tags: ["grooming", "bath", "styling"],
        features: [
          "Premium shampoo",
          "Nail trimming",
          "Ear cleaning",
          "Styling",
        ],
        availability: [
          { day: "monday", timeSlots: [{ start: "08:00", end: "18:00" }] },
          { day: "tuesday", timeSlots: [{ start: "08:00", end: "18:00" }] },
          { day: "wednesday", timeSlots: [{ start: "08:00", end: "18:00" }] },
          { day: "thursday", timeSlots: [{ start: "08:00", end: "18:00" }] },
          { day: "friday", timeSlots: [{ start: "08:00", end: "18:00" }] },
          { day: "saturday", timeSlots: [{ start: "09:00", end: "17:00" }] },
        ],
        location: {
          address: "456 Grooming Ave",
          city: "New York",
          state: "NY",
          zipCode: "10002",
        },
      },
      {
        name: "Basic Bath & Brush",
        description:
          "Essential bath and brush service to keep your pet clean and fresh.",
        category: "grooming",
        price: 45,
        duration: 60,
        image: "/services/bath-brush.jpg",
        provider: providers[1]._id,
        rating: 4.5,
        reviewCount: 156,
        tags: ["bath", "brush", "basic"],
        features: ["Gentle shampoo", "Thorough brushing", "Blow dry"],
        availability: [
          { day: "monday", timeSlots: [{ start: "08:00", end: "18:00" }] },
          { day: "tuesday", timeSlots: [{ start: "08:00", end: "18:00" }] },
          { day: "wednesday", timeSlots: [{ start: "08:00", end: "18:00" }] },
          { day: "thursday", timeSlots: [{ start: "08:00", end: "18:00" }] },
          { day: "friday", timeSlots: [{ start: "08:00", end: "18:00" }] },
          { day: "saturday", timeSlots: [{ start: "09:00", end: "17:00" }] },
        ],
        location: {
          address: "456 Grooming Ave",
          city: "New York",
          state: "NY",
          zipCode: "10002",
        },
      },
      // Training Services
      {
        name: "Basic Obedience Training",
        description:
          "Foundation training program covering basic commands and behavioral skills.",
        category: "training",
        price: 150,
        duration: 60,
        image: "/services/obedience-training.jpg",
        provider: providers[2]._id,
        rating: 4.8,
        reviewCount: 78,
        tags: ["training", "obedience", "basic"],
        features: [
          "4-week program",
          "Take-home materials",
          "Progress tracking",
        ],
        availability: [
          { day: "monday", timeSlots: [{ start: "16:00", end: "20:00" }] },
          { day: "wednesday", timeSlots: [{ start: "16:00", end: "20:00" }] },
          { day: "saturday", timeSlots: [{ start: "10:00", end: "16:00" }] },
          { day: "sunday", timeSlots: [{ start: "10:00", end: "16:00" }] },
        ],
        location: {
          address: "789 Training Center",
          city: "New York",
          state: "NY",
          zipCode: "10003",
        },
      },
      {
        name: "Puppy Socialization",
        description:
          "Specialized program for puppies to develop social skills and confidence.",
        category: "training",
        price: 120,
        duration: 45,
        image: "/services/puppy-socialization.jpg",
        provider: providers[2]._id,
        rating: 4.9,
        reviewCount: 92,
        tags: ["puppy", "socialization", "young"],
        features: [
          "Age-appropriate activities",
          "Small groups",
          "Play time included",
        ],
        availability: [
          { day: "tuesday", timeSlots: [{ start: "11:00", end: "15:00" }] },
          { day: "thursday", timeSlots: [{ start: "11:00", end: "15:00" }] },
          { day: "saturday", timeSlots: [{ start: "10:00", end: "14:00" }] },
        ],
        location: {
          address: "789 Training Center",
          city: "New York",
          state: "NY",
          zipCode: "10003",
        },
      },
      // Emergency Services
      {
        name: "24/7 Emergency Care",
        description:
          "Round-the-clock emergency veterinary care for urgent situations.",
        category: "emergency",
        price: 250,
        duration: 60,
        image: "/services/emergency-care.jpg",
        provider: providers[0]._id,
        rating: 4.7,
        reviewCount: 45,
        tags: ["emergency", "24/7", "urgent"],
        features: [
          "24/7 availability",
          "Immediate response",
          "Emergency equipment",
        ],
        availability: [
          { day: "monday", timeSlots: [{ start: "00:00", end: "23:59" }] },
          { day: "tuesday", timeSlots: [{ start: "00:00", end: "23:59" }] },
          { day: "wednesday", timeSlots: [{ start: "00:00", end: "23:59" }] },
          { day: "thursday", timeSlots: [{ start: "00:00", end: "23:59" }] },
          { day: "friday", timeSlots: [{ start: "00:00", end: "23:59" }] },
          { day: "saturday", timeSlots: [{ start: "00:00", end: "23:59" }] },
          { day: "sunday", timeSlots: [{ start: "00:00", end: "23:59" }] },
        ],
        location: {
          address: "123 Pet Care St",
          city: "New York",
          state: "NY",
          zipCode: "10001",
        },
      },
    ];

    const result = await Service.insertMany(services);
    res.json({ message: "Services seeded successfully", count: result.length });
  } catch (error) {
    console.error("Seed services error:", error);
    res.status(500).json({ error: "Failed to seed services" });
  }
};

// Get available time slots for a service on a specific date
exports.getAvailableSlots = async (req, res) => {
  try {
    const { serviceId, date } = req.query;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();

    // Get service availability for the day
    const dayAvailability = service.availability.find(
      (a) => a.day === dayOfWeek
    );
    if (!dayAvailability) {
      return res.json({ availableSlots: [] });
    }

    // Get existing appointments for that day
    const existingAppointments = await Appointment.find({
      provider: service.provider,
      appointmentDate: {
        $gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
        $lt: new Date(requestedDate.setHours(23, 59, 59, 999)),
      },
      status: { $in: ["scheduled", "confirmed", "in-progress"] },
    });

    // Generate available slots
    const availableSlots = [];
    const bookedSlots = existingAppointments.map((apt) => apt.timeSlot.start);

    dayAvailability.timeSlots.forEach((timeRange) => {
      const slots = generateTimeSlots(
        timeRange.start,
        timeRange.end,
        service.duration
      );
      slots.forEach((slot) => {
        if (!bookedSlots.includes(slot.start)) {
          availableSlots.push(slot);
        }
      });
    });

    res.json({ availableSlots });
  } catch (error) {
    console.error("Get available slots error:", error);
    res.status(500).json({ error: "Failed to get available slots" });
  }
};

// Helper function to generate time slots
function generateTimeSlots(start, end, duration) {
  const slots = [];
  const startTime = timeToMinutes(start);
  const endTime = timeToMinutes(end);

  for (let time = startTime; time + duration <= endTime; time += duration) {
    const startSlot = minutesToTime(time);
    const endSlot = minutesToTime(time + duration);
    slots.push({ start: startSlot, end: endSlot });
  }

  return slots;
}

function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
}
