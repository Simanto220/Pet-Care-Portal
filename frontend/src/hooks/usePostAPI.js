import { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://localhost:7000');

export const usePostAPI = () => {
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const handleResponse = async (response) => {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/adoption/myPosts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return await handleResponse(response);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (adoptionId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/adoption/${adoptionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return await handleResponse(response);
    } finally {
      setLoading(false);
    }
  };

  const updatePost = async (adoptionId, postData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/adoption/${adoptionId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(postData)
      });
      return await handleResponse(response);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdoptionRequests = async (adoptionId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/adoption/${adoptionId}/requests`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return await handleResponse(response);
    } finally {
      setLoading(false);
    }
  };

  const rejectRequest = async (requestId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/adoption/request/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return await handleResponse(response);
    } finally {
      setLoading(false);
    }
  };

  const scheduleMeeting = async (requestId, meetingData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/adoption/schedule-meeting/${requestId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(meetingData)
      });
      return await handleResponse(response);
    } finally {
      setLoading(false);
    }
  };

  const completeDeal = async (adoptionId, requestId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/adoption/${adoptionId}/status-confirmed`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ requestId })
      });
      return await handleResponse(response);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    fetchPosts,
    deletePost,
    updatePost,
    fetchAdoptionRequests,
    rejectRequest,
    scheduleMeeting,
    completeDeal
  };
};
