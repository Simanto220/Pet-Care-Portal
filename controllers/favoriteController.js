const Favorite = require('../models/Favorite');
const PetAdoption = require('../models/PetAdoption');
const Pet = require('../models/Pet');

// Add a post to favorites
const addToFavorites = async (req, res) => {
    try {
        const { postId } = req.body;
        const userId = req.user?._id;

        console.log('Add to favorites request:', { postId, userId, user: req.user });

        if (!postId || !userId) {
            return res.status(400).json({ 
                message: 'Post ID and User ID are required',
                debug: { 
                    postId: !!postId, 
                    userId: !!userId, 
                    user: req.user 
                }
            });
        }

        // Check if post exists
        const post = await PetAdoption.findById(postId);
        if (!post) {
            return res.status(404).json({ 
                message: 'Post not found' 
            });
        }

        // Check if already favorited
        const existingFavorite = await Favorite.findOne({ 
            userId, 
            postId 
        });

        if (existingFavorite) {
            return res.status(400).json({ 
                message: 'Post already in favorites' 
            });
        }

        // Create new favorite
        const favorite = new Favorite({
            userId,
            postId,
            postType: 'adoption'
        });

        await favorite.save();

        res.status(201).json({ 
            message: 'Post added to favorites successfully',
            favorite: {
                id: favorite._id,
                userId: favorite.userId,
                postId: favorite.postId,
                createdAt: favorite.createdAt
            }
        });

    } catch (error) {
        console.error('Error adding to favorites:', error);
        res.status(500).json({ 
            message: 'Internal server error',
            error: error.message 
        });
    }
};

// Remove a post from favorites
const removeFromFavorites = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user?._id;

        console.log('Remove from favorites request:', { postId, userId, user: req.user });

        if (!postId || !userId) {
            return res.status(400).json({ 
                message: 'Post ID and User ID are required'
            });
        }

        const favorite = await Favorite.findOneAndDelete({ 
            userId, 
            postId 
        });

        if (!favorite) {
            return res.status(404).json({ 
                message: 'Favorite not found' 
            });
        }

        res.status(200).json({ 
            message: 'Post removed from favorites successfully' 
        });

    } catch (error) {
        console.error('Error removing from favorites:', error);
        res.status(500).json({ 
            message: 'Internal server error',
            error: error.message 
        });
    }
};

// Get all favorites for a user
const getUserFavorites = async (req, res) => {
    try {
        const userId = req.user?._id;

        console.log('Get user favorites request:', { userId, user: req.user});

        if (!userId) {
            return res.status(400).json({ 
                message: 'User ID is required'
            });
        }

        const favorites = await Favorite.find({ userId })
            .populate({
                path: 'postId',
                populate: {
                    path: 'PetID',
                    model: 'Pet',
                    populate: {
                        path: 'ownerId',
                        model: 'User',
                        select: 'name email phone location profilePhoto'
                    }
                }
            })
            .sort({ createdAt: -1 });


        // Filter out any favorites where the post was deleted
        const validFavorites = favorites.filter(fav => fav.postId);

        res.status(200).json({ 
            message: 'Favorites retrieved successfully',
            favorites: validFavorites,
            count: validFavorites.length
        });

    } catch (error) {
        console.error('Error getting user favorites:', error);
        res.status(500).json({ 
            message: 'Internal server error',
            error: error.message 
        });
    }
};

// Get favorite count for a post
const getFavoriteCount = async (req, res) => {
    try {
        const { postId } = req.params;

        if (!postId) {
            return res.status(400).json({ 
                message: 'Post ID is required' 
            });
        }

        const count = await Favorite.countDocuments({ postId });

        res.status(200).json({ 
            postId,
            favoriteCount: count
        });

    } catch (error) {
        console.error('Error getting favorite count:', error);
        res.status(500).json({ 
            message: 'Internal server error',
            error: error.message 
        });
    }
};

const checkFavoriteStatus = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user?._id;

        if (!postId || !userId) {
            return res.status(400).json({ 
                message: 'Post ID and User ID are required' 
            });
        }

        const favorite = await Favorite.findOne({ userId, postId });
        const isFavorited = !!favorite;

        res.status(200).json({ 
            postId,
            isFavorited,
            favoriteId: favorite?._id || null
        });

    } catch (error) {
        console.error('Error checking favorite status:', error);
        res.status(500).json({ 
            message: 'Internal server error',
            error: error.message 
        });
    }
};


module.exports = {
    addToFavorites,
    removeFromFavorites,
    getUserFavorites,
    getFavoriteCount,
    checkFavoriteStatus
};
