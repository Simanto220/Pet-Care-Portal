import { useState, useEffect } from "react";
import Sidebar from "../../components/layout/Sidebar";
import NewsfeedPost from "../../components/NewsFeedPost";
import QuickActions from "../../components/layout/QuickActions";
import { Star } from "lucide-react";

const Favorites = ({ user, onLogout }) => {
  const [favoritePosts, setFavoritePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFavoritePosts = async () => {
    try {
      const token = localStorage.getItem("token");

      console.log("Fetching favorites for user:", user);

      if (!token) {
        setError("Please login to view favorites");
        setLoading(false);
        return;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")}/favorite/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        if (res.status === 404 || res.status === 400) {
          setFavoritePosts([]);
          setLoading(false);
          return;
        }
        throw new Error("Failed to fetch favorite posts");
      }

      const data = await res.json();
      console.log("Favorites API response:", data);

      // Format the favorite posts data
      const formattedPosts = data.favorites.map((favorite) => {
        const pet = favorite.postId.PetID;
        const adoption = favorite.postId;

        return {
          id: adoption._id,
          _id: adoption._id,
          adoptionId: adoption._id,
          postedBy: pet.postedBy,
          user: {
            name: pet.postedBy?.name || "Unknown User",
            avatar: pet.postedBy?.profilePhoto
              ? `${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")}${pet.postedBy?.profilePhoto}`
              : "https://ui-avatars.com/api/?name=Pet&background=random",
            location: pet.postedBy?.location || "Unknown",
          },
          // Pet data directly at post level for NewsFeedPost
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          dateOfBirth: pet.dateOfBirth,
          color: pet.color,
          description: pet.description,
          healthRecords: pet.healthRecords,
          traits: pet.traits,
          profilePhoto: pet.profilePhoto,
          photos: pet.photos,
          adoptionType: adoption.adoptionType,
          returnDate:
            adoption.adoptionType === "temporary" ? adoption.ReturnDate : null,
          adoptionDescription: adoption.AdoptionDescription,
          timestamp: new Date(adoption.createdAt).toLocaleString(),
          likes: adoption.likes?.length || 0,
          likedBy: adoption.likes || [],
          status: pet.status || "Available",
        };
      });

      setFavoritePosts(formattedPosts);
      console.log("Formatted favorite posts:", formattedPosts);
    } catch (err) {
      console.error("Error fetching favorites:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavoritePosts();
  }, []);

  // Listen for favorites changes to update in real-time
  useEffect(() => {
    const handleFavoritesChange = () => {
      console.log("Favorites changed event received, refreshing...");
      fetchFavoritePosts();
    };

    window.addEventListener("favoritesChanged", handleFavoritesChange);

    return () => {
      window.removeEventListener("favoritesChanged", handleFavoritesChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="container my-10 mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <div className="lg:col-span-1">
              <Sidebar />
            </div>
            <div className="lg:col-span-2">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your favorites...</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <QuickActions />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="container my-10 mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <div className="lg:col-span-1">
              <Sidebar />
            </div>
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="text-red-500 text-6xl mb-4">❌</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Error Loading Favorites
                </h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={fetchFavoritePosts}
                  className="bg-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
            <div className="lg:col-span-1">
              <QuickActions />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container my-10 mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar />
          </div>

          {/* Main Content - Favorite Posts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3">
                <Star className="text-yellow-500 fill-current" size={28} />
                <h1 className="text-2xl font-bold text-gray-800">
                  My Favorites
                </h1>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  {favoritePosts.length} pets
                </span>
              </div>
              <p className="text-gray-600 mt-2">
                Your favorite pets that you're interested in adopting
              </p>
            </div>

            {/* Favorite Posts */}
            <div className="space-y-6">
              {favoritePosts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <Star className="text-gray-300 mx-auto mb-4" size={64} />
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    No Favorites Yet
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Start exploring pets and add them to your favorites by
                    clicking the star icon on their posts.
                  </p>
                  <button
                    onClick={() => (window.location.href = "/dashboard")}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
                  >
                    Explore Pets
                  </button>
                </div>
              ) : (
                favoritePosts.map((post) => (
                  <NewsfeedPost key={post.id} post={post} />
                ))
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Favorites;
