

import React from 'react';

import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-6 w-6 text-pink-400" />
              <span className="text-xl font-bold">PetCare</span>
            </div>
            <p className="text-gray-400">Connecting hearts, one paw at a time.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Features</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Pet Adoption</li>
              <li>Veterinary Portal</li>
              <li>Foster Homes</li>
              <li>Pet Store</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Help Center</li>
              <li>Safety Guidelines</li>
              <li>Contact Us</li>
              <li>Community</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Connect</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Facebook</li>
              <li>Instagram</li>
              <li>Twitter</li>
              <li>Newsletter</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 PetCare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
