const express = require('express');
const { getAllPetsByUser, createPetProfile, updatePetProfile, deletePetProfile, getPetProfile, addPetPhoto, removePetPhoto , getPetPhotos } = require('../controllers/petController');
const { jwtVerification } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadHandler');
const uploadCreate = require('../middlewares/uploadCreateHandler');
const router = express.Router();

// Create a pet profile with optional photo uploads
router.post('/create', jwtVerification, uploadCreate.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'photos', maxCount: 10 }
]), createPetProfile);

// Get a pet profile
router.get('/profile/:id', jwtVerification, getPetProfile);

// Update a pet profile
router.put('/update/:id', jwtVerification, uploadCreate.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'photos', maxCount: 10 }
]), updatePetProfile);

// Delete a pet profile
router.delete('/delete/:id', jwtVerification, deletePetProfile);

// Add photo for a pet
router.post('/photos/add/:id', jwtVerification, upload.single('photo'), addPetPhoto);

// Remove a photo from a pet profile
router.patch('/photos/delete/:id', jwtVerification, removePetPhoto);

// Get pet photos
router.get('/photos/:id', jwtVerification, getPetPhotos);

// backend route
router.get('/myPets', jwtVerification, getAllPetsByUser);


module.exports = router;
