import { Heart, Users, Stethoscope, Home, ShoppingCart, Search, Star, ArrowRight, CheckCircle, MapPin, Calendar, Shield } from 'lucide-react';


const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Dog Owner",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      content: "Found my perfect companion through PetConnect! The platform made it so easy to connect with Luna's previous owner and ensure she was the right fit for our family.",
      rating: 5
    },
    {
      name: "Dr. Michael Chen",
      role: "Veterinarian",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
      content: "The veterinary portal is incredibly well-designed. I can efficiently manage all my patients' records and keep track of vaccination schedules seamlessly.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Foster Home",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b765?w=100&h=100&fit=crop&crop=face",
      content: "As a foster home provider, this platform has streamlined my booking process. Pet parents can easily see availability and book temporary care for their fur babies.",
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-gradient-to-r from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
            What Our Community Says
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of happy pet parents and service providers
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed italic">"{testimonial.content}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
