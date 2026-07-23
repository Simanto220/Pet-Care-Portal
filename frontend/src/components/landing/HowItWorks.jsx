
import { Heart, Users, Stethoscope, Home, ShoppingCart, Search, Star, ArrowRight, CheckCircle, MapPin, Calendar, Shield } from 'lucide-react';
const HowItWorksSection = () => {
  const steps = [
    {
      step: "01",
      title: "Create Your Profile",
      description: "Sign up and create detailed profiles for you and your pets with photos and preferences.",
      icon: Users
    },
    {
      step: "02",
      title: "Browse & Connect",
      description: "Search through available pets or services, comment on posts, and express genuine interest.",
      icon: Search
    },
    {
      step: "03",
      title: "Complete Adoption",
      description: "Work with owners through our secure platform to finalize adoptions and ongoing care.",
      icon: Heart
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Simple steps to connect with your perfect pet companion
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              <div className="relative mb-8">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 bg-white border-4 border-purple-500 rounded-full w-12 h-12 flex items-center justify-center font-bold text-purple-600">
                  {step.step}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
