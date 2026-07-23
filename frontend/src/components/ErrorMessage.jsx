import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
          
          <p className="text-gray-600 mb-6">
            {message || "We encountered an error while loading your posts. Please try again."}
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700">
              <strong>Error details:</strong> {message}
            </p>
          </div>
          
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          )}
          
          <div className="mt-4 text-sm text-gray-500">
            <p>If the problem persists, please contact support or check your internet connection.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
