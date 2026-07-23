import { useState, useEffect } from "react";
import {
  Heart,
  MessageSquare,
  Share2,
  User,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const NewsfeedPost = ({ post }) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showLikedBy, setShowLikedBy] = useState(false);

  // Favorite functionality
  const [isFavorite, setIsFavorite] = useState(false);

  // Photo carousel state
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const currentUserId = localStorage.getItem("userId");

  const getImageUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop&crop=center";
    const cleanPath = path.replace(/\\/g, "/");
    if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
      return cleanPath;
    }
    if (cleanPath.startsWith("/uploads")) {
      return `http://localhost:7000${cleanPath}`;
    }
    const petId = post.id || post._id;
    if (petId) {
      return `http://localhost:7000/uploads/photos/${petId}/${cleanPath.split("/").pop()}`;
    }
    return `http://localhost:7000/${cleanPath}`;
  };

  // Create array of all photos (profile photo first, then additional photos)
  const allPhotos = [];
  if (post.profilePhoto) {
    allPhotos.push(post.profilePhoto);
  }
  if (post.photos && post.photos.length > 0) {
    // Get most recent 10 additional photos
    const recentPhotos = post.photos.slice(-10).reverse();
    allPhotos.push(...recentPhotos);
  }

  // Navigation functions for photo carousel
  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === allPhotos.length - 1 ? 0 : prev + 1
    );
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? allPhotos.length - 1 : prev - 1
    );
  };

  // Share function
  const handleShare = async () => {
    const shareData = {
      title: `Adopt ${post.name || "this pet"}!`,
      text: `Meet ${post.name || "this adorable pet"} - ${
        post.adoptionDescription || "Looking for a loving home"
      }`,
      url: `${window.location.origin}/pet/${post.id || post._id}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert("Link copied to clipboard!");
      } catch (clipboardError) {
        console.error("Failed to share:", error);
        alert("Failed to share. Please try again.");
      }
    }
  };

  // Favorite functionality
  const handleFavorite = async () => {
    try {
      const token = localStorage.getItem("token");
      const postId = post.adoptionId || post._id || post.id;

      console.log("Favorite button clicked:", {
        postId,
        isFavorite,
        token: !!token,
      });

      if (!token) {
        alert("Please login to add favorites");
        return;
      }

      if (isFavorite) {
        const response = await fetch(
          `http://localhost:7000/favorite/delete/${postId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          setIsFavorite(false);
          console.log("Successfully removed from favorites");
        } else {
          const errorData = await response.json();
          console.error("Remove favorite error:", errorData);
          throw new Error(
            errorData.message || "Failed to remove from favorites"
          );
        }
      } else {
        // Add to favorites
        const response = await fetch("http://localhost:7000/favorite/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ postId }),
        });

        if (response.ok) {
          setIsFavorite(true);
          console.log("Successfully added to favorites");
        } else {
          const errorData = await response.json();
          console.error("Add favorite error:", errorData);
          if (
            response.status === 400 &&
            errorData.message === "Post already in favorites"
          ) {
            setIsFavorite(true);
            return;
          }
          throw new Error(errorData.message || "Failed to add to favorites");
        }
      }

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent("favoritesChanged"));
    } catch (error) {
      console.error("Error handling favorite:", error);
      alert("Failed to update favorites. Please try again.");
    }
  };

  // Check if post is favorited on mount
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const postId = post.adoptionId || post._id || post.id;

        console.log("Checking favorite status:", { postId, token: !!token });

        if (!token || !postId) {
          console.log("Missing auth data, skipping favorite check");
          return;
        }

        const response = await fetch(
          `http://localhost:7000/favorite/check/${postId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setIsFavorite(data.isFavorited);
          console.log("Favorite status checked:", data.isFavorited);
        } else {
          console.error("Failed to check favorite status");
        }
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    checkFavoriteStatus();
  }, [post.adoptionId, post._id, post.id]);

  // Reset photo index when post changes
  useEffect(() => {
    setCurrentPhotoIndex(0);
  }, [post._id]);

  // Initialize like state and comment count on component mount
  useEffect(() => {
    const initializePostData = async () => {
      if (!post.adoptionId) {
        console.warn("No adoptionId found for post:", post);
        return;
      }

      try {
        const token = localStorage.getItem("token");

        // Check if current user has liked this post
        const likeRes = await fetch(
          `http://localhost:7000/adoption/${post.adoptionId}/like-status`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (likeRes.ok) {
          const likeData = await likeRes.json();
          setLiked(likeData.liked);
          setLikes(likeData.totalLikes);
        }

        // Get comment count
        const commentRes = await fetch(
          `http://localhost:7000/adoption/${post.adoptionId}/comments/count`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (commentRes.ok) {
          const commentData = await commentRes.json();
          setCommentCount(commentData.count);
        }
      } catch (error) {
        console.error("Error initializing post data:", error);
      }
    };

    initializePostData();
  }, [post.adoptionId]);

  const handleLike = async () => {
    if (!post.adoptionId) {
      console.warn("No adoptionId found for post:", post);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:7000/adoption/${post.adoptionId}/like`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setLikes(data.totalLikes);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;

    if (!post.adoptionId) {
      console.warn("No adoptionId found for post:", post);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:7000/adoption/${post.adoptionId}/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ comment, parentId: replyingTo }),
        }
      );
      if (res.ok) {
        const newComment = await res.json();

        // If replying to a comment, add to the parent's replies
        if (replyingTo) {
          const updatedComments = comments.map((c) => {
            if (c._id === replyingTo) {
              return {
                ...c,
                replies: [...(c.replies || []), newComment],
              };
            }
            return c;
          });
          setComments(updatedComments);
        } else {
          // If it's a top-level comment, add to main comments array
          setComments([...comments, newComment]);
        }

        setCommentCount(commentCount + 1);
        setComment("");
        setReplyingTo(null);
      }
    } catch (error) {
      console.error("Error commenting on post:", error);
    }
  };

  useEffect(() => {
    const fetchComments = async () => {
      if (!post.adoptionId) {
        console.warn("No adoptionId found for post:", post);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:7000/adoption/${post.adoptionId}/comments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setComments(data);
          setCommentCount(data.length);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    if (showComments && post.adoptionId) {
      fetchComments();
    }
  }, [showComments, post.adoptionId]);

  const handleAdoptionRequest = async () => {
    if (!post.adoptionId) {
      console.warn("No adoptionId found for post:", post);
      toast.error("Unable to send adoption request. Missing adoption information.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:7000/adoption/${post.adoptionId}/request`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.ok) {
        toast.success("Adoption request sent successfully!");
        navigate("/dashboard");
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to send adoption request.");
      }
    } catch (error) {
      console.error("Error sending adoption request:", error);
      toast.error("Error sending adoption request.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden mb-6">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center space-x-3">
          {post.user?.avatar ? (
            <img
              src={post.user.avatar}
              alt={post.user?.name || "User"}
              className="w-12 h-12 rounded-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextElementSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className={`w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center ${
              post.user?.avatar ? "hidden" : ""
            }`}
          >
            <User size={24} className="text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {post.user?.name || "Unknown User"}
            </h3>
            <p className="text-sm text-gray-500">
              {post.user?.location || "Unknown Location"}
            </p>
            <p className="text-xs text-gray-400">
              {post.timestamp || "Unknown Time"}
            </p>
          </div>
        </div>
        <button
          onClick={handleFavorite}
          className={`flex items-center justify-center text-xs font-medium p-2 rounded-full border transition-colors ${
            isFavorite
              ? "bg-rose-100 text-rose-600 border-rose-300 hover:bg-rose-200"
              : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
          }`}
        >
          <Star size={16} className={isFavorite ? "fill-current" : ""} />
        </button>
      </div>
      {/* Pet Image Carousel */}
      <Link to={`/pet/${post.id}`}>
        <div className="relative">
          {allPhotos.length > 0 ? (
            <>
              <img
                src={getImageUrl(allPhotos[currentPhotoIndex])}
                alt={`${post.name || "Pet"} - Photo ${currentPhotoIndex + 1}`}
                className="w-full h-96 max-h-96 object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop&crop=center";
                }}
              />

              {/* Photo counter */}
              {allPhotos.length > 1 && (
                <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                  {currentPhotoIndex + 1}/{allPhotos.length}
                </div>
              )}

              {/* Navigation arrows */}
              {allPhotos.length > 1 && (
                <>
                  {/* Left arrow - only show if not at first photo */}
                  {currentPhotoIndex > 0 && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        prevPhoto();
                      }}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black bg-opacity-30 hover:bg-opacity-50 text-white rounded-full flex items-center justify-center transition-all duration-300"
                    >
                      <ChevronLeft size={20} />
                    </button>
                  )}
                  {/* Right arrow - only show if not at last photo */}
                  {currentPhotoIndex < allPhotos.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        nextPhoto();
                      }}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black bg-opacity-30 hover:bg-opacity-50 text-white rounded-full flex items-center justify-center transition-all duration-300"
                    >
                      <ChevronRight size={20} />
                    </button>
                  )}
                </>
              )}

              {/* Photo indicators */}
              {allPhotos.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {allPhotos.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentPhotoIndex(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentPhotoIndex
                          ? "bg-white"
                          : "bg-white bg-opacity-50"
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <img
              src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop&crop=center"
              alt={post.name || "Pet"}
              className="w-full h-96 max-h-96 object-cover"
            />
          )}
        </div>
      </Link>{" "}
      {/* Pet Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Meet {post.name || "Unknown Pet"}!
          </h2>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-600">
              {post.species || "Unknown Type"}
            </p>
            <p className="text-sm text-gray-500">
              {post.breed || "Unknown Breed"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Age:</span>{" "}
              {post.dateOfBirth
                ? Math.floor(
                    (new Date() - new Date(post.dateOfBirth)) /
                      (365.25 * 24 * 60 * 60 * 1000)
                  ) + " years"
                : "Unknown"}
            </p>
            <p className="text-sm text-gray-700 mt-2">
              <span className="font-medium">Medical records:</span>{" "}
              {post.healthRecords?.length > 0
                ? post.healthRecords[0]
                : "No medical history available"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Personality:</span>{" "}
              {post.traits?.join(", ") || "Friendly"}
            </p>
            <p className="text-sm text-gray-700 mt-2">
              <span className="font-medium">Adoption Type:</span>{" "}
              {post.adoptionType || "Regular"} Adoption
            </p>
            {post.adoptionType === "temporary" && post.returnDate && (
              <p className="text-sm text-gray-700 mt-2">
                <span className="font-medium">Return Date:</span>{" "}
                {new Date(post.returnDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Adoption Description */}
        {post.adoptionDescription && (
          <div className="mb-4">
            <p className="text-sm text-gray-800">{post.adoptionDescription}</p>
          </div>
        )}

        {/* Actions */}
        <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
          <div className="flex space-x-6">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 text-sm ${
                liked ? "text-red-500" : "text-gray-500"
              } hover:text-red-500 transition-colors`}
            >
              <Heart size={20} className={liked ? "fill-current" : ""} />
              <span>{likes}</span>
            </button>

            {post.likedBy && post.likedBy.length > 0 && (
              <button
                onClick={() => setShowLikedBy(!showLikedBy)}
                className="text-sm text-gray-500 hover:underline"
              >
                {post.likedBy.length} likes
              </button>
            )}

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-sm text-gray-500 hover:text-blue-500 transition-colors"
            >
              <MessageSquare size={20} />
              <span>{commentCount}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center space-x-2 text-sm text-gray-500 hover:text-green-500 transition-colors"
            >
              <Share2 size={20} />
              <span>Share</span>
            </button>
          </div>

          {post.status === "Available" &&
            post.postedBy?._id !== currentUserId && (
              <button
                onClick={handleAdoptionRequest}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
              >
                Request Adoption
              </button>
            )}
        </div>

        {/* Liked By Section */}
        {showLikedBy && post.likedBy && post.likedBy.length > 0 && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Liked by: {post.likedBy.join(", ")}
            </p>
          </div>
        )}

        {/* Comments Section */}
        {showComments && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            {comments.map((c) => (
              <div key={c._id} className="flex items-start space-x-3 mb-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User size={16} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">
                    <span className="font-semibold">{c.userName}:</span>{" "}
                    {c.comment}
                  </p>
                  <button
                    onClick={() => setReplyingTo(c._id)}
                    className="text-xs text-gray-500 hover:underline"
                  >
                    Reply
                  </button>
                  {c.replies &&
                    c.replies.map((reply) => (
                      <div
                        key={reply._id}
                        className="flex items-start space-x-3 mt-2 ml-4"
                      >
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                          <User size={12} className="text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">
                            <span className="font-semibold">
                              {reply.userName}:
                            </span>{" "}
                            {reply.comment}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User size={16} className="text-gray-600" />
              </div>
              <input
                type="text"
                placeholder={
                  replyingTo ? "Write a reply..." : "Write a comment..."
                }
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleComment();
                  }
                }}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={handleComment}
                disabled={!comment.trim()}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Comment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsfeedPost;
