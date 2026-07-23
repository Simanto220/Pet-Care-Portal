 import React, { useState, useEffect, useCallback } from 'react';
    import { createRoot } from 'react-dom/client';
    import { Heart, Users, Stethoscope, ArrowRight, MapPin, Calendar, Shield, Star, Award, CheckCircle } from 'lucide-react';

    // Typewriter Effect Component
    const Typewriter = ({ phrases, typingSpeed = 150, deletingSpeed = 100, pauseDuration = 1500 }) => {
      const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
      const [currentText, setCurrentText] = useState('');
      const [isDeleting, setIsDeleting] = useState(false);
      const [isPaused, setIsPaused] = useState(false);

      useEffect(() => {
        const currentPhrase = phrases[currentPhraseIndex];
        let timer;

        if (isPaused) {
          timer = setTimeout(() => {
            setIsPaused(false);
            setIsDeleting(true);
          }, pauseDuration);
        } else if (isDeleting) {
          if (currentText.length > 0) {
            timer = setTimeout(() => {
              setCurrentText((prev) => prev.slice(0, -1));
            }, deletingSpeed);
          } else {
            setIsDeleting(false);
            setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
          }
        } else {
          if (currentText.length < currentPhrase.length) {
            timer = setTimeout(() => {
              setCurrentText(currentPhrase.slice(0, currentText.length + 1));
            }, typingSpeed);
          } else {
            setIsPaused(true);
          }
        }

        return () => clearTimeout(timer);
      }, [currentText, isDeleting, isPaused, currentPhraseIndex, phrases, typingSpeed, deletingSpeed, pauseDuration]);

      return (
        <span className="block bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500 bg-clip-text text-transparent animate-pulse">
          {currentText}
          <span className="inline-block w-1 h-6 bg-purple-500 animate-pulse" />
        </span>
      );
    };

    // Enhanced Hero Section Component with Light Theme
    const HeroSection = () => {
      const [currentSlide, setCurrentSlide] = useState(0);
      const [isPaused, setIsPaused] = useState(false);
      const [isVisible, setIsVisible] = useState(false);

      const heroContent = [
        {
          image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop",
          alt: "Happy dog with family",
          caption: "Find your furry best friend",
          highlight: "🐕 Dogs"
        },
        {
          image: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          alt: "Cute kitten playing",
          caption: "Discover playful companions",
          highlight: "🐱 Cats"
        },
        {
          image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=600&fit=crop",
          alt: "Pet adoption moment",
          caption: "Create lasting memories",
          highlight: "❤️ Love"
        }
      ];

      // Carousel navigation
      const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % heroContent.length);
      }, [heroContent.length]);

      useEffect(() => {
        setIsVisible(true);
        if (!isPaused) {
          const timer = setInterval(nextSlide, 4000);
          return () => clearInterval(timer);
        }
      }, [isPaused, nextSlide]);

      // Preload images for better performance
      useEffect(() => {
        heroContent.forEach((item) => {
          const img = new Image();
          img.src = item.image;
        });
      }, [heroContent]);

      const phrases = ["Perfect Match", "Furry Friend", "Forever Home"];

      return (
        <section 
          className="relative min-h-screen bg-gradient-to-br from-white via-gray-50 to-purple-500 overflow-hidden"
          aria-label="Hero section for pet adoption platform"
        >
          {/* Hero Content */}
          <div className={`relative z-10 container mx-auto px-4 sm:px-6 lg:px-12 py-12 lg:py-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Main Content */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="lg:w-1/2 text-center lg:text-left space-y-8">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 shadow-lg">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium text-gray-700">#1 Pet Adoption Platform</span>
                </div>

                {/* Main Heading with Typewriter Effect */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 leading-tight">
                  Find Your
                  <Typewriter phrases={phrases} />
                </h1>

                {/* Subheading */}
                <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                  Connect loving pets with caring families through our trusted platform. 
                  <span className="text-purple-600 font-semibold"> Thousands of success stories</span> await you.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button 
                    className="group relative bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transform transition-all duration-300 shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-purple-300"
                    aria-label="Start adopting a pet"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      Start Your Journey
                      <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-2 transition-transform duration-300" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-600 via-purple-600 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                  <button 
                    className="group border-2 border-gray-300 bg-white/80 backdrop-blur-sm text-gray-700 px-8 py-4 rounded-2xl font-bold text-lg hover:border-purple-400 hover:text-purple-600 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-gray-200"
                    aria-label="List your pet for adoption"
                  >
                    List Your Pet
                    <Heart className="inline ml-2 h-5 w-5 group-hover:text-rose-500 transition-colors" />
                  </button>
                </div>

                {/* Trust Indicators */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                  {[
                    { icon: CheckCircle, text: "Verified Safe", color: "text-emerald-500" },
                    { icon: Shield, text: "Trusted Platform", color: "text-blue-500" },
                    { icon: MapPin, text: "Nationwide", color: "text-purple-500" },
                    { icon: Calendar, text: "24/7 Support", color: "text-rose-500" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-gray-200 shadow-sm">
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                      <span className="text-sm font-medium text-gray-700">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enhanced Image Carousel */}
              <div 
                className="lg:w-1/2 relative"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                role="region"
                aria-label="Pet image carousel"
              >
                <div className="relative w-full h-80 sm:h-96 lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                  {heroContent.map((item, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-all duration-1000 ${
                        index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                      }`}
                    >
                      <img
                        src={item.image}
                        alt={item.alt}
                        className="w-full h-full object-cover"
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      {/* Enhanced Caption */}
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 shadow-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-gray-900 text-lg font-bold mb-1">{item.caption}</p>
                              <p className="text-gray-600 text-sm">{item.highlight}</p>
                            </div>
                            <Heart className="h-6 w-6 text-rose-500 fill-current" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Enhanced Carousel Controls */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3">
                  {heroContent.map((_, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentSlide 
                          ? 'bg-purple-500 scale-125 shadow-lg' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      onClick={() => setCurrentSlide(index)}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    };
export default HeroSection;
