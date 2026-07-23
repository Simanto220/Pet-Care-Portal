import React from "react";
import { Link } from "react-router-dom";
import { Eye, Edit3, Trash2, Calendar, Heart } from "lucide-react";

const PostCard = ({ post, onEdit, onDelete, onViewRequests }) => {
  const calculateAge = (dateOfBirth) => {
    return new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex flex-col lg:flex-row">
        {/* Image Section */}
        <div className="lg:w-1/3 relative">
          <img
            src={
              post.PetID?.profilePhoto
                ? (post.PetID.profilePhoto.startsWith("http")
                    ? post.PetID.profilePhoto
                    : `${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")}${post.PetID.profilePhoto}`)
                : post.PetID?.photos && post.PetID.photos.length > 0
                ? (post.PetID.photos[0].startsWith("http")
                    ? post.PetID.photos[0]
                    : `${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")}${post.PetID.photos[0]}`)
                : "https://ui-avatars.com/api/?name=Pet&background=random"
            }
            alt={`${post.PetID?.name || "Pet"}`}
            className="w-full h-64 lg:h-full object-cover"
            onError={(e) => {
              e.target.src = "https://ui-avatars.com/api/?name=Pet&background=random";
            }}
          />
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              post.adoptionType === 'permanent' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-orange-100 text-orange-800'
            }`}>
              {post.adoptionType === 'permanent' ? 'Permanent' : 'Temporary'}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 lg:w-2/3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                {post.PetID.name}
                <Heart className="h-6 w-6 text-red-400" />
              </h2>
            </div>

            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
              {post.AdoptionDescription}
            </p>

            {/* Pet Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Species</p>
                <p className="font-semibold text-gray-800 capitalize">{post.PetID.species}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Age</p>
                <p className="font-semibold text-gray-800">
                  {calculateAge(post.PetID.dateOfBirth)} years old
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Breed</p>
                <p className="font-semibold text-gray-800">{post.PetID.breed}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Color</p>
                <p className="font-semibold text-gray-800">{post.PetID.color}</p>
              </div>
            </div>

            {/* Return Date for Temporary Adoption */}
            {post.adoptionType === "temporary" && post.ReturnDate && (
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg mb-6">
                <div className="flex items-center gap-2 text-orange-800">
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium">Return Date: {formatDate(post.ReturnDate)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Link to={`/pet/${post.PetID._id}`}>
              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium">
                <Eye className="h-4 w-4" />
                View Pet Info
              </button>
            </Link>
            
            <button
              onClick={() => onViewRequests(post._id)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
            >
              <Heart className="h-4 w-4" />
              View Requests
            </button>
            
            <button
              onClick={() => onEdit(post)}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
            >
              <Edit3 className="h-4 w-4" />
              Edit Post
            </button>
            
            <button
              onClick={() => onDelete(post._id)}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
            >
              <Trash2 className="h-4 w-4" />
              Delete Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
