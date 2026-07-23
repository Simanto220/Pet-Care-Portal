import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PostCard from "../../components/PostCard";
import EditPostModal from "../../components/EditPostModal";
import ViewRequestsModal from "@/components/ViewRequestsModal";
import ScheduleMeetingModal from "@/components/ScheduleMeetingModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import { usePostAPI } from "@/hooks/usePostAPI";
import { PawPrint } from "lucide-react";
import { useSearchParams, Link } from "react-router-dom"; // Added Link
import { toast } from "react-toastify";

const Post = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showScheduleMeetingModal, setShowScheduleMeetingModal] =
    useState(false);

  // Current data states
  const [currentPost, setCurrentPost] = useState(null);
  const [currentAdoptionRequests, setCurrentAdoptionRequests] = useState([]);
  const [selectedPostForRequests, setSelectedPostForRequests] = useState(null);
  const [currentRequestId, setCurrentRequestId] = useState(null);

  const {
    fetchPosts,
    deletePost,
    updatePost,
    fetchAdoptionRequests,
    rejectRequest,
    scheduleMeeting,
    completeDeal,
  } = usePostAPI();

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await fetchPosts();
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // Check for viewRequests query parameter and auto-open modal
  useEffect(() => {
    const viewRequestsParam = searchParams.get("viewRequests");
    if (viewRequestsParam && posts.length > 0) {
      // Find the post that matches the adoption ID
      const targetPost = posts.find(
        (post) => post.adoptionId === viewRequestsParam
      );
      if (targetPost) {
        handleViewRequests(viewRequestsParam);
        // Remove the query parameter after opening the modal
        searchParams.delete("viewRequests");
        setSearchParams(searchParams);
      }
    }
  }, [posts, searchParams, setSearchParams]);

  const handleDelete = async (adoptionId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await deletePost(adoptionId);
      await loadPosts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (post) => {
    setCurrentPost(post);
    setEditModalOpen(true);
  };

  const handleUpdate = async (postData) => {
    try {
      await updatePost(currentPost._id, postData);
      setEditModalOpen(false);
      await loadPosts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleViewRequests = async (adoptionId) => {
    try {
      const data = await fetchAdoptionRequests(adoptionId);
      setCurrentAdoptionRequests(data);
      setSelectedPostForRequests(adoptionId);
      setShowRequestsModal(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await rejectRequest(requestId);
      toast.success("Request rejected successfully!");
      await handleViewRequests(selectedPostForRequests);
    } catch (err) {
      toast.error(err.message || "Failed to reject request");
    }
  };

  const handleScheduleMeeting = (request) => {
    setCurrentRequestId(request._id);
    setShowScheduleMeetingModal(true);
  };

  const handleSaveMeeting = async (meetingData) => {
    try {
      await scheduleMeeting(currentRequestId, meetingData);
      toast.success("Meeting scheduled successfully!");
      setShowScheduleMeetingModal(false);
      await handleViewRequests(selectedPostForRequests);
    } catch (err) {
      toast.error(err.message || "Failed to schedule meeting");
    }
  };

  const handleDealCompleted = async (requestId, adoptionId) => {
    try {
      await completeDeal(adoptionId, requestId);
      toast.success("Adoption deal completed successfully!");
      setShowRequestsModal(false);
      await loadPosts();
    } catch (err) {
      toast.error(err.message || "Failed to complete deal");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadPosts} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-100">
      <div className="container mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="flex items-center justify-center gap-3">
            <PawPrint className="w-10 h-10 text-pink-600" />
            <h1 className="text-4xl font-extrabold text-gray-800">
              My Adoption Posts
            </h1>
          </div>
          <p className="text-gray-600 mt-2">
            Manage and share your pet adoption listings 🐶🐱
          </p>
        </motion.div>

        {posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white rounded-2xl shadow-lg"
          >
            <div className="text-7xl animate-bounce mb-4">🐾</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No posts yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first adoption post to get started!
            </p>
            <Link
              to="/create-post"
              className="px-6 py-3 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-medium shadow-md transition inline-block"
            >
              + Create Post
            </Link>
          </motion.div>
        ) : (
          <div className="">
            {posts.map((post) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <PostCard
                  post={post}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onViewRequests={handleViewRequests}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Modals */}
        {editModalOpen && (
          <EditPostModal
            post={currentPost}
            onClose={() => setEditModalOpen(false)}
            onUpdate={handleUpdate}
          />
        )}

        {showRequestsModal && (
          <ViewRequestsModal
            requests={currentAdoptionRequests}
            onClose={() => setShowRequestsModal(false)}
            onReject={handleRejectRequest}
            onScheduleMeeting={handleScheduleMeeting}
            onDealCompleted={handleDealCompleted}
            adoptionId={selectedPostForRequests}
          />
        )}

        {showScheduleMeetingModal && (
          <ScheduleMeetingModal
            onClose={() => setShowScheduleMeetingModal(false)}
            onSave={handleSaveMeeting}
            requestId={currentRequestId}
            existingRequest={currentAdoptionRequests.find(
              (r) => r._id === currentRequestId
            )}
          />
        )}
      </div>
    </div>
  );
};

export default Post;
