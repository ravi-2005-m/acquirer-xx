import api from './axiosConfig';

const pp = ({ page = 0, size = 20, sortBy = 'loginAt', sortDir = 'DESC' } = {}) => ({
  page, size, ...(sortBy && { sortBy }), sortDir,
});

export const profileApi = {
  getMyProfile: () =>
    api.get('/iam/me'),

  updateMyProfile: (payload) =>
    api.patch('/iam/me', payload),

  changeMyPassword: ({ currentPassword, newPassword }) =>
    api.post('/iam/me/change-password', { currentPassword, newPassword }),

  getMyLoginHistory: (pagination) =>
    api.get('/iam/me/login-history', { params: pp(pagination) }),

  getMyPreferences: () =>
    api.get('/iam/me/preferences'),

  updateMyPreferences: (payload) =>
    api.patch('/iam/me/preferences', payload),
};
