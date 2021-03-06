import Api from './api';

export default {
  get: () => Api.get('/api/v1/orders'),
  update: id => Api.patch(`/api/v1/payments/status/${id}`),
  countRedeem: () => Api.get('/api/v1/me'),
  claimReward: () => Api.post('/api/v1/referals/reward', {}),
  postConfirmEmail: () => Api.post('/api/v1/confirm-email/resend', {})
};
