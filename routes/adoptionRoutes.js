// routes/adoptionRoutes.js
const express = require("express");
const router = express.Router();
const { jwtVerification } = require('../middlewares/authMiddleware');
const uploadCreate = require('../middlewares/uploadCreateHandler'); // Add upload middleware
const { 
    postAdoptionRequest, 
    getAvailablePets, 
    commentOnAdoption, 
    requestAdoption, 
    viewAdoptionRequests, 
    getCommentsForAdoption, 
    getCommentCount, 
    getLikeStatus,        
    scheduleMeeting,
    updateAdoptionStatus, 
    getMyAdoptionPosts, 
    deleteAdoptionPost, 
    updateAdoptionPost, 
    likeAdoptionPost, 
    deleteAdoptionRequest,
    getMyAdoptionRequests
} = require("../controllers/adoptionController");

// Get all adoption posts
router.get("/myPosts", jwtVerification, getMyAdoptionPosts);

// Get all adoption requests sent by me
router.get("/myRequests", jwtVerification, getMyAdoptionRequests);

// Delete an adoption post
router.delete("/:adoptionId", jwtVerification, deleteAdoptionPost);

// Update an adoption post
router.put("/:adoptionId", jwtVerification, updateAdoptionPost);

// Post an adoption request
router.post("/post", jwtVerification, postAdoptionRequest);

// TODO: Implement these routes when functions are available
// // NEW: Post a found pet for adoption (creates pet profile + adoption post) with photo uploads
// router.post("/post-found-pet", jwtVerification, uploadCreate.fields([
//     { name: 'profilePhoto', maxCount: 1 },
//     { name: 'photos', maxCount: 10 }
// ]), postFoundPetForAdoption);

// // NEW: Add photos to existing pet for adoption
// router.post("/add-photos/:petId", jwtVerification, uploadCreate.fields([
//     { name: 'profilePhoto', maxCount: 1 },
//     { name: 'photos', maxCount: 10 }
// ]), addPhotosToAdoptionPet);

// Get available pets for adoption
router.get("/pets", jwtVerification, getAvailablePets);

// Comment on an adoption request
router.post("/:adoptionId/comment", jwtVerification, commentOnAdoption);

// Get all comments on an adoption request
router.get("/:adoptionId/comments", jwtVerification, getCommentsForAdoption);

// NEW: Get comment count for an adoption post
router.get("/:adoptionId/comments/count", jwtVerification, getCommentCount);

// NEW: Get like status for current user
router.get("/:adoptionId/like-status", jwtVerification, getLikeStatus);

// Request for adoption
router.post("/:adoptionId/request", jwtVerification, requestAdoption);

// View adoption requests
router.get("/:adoptionId/requests", jwtVerification, viewAdoptionRequests);

// Delete an adoption request
router.delete("/request/:requestId", jwtVerification, deleteAdoptionRequest);

// Schedule Meeting
router.post("/schedule-meeting/:requestId", jwtVerification, scheduleMeeting);

// Update Adoption Status
router.post("/:adoptionId/status-confirmed", jwtVerification, updateAdoptionStatus);

// Like an adoption post
router.post("/:adoptionId/like", jwtVerification, likeAdoptionPost);

module.exports = router;