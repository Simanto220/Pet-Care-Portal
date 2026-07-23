import { Heart, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CtaSection = () => {
  const navigate = useNavigate();
  return (
    <section id="cta" className="py-20 mx-30 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl overflow-hidden shadow-xl">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-3/5 p-8 md:p-12 lg:p-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Ready to Find Your Perfect Pet Companion?
              </h2>
              <p className="text-purple-100 mb-8 text-lg">
                Join thousands of happy pet owners who have found their perfect
                match through our platform. Whether you're looking to adopt,
                need temporary care, or want expert veterinary advice, we've got
                you covered.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold text-lg hover:bg-purple-100 hover:scale-105 transition-all duration-300 flex items-center justify-center shadow-md">
                  <Heart size={20} className="mr-2" />
                  Find a Pet
                </button>
                <button className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold text-lg hover:bg-white hover:text-purple-600 hover:scale-105 transition-all duration-300 flex items-center justify-center">
                  Learn More
                  <ArrowRight size={20} className="ml-2" />
                </button>
              </div>
            </div>
            <div className="md:w-2/5 relative hidden md:block">
              <img
                src="https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750"
                alt="Happy pet owner"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="mt-24 max-w-4xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-8 text-gray-900">
            Join Our Growing Community
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">
                10k+
              </div>
              <div className="text-gray-600">Pet Adoptions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">
                15k+
              </div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">
                300+
              </div>
              <div className="text-gray-600">Veterinarians</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">
                500+
              </div>
              <div className="text-gray-600">Adoption Homes</div>
            </div>
          </div>
          <button
            className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-purple-700 hover:scale-105 transition-all duration-300 flex items-center justify-center mx-auto shadow-md"
            onClick={() => navigate("/signup")}
          >
            Sign Up Today
            <ArrowRight size={20} className="ml-2" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
