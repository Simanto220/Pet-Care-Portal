import { apiFetch } from '../lib/api';

export const getAdoptionPosts = async () => {
    try {
        return await apiFetch('/adoption/posts');
    } catch (error) {
        throw new Error(error.message || 'Error fetching adoption posts');
    }
};

export const deleteAdoptionPost = async (adoptionId) => {
    try {
        return await apiFetch(`/adoption/${adoptionId}`, { method: 'DELETE' });
    } catch (error) {
        throw new Error(error.message || 'Error deleting adoption post');
    }
};

export const updateAdoptionPost = async (adoptionId, postData) => {
    try {
        return await apiFetch(`/adoption/${adoptionId}`, { method: 'PUT', body: postData });
    } catch (error) {
        throw new Error(error.message || 'Error updating adoption post');
    }
};
