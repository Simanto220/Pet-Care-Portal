import { useState, useEffect } from "react";
import Sidebar from "../../components/layout/Sidebar";
import NewsfeedPost from "../../components/NewsFeedPost";
import CreatePost from "../../components/CreatePost";
import QuickActions from "../../components/layout/QuickActions";

const Dashboard = ({ user, onLogout }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAvailablePets = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:7000/adoption/pets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch available pets");
      const data = await res.json();
      console.log("Raw pet data:", data); // Debug log
      const formattedPosts = data.map((pet) => ({
        id: pet._id,
        adoptionId: pet.adoptionId,
        postedBy: pet.postedBy,
        user: {
          name: pet.postedBy?.name || "Unknown User",
          avatar: pet.postedBy?.profilePhoto
            ? `http://localhost:7000${pet.postedBy?.profilePhoto}`
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
        adoptionType: pet.adoptionType,
        returnDate: pet.adoptionType === "temporary" ? pet.returnDate : null,
        adoptionDescription: pet.adoptionDescription,
        timestamp: new Date(pet.createdAt).toLocaleString(),
        likes: pet.likes || 0,
        likedBy: pet.likedBy || [],
        comments: pet.comments || [],
        status: pet.status,
      }));
      setPosts(formattedPosts);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailablePets();
  }, []);

  // Function to refresh posts - can be called by CreatePost component
  const refreshPosts = async () => {
    setLoading(true);
    await fetchAvailablePets();
  };

  if (loading) return <div>Loading...</div>;

  if (error && posts.length === 0) {
    // Only show error if it's a real fetch error, not just empty list
    if (error.includes("Failed to fetch available pets")) {
      return <div>No pets are available for adoption.</div>;
    } else {
      return <div>Error: {error}</div>;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container my-10 mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar />
          </div>

          {/* Main Content - Newsfeed */}
          <div className="lg:col-span-2 space-y-6">
            <CreatePost onPostCreated={refreshPosts} />

            <div className="space-y-6">
              {posts.map((post) => (
                <NewsfeedPost key={post.id} post={post} />
              ))}
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

export default Dashboard;
