const PetAdoption = require("../models/PetAdoption");
const Pet = require("../models/Pet");
const User = require("../models/User");
const AdoptionRequest = require("../models/AdoptionRequest");
const { createNotification } = require("./notificationController");

const postAdoptionRequest = async (req, res) => {
    const { petId, adoptionDescription, adoptionType, returnDate } = req.body;
    const user = await User.findById(req.user._id);
    
    try {
        const pet = await Pet.findById(petId);
        if (!pet || pet.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You can only post adoption requests for your own pets" });
        }
        if (await AdoptionRequest.exists({ PetID: petId })) {
            return res.status(403).json({ message: "Pet is already posted for adoption" });
        }

        const adoption = new PetAdoption({
            PetID: petId,
            AdoptionDescription: adoptionDescription,
            adoptionType,
            ReturnDate: adoptionType === 'temporary' ? returnDate : null
        });

        await adoption.save();

        // Update pet status to "Available"
        pet.status = "Available";
        await pet.save();

        res.status(201).json({ message: "Adoption request posted", adoption });
    } catch (error) {
        res.status(500).json({ message: "Error posting adoption request", error: error.message });
    }
};

const getAvailablePets = async (req, res) => {
    try {
        const pets = await Pet.find({ status: "Available" })
            .populate("ownerId", "name email phone") // Fetch owner details
            .lean();

        // Fetch adoption details for each pet
        const petIds = pets.map(pet => pet._id);
        const adoptionDetails = await PetAdoption.find({ PetID: { $in: petIds } })
            .populate("likes", "name") // Populate likes with user names
            .select("AdoptionDescription adoptionType ReturnDate PetID likes comments")
            .lean();

        // Merge adoption details with pet data and structure response correctly
        const petsWithAdoptionInfo = pets.map(pet => {
            const adoptionInfo = adoptionDetails.find(adopt => adopt.PetID.toString() === pet._id.toString());

            return {
                _id: pet._id,
                name: pet.name,
                species: pet.species,
                dateOfBirth: pet.dateOfBirth,
                breed: pet.breed,
                color: pet.color,
                description: pet.description,
                status: pet.status,
                profilePhoto: pet.profilePhoto,
                photos: pet.photos,
                healthRecords: pet.healthRecords,
                traits: pet.traits,
                createdAt: pet.createdAt,
                adoptionId: adoptionInfo ? adoptionInfo._id : null,
                adoptionDescription: adoptionInfo ? adoptionInfo.AdoptionDescription : null,
                adoptionType: adoptionInfo ? adoptionInfo.adoptionType : null,
                returnDate: adoptionInfo ? adoptionInfo.ReturnDate : null,
                likes: (adoptionInfo && adoptionInfo.likes) ? adoptionInfo.likes.length : 0,
                likedBy: (adoptionInfo && adoptionInfo.likes) ? adoptionInfo.likes.map(like => like.name) : [], // Populate likedBy with user names
                comments: (adoptionInfo && adoptionInfo.comments) ? adoptionInfo.comments.length : 0,
                postedBy: pet.ownerId ? {
                    id: pet.ownerId._id,
                    name: pet.ownerId.name,
                    email: pet.ownerId.email,
                    phone: pet.ownerId.phone
                } : { id: null, name: "Unknown", email: "Unknown", phone: "Unknown" } // Ensure postedBy is always an object
            };
        });

        res.json(petsWithAdoptionInfo);
    } catch (error) {
        res.status(500).json({ message: "Error fetching pets", error: error.message });
    }
};

const commentOnAdoption = async (req, res) => {
    try {
        const { comment, parentId } = req.body;
        const userId = req.user._id;
        const { adoptionId } = req.params;

        // Fetch the adoption post
        const adoption = await PetAdoption.findById(adoptionId);
        if (!adoption) return res.status(404).json({ message: "Adoption post not found" });

        // Check if replying to a valid parent comment
        if (parentId) {
            const parentComment = adoption.comments.find(c => c._id.toString() === parentId);
            if (!parentComment) return res.status(404).json({ message: "Parent comment not found" });
        }

        // Add the new comment
        const newComment = { userId, comment, parentId };
        adoption.comments.push(newComment);
        await adoption.save();

        // Fetch the user details to include in response
        const user = await User.findById(userId).select('name');
        
        // Get the newly added comment and format it properly
        const addedComment = adoption.comments[adoption.comments.length - 1];
        const formattedComment = {
            _id: addedComment._id,
            userId: addedComment.userId,
            comment: addedComment.comment,
            parentId: addedComment.parentId,
            userName: user ? user.name : "Unknown User",
            createdAt: addedComment.createdAt,
            replies: []
        };

        res.status(201).json(formattedComment);
    } catch (error) {
        res.status(500).json({ message: "Error adding comment", error: error.message });
    }
};

const getCommentsForAdoption = async (req, res) => {
    try {
        const { adoptionId } = req.params;

        const adoption = await PetAdoption.findById(adoptionId)
            .populate({
                path: 'comments.userId',
                model: 'User',
                select: 'name'
            })
            .lean();
        if (!adoption) return res.status(404).json({ message: "Adoption post not found" });

        // Convert flat comments into a nested structure and add userName
        const commentMap = {};
        adoption.comments.forEach(comment => {
            commentMap[comment._id] = {
                ...comment,
                userName: comment.userId ? comment.userId.name : "Unknown User",
                replies: []
            };
        });

        const nestedComments = [];
        adoption.comments.forEach(comment => {
            if (comment.parentId) {
                commentMap[comment.parentId]?.replies.push(commentMap[comment._id]);
            } else {
                nestedComments.push(commentMap[comment._id]);
            }
        });

        res.json(nestedComments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching comments", error: error.message });
    }
};

// NEW: Get comment count for an adoption post
const getCommentCount = async (req, res) => {
    try {
        const { adoptionId } = req.params;

        const adoption = await PetAdoption.findById(adoptionId).select('comments');
        if (!adoption) {
            return res.status(404).json({ message: "Adoption post not found" });
        }

        const count = adoption.comments ? adoption.comments.length : 0;
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: "Error fetching comment count", error: error.message });
    }
};

// NEW: Get like status for current user
const getLikeStatus = async (req, res) => {
    try {
        const { adoptionId } = req.params;
        const userId = req.user._id;

        const adoption = await PetAdoption.findById(adoptionId).select('likes');
        if (!adoption) {
            return res.status(404).json({ message: "Adoption post not found" });
        }

        const liked = adoption.likes.includes(userId);
        const totalLikes = adoption.likes.length;

        res.json({ liked, totalLikes });
    } catch (error) {
        res.status(500).json({ message: "Error fetching like status", error: error.message });
    }
};

// UPDATED: Modified likeAdoptionPost to send notifications
const likeAdoptionPost = async (req, res) => {
    try {
        const { adoptionId } = req.params;
        const userId = req.user._id;

        const adoption = await PetAdoption.findById(adoptionId);
        if (!adoption) {
            return res.status(404).json({ message: "Adoption post not found" });
        }

        const index = adoption.likes.indexOf(userId);
        let liked;
        
        if (index === -1) {
            adoption.likes.push(userId);
            liked = true;
            
            // Send notification to pet owner
            const pet = await Pet.findById(adoption.PetID);
            if (pet && pet.ownerId.toString() !== userId.toString()) {
                const user = await User.findById(userId).select('name');
                const message = `${user.name} liked your adoption post for ${pet.name}! (${adoption.likes.length} likes)`;
                
                await createNotification(pet.ownerId, message, pet._id, 'post_liked');
            }
        } else {
            adoption.likes.splice(index, 1);
            liked = false;
        }

        await adoption.save();

        res.json({ 
            liked: liked,
            totalLikes: adoption.likes.length 
        });
    } catch (error) {
        res.status(500).json({ message: "Error liking adoption post", error: error.message });
    }
};

const requestAdoption = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        const adoption = await PetAdoption.findById(req.params.adoptionId);
        if (!adoption) return res.status(404).json({ message: "Adoption post not found" });

        const pet = await Pet.findById(adoption.PetID);
        if (!pet) return res.status(404).json({ message: "Pet not found" });

        // Prevent owner from requesting adoption for their own pet
        if (pet.ownerId.toString() === req.user._id.toString()) {
            return res.status(403).json({ message: "You cannot request adoption for your own pet." });
        }

        // Check if an adoption request already exists for this user and adoption post
        const existingRequest = await AdoptionRequest.findOne({
            adoptionId: adoption._id,
            requesterId: req.user._id
        });

        if (existingRequest) {
            return res.status(409).json({ message: "You have already sent an adoption request for this pet." });
        }

        const request = new AdoptionRequest({ 
            adoptionId: adoption._id, 
            requesterId: req.user._id,
            originalOwnerId: pet.ownerId
        });
        await request.save();

        // Create simple notification
        const requesterUser = await User.findById(req.user._id);
        const message = `New adoption request for ${pet.name} from ${requesterUser.name}`;
        
        await createNotification(pet.ownerId, message, pet._id, 'adoption_request');

        res.status(201).json({ message: "Adoption request sent" });
    } catch (error) {
        res.status(500).json({ message: "Error requesting adoption", error: error.message });
    }
};

const deleteAdoptionRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user._id;

        const adoptionRequest = await AdoptionRequest.findById(requestId).populate("adoptionId");
        if (!adoptionRequest) {
            return res.status(404).json({ message: "Adoption request not found" });
        }

        const pet = await Pet.findById(adoptionRequest.adoptionId.PetID);
        if (!pet) {
            return res.status(404).json({ message: "Pet not found" });
        }

        const isOwner = pet.ownerId.toString() === userId.toString();
        const isRequester = adoptionRequest.requesterId.toString() === userId.toString();

        if (!isOwner && !isRequester) {
            return res.status(403).json({ message: "You are not authorized to delete this request" });
        }

        await AdoptionRequest.findByIdAndDelete(requestId);
        
        // If owner rejected, send notification to requester
        if (isOwner) {
            const requester = await User.findById(adoptionRequest.requesterId);
            if (requester) {
                await createNotification(
                    adoptionRequest.requesterId,
                    `Your adoption request for ${pet.name} has been rejected.`,
                    pet._id,
                    'adoption_rejected'
                );
            }
        }

        res.json({ message: isOwner ? "Adoption request rejected successfully" : "Adoption request cancelled successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting adoption request", error: error.message });
    }
};

const viewAdoptionRequests = async (req, res) => {
    try {
        const { adoptionId } = req.params;
        const userId = req.user._id; // Logged-in user (owner)

        // Check if the adoption post exists
        const adoption = await PetAdoption.findById(adoptionId);
        if (!adoption) return res.status(404).json({ message: "Adoption post not found" });

        // Check if the logged-in user is the owner of the pet
        const pet = await Pet.findById(adoption.PetID);
        if (!pet || pet.ownerId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You are not authorized to view these requests" });
        }

        // Fetch all requests for this adoption post
        const requests = await AdoptionRequest.find({ adoptionId })
            .populate("requesterId", "name email phone");

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: "Error fetching adoption requests", error: error.message });
    }
};

const scheduleMeeting = async (req, res) => {
    try {
        const { meetingDate, notes } = req.body;
        const { requestId } = req.params;
        const userId = req.user._id;

        // Check if the adoption request exists
        const adoptionRequest = await AdoptionRequest.findById(requestId).populate("adoptionId");
        if (!adoptionRequest) return res.status(404).json({ message: "Adoption request not found" });

        // Check if the user is the owner of the pet
        const pet = await Pet.findById(adoptionRequest.adoptionId.PetID);
        if (!pet || pet.ownerId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You are not authorized to schedule a meeting for this pet" });
        }

        // Validate meeting date
        if (!meetingDate) return res.status(400).json({ message: "Meeting date is required" });

        // Update adoption request
        adoptionRequest.meetingDate = meetingDate;
        adoptionRequest.notes = notes || "";
        adoptionRequest.status = "meet scheduled";
        await adoptionRequest.save();

        // Send notification to the requester
        const meetingDateFormatted = new Date(meetingDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Get pet owner details for contact information
        const petOwner = await User.findById(pet.ownerId).select('phone');
        const contactInfo = petOwner && petOwner.phone ? 
            ` Please contact ${petOwner.phone} for further details.` : 
            ' Please check your adoption posts for contact details.';

        console.log('Creating meeting notification with contact info:', contactInfo); 

        await createNotification(
            adoptionRequest.requesterId,
            `Great news! A meeting has been scheduled for your adoption request for ${pet.name} on ${meetingDateFormatted}.${contactInfo}`,
            pet._id,
            'meeting_scheduled'
        );

        res.status(200).json({ message: "Meeting scheduled successfully", adoptionRequest });
    } catch (error) {
        res.status(500).json({ message: "Error scheduling meeting", error: error.message });
    }
};

const updateAdoptionStatus = async (req, res) => {
    try {
        const { requestId } = req.body;
        const { adoptionId } = req.params;

        // Fetch adoption post & adoption request
        const adoption = await PetAdoption.findById(adoptionId);
        const request = await AdoptionRequest.findById(requestId);
        if (!adoption || !request) return res.status(404).json({ message: "Adoption post or request not found" });

        // Fetch pet and adopter
        const pet = await Pet.findById(adoption.PetID);
        const adopter = await User.findById(request.requesterId);
        if (!pet || !adopter) return res.status(404).json({ message: "Pet or adopter not found" });

        // Update pet status
        pet.status = "Adopted";
        pet.ownerId = adopter._id;
        pet.updatedAt = Date.now();
        await pet.save();

        // Update request status
        request.status = "approved";
        await request.save();

        // Mark other requests for this pet post as rejected
        await AdoptionRequest.updateMany(
            { adoptionId, _id: { $ne: requestId } },
            { $set: { status: "rejected" } }
        );

        // Send notification to the adopter
        await createNotification(
            request.requesterId,
            `Congratulations! Your adoption request for ${pet.name} has been accepted. You are now the proud owner!`,
            pet._id,
            'adoption_accepted'
        );

        // Remove adoption post & adoption requests
        // await AdoptionRequest.deleteMany({ adoptionId });
        // await PetAdoption.findByIdAndDelete(adoptionId);

        res.json({ message: "Adoption confirmed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating adoption status", error: error.message });
    }
};

const getMyAdoptionPosts = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find pets owned by the user
        const userPets = await Pet.find({ ownerId: userId }).select('_id').lean();
        const userPetIds = userPets.map(pet => pet._id);

        // Find adoption posts for those pets
        const myAdoptionPosts = await PetAdoption.find({ PetID: { $in: userPetIds } })
            .populate({
                path: 'PetID',
                model: 'Pet'
            })
            .sort({ createdAt: -1 });

        res.json(myAdoptionPosts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching my adoption posts", error: error.message });
    }
};

const deleteAdoptionPost = async (req, res) => {
    try {
        const { adoptionId } = req.params;
        const userId = req.user._id;

        const adoption = await PetAdoption.findById(adoptionId);
        if (!adoption) {
            return res.status(404).json({ message: "Adoption post not found" });
        }

        const pet = await Pet.findById(adoption.PetID);
        if (!pet) {
            return res.status(404).json({ message: "Pet not found" });
        }

        if (pet.ownerId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this post" });
        }

        await PetAdoption.findByIdAndDelete(adoptionId);

        pet.status = "Adopted";
        await pet.save();

        res.json({ message: "Adoption post deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting adoption post", error: error.message });
    }
};

const updateAdoptionPost = async (req, res) => {
    try {
        const { adoptionId } = req.params;
        const { adoptionDescription, adoptionType, returnDate } = req.body;
        const userId = req.user._id;

        const adoption = await PetAdoption.findById(adoptionId);
        if (!adoption) {
            return res.status(404).json({ message: "Adoption post not found" });
        }

        const pet = await Pet.findById(adoption.PetID);
        if (!pet) {
            return res.status(404).json({ message: "Pet not found" });
        }

        if (pet.ownerId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You are not authorized to update this post" });
        }

        adoption.AdoptionDescription = adoptionDescription || adoption.AdoptionDescription;
        adoption.adoptionType = adoptionType || adoption.adoptionType;
        adoption.ReturnDate = adoptionType === 'temporary' ? returnDate : null;
        adoption.updatedAt = Date.now();

        await adoption.save();

        res.json({ message: "Adoption post updated successfully", adoption });
    } catch (error) {
        res.status(500).json({ message: "Error updating adoption post", error: error.message });
    }
};

const getMyAdoptionRequests = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find adoption requests created by this user
        const requests = await AdoptionRequest.find({ requesterId: userId })
            .populate({
                path: 'adoptionId',
                populate: {
                    path: 'PetID',
                    model: 'Pet'
                }
            })
            .sort({ createdAt: -1 });

        // Format them nicely
        const formatted = await Promise.all(requests.map(async (reqItem) => {
            if (!reqItem.adoptionId || !reqItem.adoptionId.PetID) return null;
            
            const pet = reqItem.adoptionId.PetID;
            const owner = await User.findById(pet.ownerId).select("name email phone location");

            return {
                _id: reqItem._id,
                status: reqItem.status,
                meetingDate: reqItem.meetingDate,
                notes: reqItem.notes,
                createdAt: reqItem.createdAt,
                pet: {
                    _id: pet._id,
                    name: pet.name,
                    species: pet.species,
                    breed: pet.breed,
                    color: pet.color,
                    profilePhoto: pet.profilePhoto,
                    status: pet.status
                },
                owner: owner ? {
                    name: owner.name,
                    email: owner.email,
                    phone: owner.phone,
                    location: owner.location
                } : null
            };
        }));

        res.json(formatted.filter(item => item !== null));
    } catch (error) {
        res.status(500).json({ message: "Error fetching my adoption requests", error: error.message });
    }
};

module.exports = { 
    postAdoptionRequest, 
    getAvailablePets, 
    commentOnAdoption, 
    requestAdoption, 
    viewAdoptionRequests, 
    scheduleMeeting, 
    getCommentsForAdoption, 
    getCommentCount,        
    getLikeStatus,          
    updateAdoptionStatus, 
    getMyAdoptionPosts, 
    deleteAdoptionPost, 
    updateAdoptionPost, 
    likeAdoptionPost,       
    deleteAdoptionRequest,
    getMyAdoptionRequests
};