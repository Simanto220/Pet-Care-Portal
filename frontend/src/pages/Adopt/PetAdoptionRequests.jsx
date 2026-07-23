import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, MessageSquare, Check, X } from 'lucide-react';

const PetAdoptionRequests = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPetAndRequests();
  }, [petId]);

  const fetchPetAndRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch pet details
      const petResponse = await fetch(`http://localhost:7000/pet/profile/${petId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (petResponse.ok) {
        const petData = await petResponse.json();
        setPet(petData.pet);
      }

      // Fetch adoption requests for this pet
      // First, find the adoption post for this pet
      const adoptionResponse = await fetch(`http://localhost:7000/adoption/pets`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (adoptionResponse.ok) {
        const adoptions = await adoptionResponse.json();
        const petAdoption = adoptions.find(adoption => adoption._id === petId);
        
        if (petAdoption) {
          // Fetch requests for this adoption
          const requestsResponse = await fetch(`http://localhost:7000/adoption/${petAdoption.adoptionId}/requests`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (requestsResponse.ok) {
            const requestsData = await requestsResponse.json();
            setRequests(requestsData.requests || []);
          }
        }
      }

    } catch (err) {
      setError('Failed to load adoption requests');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:7000/adoption/requests/${requestId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Refresh the requests
        fetchPetAndRequests();
        alert('Adoption request approved!');
      } else {
        alert('Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:7000/adoption/requests/${requestId}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Refresh the requests
        fetchPetAndRequests();
        alert('Adoption request rejected');
      } else {
        alert('Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading adoption requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          {pet && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                  {pet.photos?.[0] ? (
                    <img
                      src={`http://localhost:7000${pet.photos[0]}`}
                      alt={pet.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      🐾
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{pet.name}</h1>
                  <p className="text-gray-600">{pet.species} • {pet.breed}</p>
                </div>
              </div>
            </div>
          )}

          <h2 className="text-xl font-semibold text-gray-900">
            Adoption Requests ({requests.length})
          </h2>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No adoption requests yet</h3>
            <p className="text-gray-600">When someone requests to adopt {pet?.name}, they'll appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request._id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* User Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>

                    {/* Request Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {request.requester?.name || 'Unknown User'}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.status === 'approved' 
                            ? 'bg-green-100 text-green-800'
                            : request.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status || 'Pending'}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm mb-2">
                        {request.requester?.email}
                      </p>

                      <div className="flex items-center text-gray-500 text-sm">
                        <Calendar className="w-4 h-4 mr-1" />
                        Requested on {new Date(request.createdAt).toLocaleDateString()}
                      </div>

                      {request.message && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{request.message}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {(!request.status || request.status === 'pending') && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleApproveRequest(request._id)}
                        className="flex items-center px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request._id)}
                        className="flex items-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PetAdoptionRequests;
