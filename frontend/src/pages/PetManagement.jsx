import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PetCard from "@/components/profile/PetCard";
import AddPetModal from "@/components/profile/AddPetModal";
import EditPetModal from "@/components/profile/EditPetModal";

const PetManagement = () => {
  const navigate = useNavigate();
  const [selectedPet, setSelectedPet] = useState(null);
  const [showAddPet, setShowAddPet] = useState(false);

  const [pets, setPets] = useState([]); // Initialize as empty array

  const fetchPets = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found, user not logged in");
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
        console.log("Pets data received:", result);
        setPets(result.pets || []);
      } else if (response.status === 404) {
        // No pets found
        setPets([]);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      console.error("Error fetching pets:", err);
      setPets([]); // Ensure pets is always an array even on error
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const [newPet, setNewPet] = useState({
    name: "",
    species: "",
    breed: "",
    dateOfBirth: "",
    color: "",
    description: "",
    status: "Adopted",
    profilePhoto: null,
    photos: [],
    healthRecords: [],
    traits: [],
  });

  const handleAddPet = async () => {
    console.log("Current newPet state:", newPet); // Debug log

    if (
      newPet.name &&
      newPet.breed &&
      newPet.species &&
      newPet.dateOfBirth &&
      newPet.color
    ) {
      try {
        // Get the JWT token from localStorage
        const token = localStorage.getItem("token");
        console.log("Token exists:", !!token); // Debug log

        if (!token) {
          toast.warning("Please log in to add a pet");
          return;
        }

        // Create FormData for the request
        const formData = new FormData();

        // Add text fields
        formData.append("name", newPet.name);
        formData.append("species", newPet.species);
        formData.append("breed", newPet.breed);
        formData.append("dateOfBirth", newPet.dateOfBirth);
        formData.append("color", newPet.color);
        formData.append("description", newPet.description || "");
        formData.append("status", newPet.status || "Adopted");

        // Add traits and health records as JSON strings
        if (newPet.traits && newPet.traits.length > 0) {
          formData.append("traits", JSON.stringify(newPet.traits));
        }
        if (newPet.healthRecords && newPet.healthRecords.length > 0) {
          formData.append(
            "healthRecords",
            JSON.stringify(newPet.healthRecords)
          );
        }

        // Add files
        if (newPet.profilePhoto) {
          formData.append("profilePhoto", newPet.profilePhoto);
        }
        if (newPet.photos && newPet.photos.length > 0) {
          newPet.photos.forEach((photo) => {
            formData.append("photos", photo);
          });
        }

        console.log("Sending FormData to backend...");

        // Call the backend directly
        const response = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")) + "/pet/create", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type for FormData, let browser set it with boundary
          },
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `HTTP error! status: ${response.status}, message: ${errorText}`
          );
        }

        const result = await response.json();
        console.log("Pet created successfully:", result);

        // Refresh the pets list
        await fetchPets();

        // Reset the form
        setNewPet({
          name: "",
          species: "",
          breed: "",
          dateOfBirth: "",
          color: "",
          description: "",
          status: "Adopted",
          profilePhoto: null,
          photos: [],
          healthRecords: [],
          traits: [],
        });

        setShowAddPet(false);
        toast.success("Pet added successfully!");
      } catch (error) {
        console.error("Error adding pet:", error);

        // Provide more specific error messages
        if (error.message.includes("Failed to fetch")) {
          toast.error(
            "Failed to connect to server. Please make sure your backend is running."
          );
        } else if (error.message.includes("401")) {
          toast.error("Authentication failed. Please log in again.");
        } else if (error.message.includes("400")) {
          toast.error("Invalid data provided. Please check all required fields.");
        } else {
          toast.error(`Failed to add pet: ${error.message}`);
        }
      }
    } else {
      toast.warning(
        "Please fill in all required fields (Name, Species, Breed, Date of Birth, Color)"
      );
    }
  };

  const handlePetUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in first");
        return;
      }

      if (!selectedPet.name || !selectedPet.species || !selectedPet.breed || !selectedPet.dateOfBirth || !selectedPet.color) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Send as FormData to support photo file uploads during edit
      const formData = new FormData();
      formData.append("name", selectedPet.name);
      formData.append("species", selectedPet.species);
      formData.append("breed", selectedPet.breed);
      formData.append("dateOfBirth", selectedPet.dateOfBirth);
      formData.append("color", selectedPet.color);
      formData.append("description", selectedPet.description || "");
      formData.append("status", selectedPet.status || "Adopted");

      if (selectedPet.traits && selectedPet.traits.length > 0) {
        formData.append("traits", JSON.stringify(selectedPet.traits));
      }
      if (selectedPet.healthRecords && selectedPet.healthRecords.length > 0) {
        formData.append("healthRecords", JSON.stringify(selectedPet.healthRecords));
      }

      // Check if profilePhoto is a File object (newly uploaded)
      if (selectedPet.profilePhoto instanceof File) {
        formData.append("profilePhoto", selectedPet.profilePhoto);
      }

      // Append any additional photos
      if (selectedPet.photos && selectedPet.photos.length > 0) {
        selectedPet.photos.forEach((photo) => {
          if (photo instanceof File) {
            formData.append("photos", photo);
          }
        });
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")}/pet/update/${selectedPet._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          // Let browser set content-type with boundary
        },
        body: formData,
      });

      if (response.ok) {
        toast.success("Pet profile updated successfully!");
        fetchPets();
        setSelectedPet(null);
      } else {
        const errResult = await response.json();
        throw new Error(errResult.message || "Failed to update pet profile");
      }
    } catch (err) {
      console.error("Error updating pet:", err);
      toast.error(err.message || "An error occurred while updating the pet profile");
    }
  };

  const handleDeletePet = async (petId) => {
    if (window.confirm("Are you sure you want to delete this pet?")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please log in first");
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")}/pet/delete/${petId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          toast.success("Pet deleted successfully!");
          fetchPets();
          setSelectedPet(null);
        } else {
          const errResult = await response.json();
          throw new Error(errResult.message || "Failed to delete pet");
        }
      } catch (err) {
        console.error("Error deleting pet:", err);
        toast.error(err.message || "An error occurred while deleting the pet");
      }
    }
  };

  const addTrait = (trait) => {
    if (!newPet.traits.includes(trait)) {
      setNewPet({ ...newPet, traits: [...newPet.traits, trait] });
    }
  };

  const removeTrait = (trait) => {
    setNewPet({ ...newPet, traits: newPet.traits.filter((t) => t !== trait) });
  };

  const addHealthRecord = (record) => {
    if (!newPet.healthRecords.includes(record)) {
      setNewPet({
        ...newPet,
        healthRecords: [...newPet.healthRecords, record],
      });
    }
  };

  const removeHealthRecord = (record) => {
    setNewPet({
      ...newPet,
      healthRecords: newPet.healthRecords.filter((r) => r !== record),
    });
  };

  return (
    <div className="min-h-screen mt-15 bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">My Pets</h2>
              <button
                onClick={() => setShowAddPet(true)}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add New Pet
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets && Array.isArray(pets) && pets.length > 0 ? (
              pets.map((pet) => (
                <PetCard
                  key={pet._id || pet.id}
                  pet={pet}
                  setSelectedPet={setSelectedPet}
                  onCardClick={() => navigate(`/pet/${pet._id}`)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No pets found. Add your first pet!
              </div>
            )}
          </div>
        </div>
        {showAddPet && (
          <AddPetModal
            newPet={newPet}
            setNewPet={setNewPet}
            handleAddPet={handleAddPet}
            setShowAddPet={setShowAddPet}
            addTrait={addTrait}
            removeTrait={removeTrait}
            addHealthRecord={addHealthRecord}
            removeHealthRecord={removeHealthRecord}
          />
        )}
        {selectedPet && (
          <EditPetModal
            selectedPet={selectedPet}
            setSelectedPet={setSelectedPet}
            handlePetUpdate={handlePetUpdate}
            handleDeletePet={handleDeletePet}
          />
        )}
      </div>
    </div>
  );
};

export default PetManagement;
