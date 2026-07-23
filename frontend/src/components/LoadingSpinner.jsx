import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = "Loading your posts..." }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <div className="absolute inset-0 h-12 w-12 border-4 border-blue-200 rounded-full animate-pulse mx-auto"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">{message}</h2>
        <p className="text-gray-500">Please wait while we fetch your data</p>
        <div className="flex justify-center mt-4">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
