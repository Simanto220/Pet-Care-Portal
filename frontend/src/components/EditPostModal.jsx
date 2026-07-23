import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

const EditPostModal = ({ post, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    description: "",
    type: "",
    returnDate: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (post) {
      setFormData({
        description: post.AdoptionDescription || "",
        type: post.adoptionType || "",
        returnDate: post.ReturnDate 
          ? new Date(post.ReturnDate).toISOString().split("T")[0] 
          : ""
      });
    }
  }, [post]);

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
      await onUpdate({
        adoptionDescription: formData.description,
        adoptionType: formData.type,
        returnDate: formData.returnDate
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

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Edit Adoption Post</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Pet Name Display */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 mb-1">Editing post for:</p>
            <p className="font-semibold text-blue-800">{post?.PetID?.name}</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adoption Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              rows="4"
              placeholder="Describe your pet and adoption requirements..."
              required
            />
          </div>

          {/* Adoption Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adoption Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            >
              <option value="">Select adoption type</option>
              <option value="permanent">Permanent</option>
              <option value="temporary">Temporary</option>
            </select>
          </div>

          {/* Return Date (only for temporary) */}
          {formData.type === "temporary" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Return Date
              </label>
              <input
                type="date"
                name="returnDate"
                value={formData.returnDate}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          )}

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
              {isLoading ? "Updating..." : "Update Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;
