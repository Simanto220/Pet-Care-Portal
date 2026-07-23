
import { Heart, Users, Stethoscope, Home, ShoppingCart, Search, Star, ArrowRight, CheckCircle, MapPin, Calendar, Shield } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Users,
      title: "User Profiles",
      description: "Create detailed profiles for you and your pets with photo uploads and personal details management.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Heart,
      title: "Pet Adoption Posts",
      description: "Post comprehensive adoption listings with photos, medical history, and compatibility information.",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: Search,
      title: "Smart Browsing",
      description: "Find the perfect pet by breed, age, location, or compatibility with advanced filtering options.",
      color: "from-purple-500 to-indigo-500"
    },
    {
      icon: Stethoscope,
      title: "Veterinary Portal",
      description: "Secure access for vets to manage vaccination records, health checkups, and treatment reminders.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Home,
      title: "Adoption Homes",
      description: "Browse and book temporary pet care services with ratings, availability, and location filters.",
      color: "from-orange-500 to-amber-500"
    },
    {
      icon: ShoppingCart,
      title: "Pet Food Store",
      description: "Complete e-commerce platform for pet food with brand filters, cart management, and order tracking.",
      color: "from-teal-500 to-cyan-500"
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
            Everything You Need in One Platform
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From adoption to care, veterinary services to shopping - we've built a comprehensive ecosystem for pet lovers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
            >
              <div className={`bg-gradient-to-r ${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
