import type { SignUpResponse } from '@/features/signup/types';


export const validSignUpFormValues = {
  name: 'Jordan Lee',
  email: 'jordan@example.com',
  phone: '9123456780',
  password: 'password1',
};

export const validSignUpApiResponse: SignUpResponse = {
  user: {
    id: 'user_1',
    name: validSignUpFormValues.name,
    email: validSignUpFormValues.email,
    phone: validSignUpFormValues.phone,
    roles: ['customer'],
    isVerified: false,
    status: 'active',
    createdAt: new Date('2026-01-01').toISOString(),
  },
  expiresInSeconds: 60,
};
