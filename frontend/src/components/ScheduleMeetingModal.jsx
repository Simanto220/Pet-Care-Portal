import React, { useState, useEffect } from "react";
import { X, Calendar, FileText, Save } from "lucide-react";

const ScheduleMeetingModal = ({ onClose, onSave, requestId, existingRequest }) => {
  const [formData, setFormData] = useState({
    meetingDate: "",
    notes: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (existingRequest) {
      setFormData({
        meetingDate: existingRequest.meetingDate 
          ? new Date(existingRequest.meetingDate).toISOString().split("T")[0]
          : "",
        notes: existingRequest.notes || ""
      });
    }
  }, [existingRequest]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onSave({
        meetingDate: formData.meetingDate,
        notes: formData.notes
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Get tomorrow's date as minimum selectable date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Schedule Meeting</h2>
              <p className="text-sm text-gray-600">
                {existingRequest ? "Update meeting details" : "Set up a meeting with the adopter"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Requester Info */}
          {existingRequest && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 mb-1">Meeting with:</p>
              <p className="font-semibold text-blue-800">{existingRequest.requesterId.name}</p>
              <p className="text-sm text-blue-600">{existingRequest.requesterId.email}</p>
            </div>
          )}

          {/* Meeting Date */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4" />
              Meeting Date
            </label>
            <input
              type="date"
              name="meetingDate"
              value={formData.meetingDate}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              min={minDate}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Select a date at least 24 hours from now
            </p>
          </div>

          {/* Meeting Notes */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4" />
              Meeting Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              rows="4"
              placeholder="Add meeting location, time, special instructions, or any other details..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Include meeting time, location, and any special instructions
            </p>
          </div>

          {/* Meeting Tips */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">Meeting Tips:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Choose a public, pet-friendly location</li>
              <li>• Bring your pet's medical records</li>
              <li>• Prepare questions about the adopter's experience</li>
              <li>• Allow time for the pet and adopter to interact</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <Save className="h-4 w-4" />
              {isLoading ? "Saving..." : existingRequest ? "Update Meeting" : "Schedule Meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleMeetingModal;
