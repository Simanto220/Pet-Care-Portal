const fs = require('fs');
const path = require('path');

const Pet = require('../models/Pet');
const User = require('../models/User');

// Helper function to handle profile photo upload
const handleProfilePhotoUpload = async (petId, reqFiles) => {
    let profilePhotoUrl = null;

    if (!reqFiles || !reqFiles.profilePhoto || reqFiles.profilePhoto.length === 0) {
        return profilePhotoUrl;
    }

    const profileFile = reqFiles.profilePhoto[0];
    const now = new Date();
    const creationDate = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${now.getFullYear()}`;
    const serial = String(Date.now()).slice(-5);
    const newFileName = `${petId}_profile_${creationDate}_${serial}${path.extname(profileFile.originalname)}`;
    const oldPath = profileFile.path;
    const newPath = path.join(__dirname, '../uploads/photos', petId, newFileName); // Ensure petId is included in path

    // Create pet-specific directory if it doesn't exist
    const petPhotoDir = path.dirname(newPath);
    if (!fs.existsSync(petPhotoDir)) {
        await fs.promises.mkdir(petPhotoDir, { recursive: true });
    }

    try {
        await fs.promises.rename(oldPath, newPath);
    } catch (err) {
        await fs.promises.copyFile(oldPath, newPath);
        await fs.promises.unlink(oldPath);
    }
    profilePhotoUrl = `/uploads/photos/${petId}/${newFileName}`; // Correct path

    return profilePhotoUrl;
};

// Helper function to handle other photos upload
const handleOtherPhotosUpload = async (petId, reqFiles) => {
    const photoUrls = [];

    if (!reqFiles || !reqFiles.photos || reqFiles.photos.length === 0) {
        return photoUrls;
    }

    const petPhotoDir = path.join(__dirname, '../uploads/photos', petId); // Directory for all photos

    // Create pet-specific directory if it doesn't exist
    if (!fs.existsSync(petPhotoDir)) {
        await fs.promises.mkdir(petPhotoDir, { recursive: true });
    }

    for (const file of reqFiles.photos) {
        const now = new Date();
        const creationDate = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${now.getFullYear()}`;
        const serial = String(Date.now()).slice(-5);
        const newFileName = `${petId}_${creationDate}_${serial}${path.extname(file.originalname)}`;
        const oldPath = file.path;
        const newPath = path.join(petPhotoDir, newFileName);

        try {
            await fs.promises.rename(oldPath, newPath);
        } catch (err) {
            await fs.promises.copyFile(oldPath, newPath);
            await fs.promises.unlink(oldPath);
        }
        photoUrls.push(`/uploads/photos/${petId}/${newFileName}`); // Correct path
    }

    return photoUrls;
};

// Create Pet Profile
const createPetProfile = async (req, res) => {
    const { name, species, dateOfBirth, breed, color, description, status } = req.body;
    const ownerId = req.user._id;

    try {
        if (!name || !species || !dateOfBirth || !breed || !color) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Parse traits and healthRecords from JSON strings (if they exist)
        let traits = [];
        let healthRecords = [];
        
        if (req.body.traits) {
            try {
                traits = JSON.parse(req.body.traits);
            } catch (e) {
                traits = Array.isArray(req.body.traits) ? req.body.traits : [req.body.traits];
            }
        }
        
        if (req.body.healthRecords) {
            try {
                healthRecords = JSON.parse(req.body.healthRecords);
            } catch (e) {
                healthRecords = Array.isArray(req.body.healthRecords) ? req.body.healthRecords : [req.body.healthRecords];
            }
        }

        // Create a new pet profile first (without photos)
        const pet = new Pet({
            name,
            ownerId,
            species,
            dateOfBirth,
            breed,
            color,
            description: description || '',
            status: status || 'Adopted',
            traits,
            healthRecords,
            photos: [], // Will be populated after file processing
        });

        // Save to database to get the pet ID
        const savedPet = await pet.save();
        const petId = savedPet._id.toString();

        // Process uploaded files using separate helper functions
        const profilePhotoUrl = await handleProfilePhotoUpload(petId, req.files);
        const photoUrls = await handleOtherPhotosUpload(petId, req.files);

        // Update pet with photo URLs
        savedPet.profilePhoto = profilePhotoUrl;
        savedPet.photos = photoUrls;
        await savedPet.save();

        // Add the pet to the owner's profile
        const user = await User.findById(ownerId);
        if (user.petsOwned) {
            user.petsOwned.push(savedPet._id);
        } else {
            user.petsOwned = [savedPet._id];
        }
        await user.save();

        return res.status(201).json({
            message: "Pet profile created successfully",
            pet: savedPet,
        });
    } catch (error) {
        console.error("Error creating pet profile:", error);
        
        // Clean up any uploaded files on error
        if (req.files) {
            const fs = require('fs');
            const allFiles = [];
            if (req.files.profilePhoto) allFiles.push(...req.files.profilePhoto);
            if (req.files.photos) allFiles.push(...req.files.photos);
            
            for (const file of allFiles) {
                try {
                    await fs.promises.unlink(file.path);
                } catch (unlinkError) {
                    console.error("Error cleaning up file:", unlinkError);
                }
            }
        }
        
        return res.status(500).json({ message: "Error creating pet profile", error: error.message });
    }
};

// Update Pet Profile
const updatePetProfile = async (req, res) => {
    const { id } = req.params;
    const { name, species, breed, dateOfBirth, color, description, status } = req.body;

    try {
        // Find the pet by ID
        const pet = await Pet.findById(id);
        if (!pet) {
            return res.status(404).json({ message: "Pet not found" });
        }

        // Check if the authenticated user is the owner of the pet
        if (pet.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to update this pet profile" });
        }

        // Update basic fields if provided
        if (name !== undefined) pet.name = name;
        if (species !== undefined) pet.species = species;
        if (breed !== undefined) pet.breed = breed;
        if (dateOfBirth !== undefined) pet.dateOfBirth = dateOfBirth;
        if (color !== undefined) pet.color = color;
        if (description !== undefined) pet.description = description;
        if (status !== undefined) pet.status = status;

        // Parse and update traits if provided
        if (req.body.traits !== undefined) {
            try {
                pet.traits = JSON.parse(req.body.traits);
            } catch (e) {
                pet.traits = Array.isArray(req.body.traits) ? req.body.traits : [req.body.traits];
            }
        }

        // Parse and update healthRecords if provided
        if (req.body.healthRecords !== undefined) {
            try {
                pet.healthRecords = JSON.parse(req.body.healthRecords);
            } catch (e) {
                pet.healthRecords = Array.isArray(req.body.healthRecords) ? req.body.healthRecords : [req.body.healthRecords];
            }
        }

        // Process newly uploaded files if provided
        if (req.files) {
            if (req.files.profilePhoto && req.files.profilePhoto.length > 0) {
                const profilePhotoUrl = await handleProfilePhotoUpload(id, req.files);
                if (profilePhotoUrl) {
                    pet.profilePhoto = profilePhotoUrl;
                }
            }
            if (req.files.photos && req.files.photos.length > 0) {
                const photoUrls = await handleOtherPhotosUpload(id, req.files);
                if (photoUrls && photoUrls.length > 0) {
                    pet.photos = [...(pet.photos || []), ...photoUrls];
                }
            }
        }

        // Save updated profile
        const updatedPet = await pet.save();

        return res.status(200).json({
            message: "Pet profile updated successfully",
            pet: updatedPet,
        });
    } catch (error) {
        console.error("Error updating pet profile:", error);
        return res.status(500).json({ message: "Error updating pet profile", error: error.message });
    }
};

// Delete Pet Profile
const deletePetProfile = async (req, res) => {
    const { id } = req.params; // Pet ID from URL parameters

    try {
        const pet = await Pet.findById(id);

        if (!pet) {
            return res.status(404).json({ message: "Pet not found" });
        }

        // Check if the authenticated user is the owner of the pet
        if (pet.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this pet profile" });
        }

        // Delete the pet profile
        await Pet.findByIdAndDelete(id);

        return res.status(200).json({ message: "Pet profile deleted successfully" });
    } catch (error) {
        console.error("Error deleting pet profile:", error);
        return res.status(500).json({ message: "Error deleting pet profile", error: error.message });
    }
};

// Get Pet Profile
const getPetProfile = async (req, res) => {
    const { id } = req.params; // Pet ID from URL parameters

    try {
        const pet = await Pet.findById(id).populate('ownerId', 'username name email');

        if (!pet) {
            return res.status(404).json({ message: "Pet not found" });
        }

        const MedicalRecord = require('../models/MedicalRecord');
        const medicalRecords = await MedicalRecord.find({ petId: id })
            .populate('vetId', 'name email phone specialization clinicName')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Pet profile retrieved successfully",
            pet,
            medicalRecords
        });
    } catch (error) {
        console.error("Error fetching pet profile:", error);
        return res.status(500).json({ message: "Error fetching pet profile", error: error.message });
    }
};

// Add Photo to Pet Profile
const addPetPhoto = async (req, res) => {
    const petId = req.params.id;

    try {
        const pet = await Pet.findById(petId);

        if (!pet) {
            return res.status(404).json({ message: "Pet not found" });
        }

        // Check if the authenticated user is the owner of the pet
        if (pet.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to add photos for this pet" });
        }

        // Save the photo path in the database
        // Store the full path to match the current database structure
        const photoPath = `/uploads/photos/${req.file.filename}`;
        pet.photos.push(photoPath);
        await pet.save();

        return res.status(200).json({
            message: "Photo uploaded successfully",
            photoPath,
        });
    } catch (error) {
        console.error("Error adding photo:", error);
        return res.status(500).json({ message: "Error adding photo", error: error.message });
    }
};


// Remove Photo from Pet Profile
const removePetPhoto = async (req, res) => {
    const { id } = req.params; // Pet ID from URL parameters
    const { photo } = req.body;

    try {
        const pet = await Pet.findById(id);
        if (!pet) {
            return res.status(404).json({ message: "Pet not found" });
        }

        if (pet.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to modify this pet profile" });
        }

        // Remove photo
        pet.photos = pet.photos.filter((p) => p !== photo);
        const updatedPet = await pet.save();

        return res.status(200).json({
            message: "Photo removed successfully",
            pet: updatedPet,
        });
    } catch (error) {
        console.error("Error removing photo:", error);
        return res.status(500).json({ message: "Error removing photo", error: error.message });
    }
};

// Get Pet Photos
const getPetPhotos = async (req, res) => {
    const { id } = req.params; // Pet ID from URL parameters

    try {
        const pet = await Pet.findById(id);

        if (!pet) {
            return res.status(404).json({ message: "Pet not found" });
        }

        return res.status(200).json({
            message: "Pet photos retrieved successfully",
            photos: pet.photos,
        });
    } catch (error) {
        console.error("Error fetching pet photos:", error);
        return res.status(500).json({ message: "Error fetching pet photos", error: error.message });
    }
};

const getAllPetsByUser = async (req, res) => {
    const userId = req.user._id;

    try {
        const pets = await Pet.find({ ownerId: userId }).populate('ownerId', 'username name email');
        if (!pets || pets.length === 0) {
            return res.status(404).json({ message: "No pets found for this user" });
        }
        return res.status(200).json({
            message: "Pets retrieved successfully",
            pets,
        });
    } catch (error) {
        console.error("Error fetching user's pets:", error);
        return res.status(500).json({ message: "Error fetching user's pets", error: error.message });
    }       
}

module.exports = { createPetProfile, updatePetProfile, deletePetProfile, getPetProfile, addPetPhoto, removePetPhoto , getPetPhotos, getAllPetsByUser };
