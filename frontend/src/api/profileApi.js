import api from './axiosConfig';

export const profileApi = {
  getMyProfile: () =>
    api.get('/iam/me'),

  updateMyProfile: (payload) =>
    api.patch('/iam/me', payload),

  changeMyPassword: ({ currentPassword, newPassword }) =>
    api.post('/iam/me/change-password', { currentPassword, newPassword }),
};
