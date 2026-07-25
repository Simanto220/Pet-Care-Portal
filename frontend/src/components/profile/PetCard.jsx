import { Dog, Cat, Edit, Eye, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const PetCard = ({ pet, setSelectedPet, onCardClick }) => {
  const navigate = useNavigate();
  const [adoptionData, setAdoptionData] = useState(null);
  const [requestCount, setRequestCount] = useState(0);

  // Fetch adoption data and request count for this pet
  useEffect(() => {
    const fetchAdoptionData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || pet.status !== "Available") return;

        // First, get all available pets to find the adoption post for this pet
        const response = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")) + "/adoption/pets", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          const adoptionPost = data.find((p) => p._id === pet._id);

          if (adoptionPost && adoptionPost.adoptionId) {
            setAdoptionData(adoptionPost);

            // Fetch adoption requests for this adoption post
            try {
              const requestsResponse = await fetch(
                `${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")}/adoption/${adoptionPost.adoptionId}/requests`,
                {
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              if (requestsResponse.ok) {
                const requestsData = await requestsResponse.json();
                setRequestCount(requestsData.length || 0);
              }
            } catch (error) {
              console.error("Error fetching adoption requests:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching adoption data:", error);
      }
    };

    fetchAdoptionData();
  }, [pet._id, pet.status]);

  const handleViewRequests = () => {
    // Navigate to the adopt/post page (same as sidebar navigation)
    navigate("/adopt/post");
  };

  // Function to get the image URL
  const getImageUrl = () => {
    if (pet.profilePhoto) {
      const photoPath = pet.profilePhoto;
      if (photoPath.startsWith("http")) {
        return photoPath;
      }
      if (photoPath.startsWith("/uploads")) {
        return `${import.meta.env.VITE_API_URL || "http://localhost:7000"}${photoPath}`;
      }
      return `${import.meta.env.VITE_API_URL || "http://localhost:7000"}/uploads/photos/${pet._id}/${photoPath}`;
    }

    // Fallback image
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(pet.name)}&background=random`;
  };

  return (
    <div
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 overflow-hidden cursor-pointer"
      onClick={onCardClick}
    >
      <div className="relative">
        <img
          src={getImageUrl()}
          alt={pet.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(pet.name)}&background=random`;
          }}
        />
        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              pet.status === "Available"
                ? "bg-green-100 text-green-800"
                : pet.status === "Pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {pet.status}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {pet.type === "Dog" ? (
            <Dog className="w-5 h-5 text-blue-500" />
          ) : (
            <Cat className="w-5 h-5 text-purple-500" />
          )}
          <h3 className="text-lg font-bold text-gray-800">{pet.name}</h3>
        </div>
        <p className="text-gray-600 mb-2">
          {pet.breed} • {pet.age} • {pet.gender}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          {pet.description?.slice(0, 80) || "No description"}...
        </p>
        <div className="flex gap-2 mb-4">
          {pet.traits?.slice(0, 2).map((trait, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {trait}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Link to={`/pet/${pet._id || pet.id}`} className="flex-1">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View
              </Button>
            </Link>
            {setSelectedPet && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPet(pet);
                }}
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            )}
          </div>

          {/* Show View Requests button only if pet is available and has requests */}
          {pet.status === "Available" && requestCount > 0 && (
            <Button
              onClick={handleViewRequests}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white"
            >
              <Users className="w-4 h-4" />
              View Requests ({requestCount})
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetCard;
