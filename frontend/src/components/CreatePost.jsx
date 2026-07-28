import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Camera, Image, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CreatePost = ({
  isAuthenticated = true,
  forceShowForm = false,
  onPostCreated,
}) => {
  // Added forceShowForm prop
  // State for user data
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [myPets, setMyPets] = useState([]);

  // State for the post form
  const [postText, setPostText] = useState("");
  const [showForm, setShowForm] = useState(forceShowForm); // Initialize showForm with forceShowForm
  const [petSource, setPetSource] = useState(""); // "my-pet" or "found-pet"
  const [selectedPet, setSelectedPet] = useState(""); // Stores the ID of the selected pet
  const [adoptionType, setAdoptionType] = useState("");

  // Found pet fields
  const [petName, setPetName] = useState("");
  const [petSpecies, setPetSpecies] = useState("");
  const [petBreed, setPetBreed] = useState("");
  const [petAge, setPetAge] = useState("");
  const [petColor, setPetColor] = useState("");
  const [foundLocation, setFoundLocation] = useState("");
  const [returnDate, setReturnDate] = useState(""); // New state for return date

  // Photo states
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [additionalPhotos, setAdditionalPhotos] = useState([]);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [additionalPhotosPreview, setAdditionalPhotosPreview] = useState([]);

  // Fetch user data (name and avatar)
  useEffect(() => {
    if (!isAuthenticated) {
      setUserName(""); // Clear if not authenticated
      setUserAvatar("https://via.placeholder.com/40"); // Generic placeholder if not authenticated
      return;
    }

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("isAuthenticated is true, but no token found.");
          setUserName("User"); // Fallback name
          setUserAvatar("https://via.placeholder.com/40");
          return;
        }

        const res = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")) + "/profile/userInfo", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            // Unauthorized
            console.error("Authentication failed, user not logged in.");
            setUserName("User");
            setUserAvatar("https://via.placeholder.com/40");
          } else {
            throw new Error(`Failed to fetch user data: ${res.statusText}`);
          }
          return;
        }

        const data = await res.json();
        setUserName(data.name || "User"); // Fallback to 'User' if name is missing
        setUserAvatar(
          data.photoURL
            ? `${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")}${data.photoURL}`
            : "https://via.placeholder.com/40"
        ); // Prepend base URL if photoURL exists
      } catch (err) {
        console.error("Error fetching user data:", err);
        setUserName("User"); // Default to User on error
        setUserAvatar("https://via.placeholder.com/40"); // Default placeholder
      }
    };
    fetchUserData();
  }, [isAuthenticated]); // Re-run if isAuthenticated changes

  // Fetch user's pets
  useEffect(() => {
    if (!isAuthenticated) {
      setMyPets([]); // Clear pets if not authenticated
      return;
    }

    const fetchMyPets = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error(
            "isAuthenticated is true, but no token found for fetching pets."
          );
          setMyPets([]);
          return;
        }

        const response = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")) + "/pet/myPets", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const result = await response.json();
          setMyPets(result.pets || []);
        } else if (response.status === 404) {
          setMyPets([]); // No pets found
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (err) {
        console.error("Error fetching pets:", err);
        setMyPets([]); // Ensure pets is always an array even on error
      }
    };
    fetchMyPets();
  }, [isAuthenticated]); // Re-run if isAuthenticated changes

  const resetForm = () => {
    setPostText("");
    setPetSource("");
    setSelectedPet("");
    setAdoptionType("");
    setPetName("");
    setPetSpecies("");
    setPetBreed("");
    setPetAge("");
    setPetColor("");
    setFoundLocation("");
    setReturnDate(""); // Reset return date
    setProfilePhoto(null);
    setAdditionalPhotos([]);
    setProfilePhotoPreview(null);
    setAdditionalPhotosPreview([]);
    setMyPets([]); // Reset fetched pets as well
    if (!forceShowForm) {
      // Only reset showForm if not forced open
      setShowForm(false);
    }
  };

  // Photo handling functions
  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => setProfilePhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalPhotosChange = (e) => {
    const files = Array.from(e.target.files);
    setAdditionalPhotos((prev) => [...prev, ...files]);

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAdditionalPhotosPreview((prev) => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAdditionalPhoto = (index) => {
    setAdditionalPhotos((prev) => prev.filter((_, i) => i !== index));
    setAdditionalPhotosPreview((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePostAdoption = async () => {
    if (!isAuthenticated) {
      alert("Please log in to create an adoption post.");
      return;
    }

    // Different validation for different pet sources
    if (petSource === "my-pet") {
      if (!postText || !adoptionType) {
        alert(
          "Please fill in all required fields: Post text and Adoption type."
        );
        return;
      }
      if (adoptionType === "temporary" && !returnDate) {
        alert("Please provide a return date for temporary adoption.");
        return;
      }
      if (!selectedPet) {
        alert("Please select your pet.");
        return;
      }
    } else if (petSource === "found-pet") {
      if (!postText || !petSpecies) {
        alert("Please fill in all required fields: Post text and Pet species.");
        return;
      }
      if (!profilePhoto) {
        alert("Please upload a profile picture for the found pet.");
        return;
      }
    } else {
      alert("Please select a pet source (your pet or found pet).");
      return;
    }

    // Ensure postText is not just whitespace
    if (!postText.trim()) {
      toast.error("Please provide a description for the adoption post.", { position: "top-left" });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token missing. Please log in.", { position: "top-left" });
        return;
      }

      let endpoint = (import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")) + "/adoption/post";
      let requestBody;
      let headers = {
        Authorization: `Bearer ${token}`,
      };

      if (petSource === "my-pet") {
        // First create the adoption post
        headers["Content-Type"] = "application/json";
        requestBody = JSON.stringify({
          adoptionDescription: postText,
          adoptionType,
          returnDate: adoptionType === "temporary" ? returnDate : undefined,
          petId: selectedPet,
        });

        const response = await fetch(endpoint, {
          method: "POST",
          headers: headers,
          body: requestBody,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `HTTP error! status: ${response.status}, message: ${errorText}`
          );
        }

        const result = await response.json();

        // If there are additional photos, upload them separately
        if (additionalPhotos.length > 0) {
          const photoFormData = new FormData();
          additionalPhotos.forEach((photo) => {
            photoFormData.append("photos", photo);
          });

          const photoResponse = await fetch(
            `${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")}/adoption/add-photos/${selectedPet}`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: photoFormData,
            }
          );

          if (!photoResponse.ok) {
            console.warn(
              "Failed to upload additional photos, but adoption post was created successfully."
            );
          }
        }

        toast.success("Adoption post created successfully!", { position: "top-left" });
        resetForm();
        if (onPostCreated) {
          onPostCreated();
        }
        return;
      } else if (petSource === "found-pet") {
        // For found pets, use FormData for file uploads
        endpoint = (import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")) + "/adoption/post-found-pet";
        const formData = new FormData();

        formData.append("adoptionDescription", postText);
        formData.append("petName", petName || "Found Pet");
        formData.append("petSpecies", petSpecies);
        formData.append("petBreed", petBreed || "Unknown");
        formData.append("petAge", petAge || "Unknown");
        formData.append("petColor", petColor || "Unknown");
        formData.append("foundLocation", foundLocation || "Unknown");

        // Add photos if selected
        if (profilePhoto) {
          formData.append("profilePhoto", profilePhoto);
        }

        additionalPhotos.forEach((photo, index) => {
          formData.append("photos", photo);
        });

        requestBody = formData;
        // Don't set Content-Type for FormData, let the browser set it

        const response = await fetch(endpoint, {
          method: "POST",
          headers: headers,
          body: requestBody,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `HTTP error! status: ${response.status}, message: ${errorText}`
          );
        }

        const result = await response.json();
        toast.success("Adoption post created successfully!", { position: "top-left" });
        resetForm();
        if (onPostCreated) {
          onPostCreated();
        }
        return;
      }
    } catch (error) {
      console.error("Error creating adoption post:", error);
      alert(`Failed to create adoption post: ${error.message}`);
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
      <CardContent className="p-6 sm:p-8">
        {!showForm ? (
          <div className="flex items-center gap-4 py-2">
            <Avatar className="w-12 h-12">
              {isAuthenticated && userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/40"; // Fallback on error
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-500 text-white flex items-center justify-center text-lg">
                  <User size={24} />
                </div>
              )}
            </Avatar>
            <Button
              onClick={() => {
                if (isAuthenticated) {
                  setShowForm(true);
                } else {
                  toast.error("Please log in to create an adoption post.", { position: "top-left" });
                }
              }}
              className="flex-1 justify-start rounded-full px-5 py-3 text-base bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 shadow-lg"
            >
              Share a pet for adoption
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <Avatar className="w-12 h-12">
                {isAuthenticated && userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/40"; // Fallback on error
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-500 text-white flex items-center justify-center text-lg">
                    <User size={24} />
                  </div>
                )}
              </Avatar>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Create Adoption Post
                </h2>
                <p className="text-sm text-gray-500">
                  Help a pet find their forever home
                </p>
              </div>
            </div>

            {/* Pet Source Selection */}
            <div className="space-y-4">
              <Label className="text-base font-semibold text-gray-700">
                What type of pet are you posting about?
              </Label>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-1">
                  <input
                    type="radio"
                    name="petSource"
                    value="my-pet"
                    checked={petSource === "my-pet"}
                    onChange={(e) => setPetSource(e.target.value)}
                    className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-base text-gray-700">
                    One of my pets
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-1">
                  <input
                    type="radio"
                    name="petSource"
                    value="found-pet"
                    checked={petSource === "found-pet"}
                    onChange={(e) => setPetSource(e.target.value)}
                    className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-base text-gray-700">
                    Found pet (stray/rescued)
                  </span>
                </label>
              </div>
            </div>

            {/* Conditional Fields Based on Pet Source */}
            {petSource && (
              <div className="space-y-6 pt-4 border-t border-gray-100">
                {petSource === "my-pet" && (
                  <div className="space-y-2">
                    <Label className="text-base font-semibold text-gray-700">
                      Select Your Pet
                    </Label>
                    <Select onValueChange={setSelectedPet} value={selectedPet}>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Choose from your pets" />
                      </SelectTrigger>
                      <SelectContent>
                        {myPets.map((pet) => (
                          <SelectItem key={pet._id} value={pet._id}>
                            {pet.name} - {pet.breed} ({pet.species})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {petSource === "found-pet" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <Label className="text-base font-semibold text-gray-700">
                        Pet Name (if known)
                      </Label>
                      <Input
                        value={petName}
                        onChange={(e) => setPetName(e.target.value)}
                        placeholder="Unknown"
                        className="h-12 text-base"
                      />
                    </div>
                    <div>
                      <Label className="text-base font-semibold text-gray-700">
                        Species
                      </Label>
                      <Select onValueChange={setPetSpecies} value={petSpecies}>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Select species" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dog">Dog</SelectItem>
                          <SelectItem value="cat">Cat</SelectItem>
                          <SelectItem value="bird">Bird</SelectItem>
                          <SelectItem value="rabbit">Rabbit</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-base font-semibold text-gray-700">
                        Breed (if known)
                      </Label>
                      <Input
                        value={petBreed}
                        onChange={(e) => setPetBreed(e.target.value)}
                        placeholder="Mixed/Unknown"
                        className="h-12 text-base"
                      />
                    </div>
                    <div>
                      <Label className="text-base font-semibold text-gray-700">
                        Estimated Age
                      </Label>
                      <Input
                        value={petAge}
                        onChange={(e) => setPetAge(e.target.value)}
                        placeholder="e.g., 2 years, puppy, adult"
                        className="h-12 text-base"
                      />
                    </div>
                    <div>
                      <Label className="text-base font-semibold text-gray-700">
                        Color/Appearance
                      </Label>
                      <Input
                        value={petColor}
                        onChange={(e) => setPetColor(e.target.value)}
                        placeholder="e.g., brown and white"
                        className="h-12 text-base"
                      />
                    </div>
                    <div>
                      <Label className="text-base font-semibold text-gray-700">
                        Found Location
                      </Label>
                      <Input
                        value={foundLocation}
                        onChange={(e) => setFoundLocation(e.target.value)}
                        placeholder="Where did you find this pet?"
                        className="h-12 text-base"
                      />
                    </div>
                  </div>
                )}

                {/* Adoption Type - Only for my pets */}
                {petSource === "my-pet" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-base font-semibold text-gray-700">
                        Adoption Type
                      </Label>
                      <Select
                        onValueChange={setAdoptionType}
                        value={adoptionType}
                      >
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Select Adoption Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="permanent">
                            Permanent Adoption
                          </SelectItem>
                          <SelectItem value="temporary">
                            Temporary Care
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Return Date for Temporary Adoption */}
                    {adoptionType === "temporary" && (
                      <div className="space-y-2">
                        <Label className="text-base font-semibold text-gray-700">
                          Return Date
                        </Label>
                        <Input
                          type="date"
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className="h-12 text-base w-fit"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Photo Upload Section */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold text-gray-700">
                    Pet Photos
                  </Label>

                  {/* Profile Photo - Only for found pets */}
                  {petSource === "found-pet" && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600">
                        Profile Photo *
                      </Label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePhotoChange}
                          className="hidden"
                          id="profile-photo-upload"
                        />
                        <label
                          htmlFor="profile-photo-upload"
                          className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg cursor-pointer hover:bg-purple-200 transition-colors"
                        >
                          <Camera size={16} />
                          Choose Profile Photo
                        </label>
                        {profilePhotoPreview && (
                          <div className="relative">
                            <img
                              src={profilePhotoPreview}
                              alt="Profile preview"
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setProfilePhoto(null);
                                setProfilePhotoPreview(null);
                              }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Additional Photos - For all pet sources */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">
                      {petSource === "my-pet"
                        ? "Add Photos to Pet's Gallery"
                        : "Additional Photos"}
                    </Label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleAdditionalPhotosChange}
                        className="hidden"
                        id="additional-photos-upload"
                      />
                      <label
                        htmlFor="additional-photos-upload"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors w-fit"
                      >
                        <Image size={16} />
                        {petSource === "my-pet"
                          ? "Add Photos"
                          : "Add More Photos"}
                      </label>

                      {/* Photo Previews */}
                      {additionalPhotosPreview.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {additionalPhotosPreview.map((preview, index) => (
                            <div key={index} className="relative">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removeAdditionalPhoto(index)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold text-gray-700">
                    Description
                  </Label>
                  <Textarea
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    placeholder={
                      petSource === "my-pet"
                        ? "Tell potential adopters about your pet's personality, habits, and what kind of home would be perfect for them..."
                        : "Describe the pet's condition when found, any medical care provided, temperament observed, and what kind of home they need..."
                    }
                    rows={5}
                    className="min-h-[120px] text-base"
                  />
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="flex gap-3"></div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={resetForm}
                      className="text-base rounded-full px-5"
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 text-base rounded-full px-6 py-3 shadow-lg"
                      onClick={handlePostAdoption}
                      disabled={
                        !isAuthenticated || // Must be authenticated to post
                        !postText ||
                        !petSource ||
                        !adoptionType ||
                        (petSource === "my-pet" && !selectedPet) ||
                        (petSource === "found-pet" && !petSpecies)
                      }
                    >
                      Post Adoption
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CreatePost;
