import { api } from './api';

export const getUserDetails = async () => {
  return await api.get('/users/me');
};

export const updateUserDetails = async (userData) => {
  return await api.put('/users/me', userData);
};

export const getUserProfile = async () => {
  return await api.get('/users/me/profile');
};

export const updateUserProfile = async (profileData) => {
  return await api.put('/users/me/profile', profileData);
};
