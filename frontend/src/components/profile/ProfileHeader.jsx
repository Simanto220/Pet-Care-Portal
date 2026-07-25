import { Heart, MapPin, Info } from "lucide-react";

const ProfileHeader = ({ userProfile }) => {
  const username = userProfile.email
    ? `@${userProfile.email.split("@")[0]}`
    : "@username";

  return (
    <div className="bg-white rounded-2xl shadow-xl mb-6 overflow-hidden">
      <div className="relative bg-gradient-to-r from-purple-600 to-purple-200 p-6 text-white h-40 flex items-center justify-center">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Heart className="w-8 h-8" />
          PetCare User Profile
        </h1>
      </div>
      <div className="flex flex-col items-center -mt-16 p-4">
        {" "}
        {/* Adjusted margin-top */}
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
          {" "}
          <img
            src={
              userProfile.profileImage
                ? (userProfile.profileImage.startsWith("http")
                    ? userProfile.profileImage
                    : `${import.meta.env.VITE_API_URL || "http://localhost:7000"}${userProfile.profileImage}`)
                : "https://ui-avatars.com/api/?name=" + encodeURIComponent(userProfile.name || "User") + "&background=random"
            }
            alt="Profile"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(userProfile.name || "User") + "&background=random";
            }}
          />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-800">
          {userProfile.name || "Name"}
        </h2>
        <p className="text-purple-600 text-lg">{username}</p>
        <div className="mt-4 text-gray-600 text-center max-w-2xl">
          <p className="flex items-center justify-center gap-2">
            <MapPin className="w-5 h-5 text-purple-500" />
            {userProfile.location || "Location not specified"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
