import type { PublicUser } from '@turfhood/shared';

export const validProfile: PublicUser = {
  id: 'user_1',
  name: 'Jordan Lee',
  email: 'jordan@example.com',
  phone: '9123456780',
  roles: ['customer'],
  isVerified: true,
  status: 'active',
  createdAt: new Date('2026-01-01').toISOString(),
  hasPassword: true,
  authProviders: ['email'],
};

export const googleOnlyProfile: PublicUser = {
  ...validProfile,
  hasPassword: false,
  authProviders: ['google'],
};
