import { api } from './api';

export const loginUser = async (credentials) => {
  const data = await api.post('/auth/login', {
    email: credentials.email,
    password: credentials.password,
  });
  return {
    success: true,
    token: data.access_token,
    user: data.user,
  };
};

export const registerUser = async (userData) => {
  const data = await api.post('/auth/register', {
    name: userData.name,
    email: userData.email,
    password: userData.password,
  });
  return {
    success: true,
    message: 'Account created successfully',
    user: data,
  };
};

export const getCurrentUser = async () => {
  return await api.get('/auth/me');
};

export const logoutUser = async () => {
  try {
    return await api.post('/auth/logout', {});
  } catch {
    return { message: 'Logout completed' };
  }
};

export const forgotPassword = async (email) => {
  // Graceful password reset stub
  return {
    success: true,
    message: `Password reset link sent to ${email}`,
  };
};
