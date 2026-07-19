/** Backend endpoint paths, relative to the Axios instance's baseURL. */
export const API_ROUTES = {
  auth: {
    signUp: '/users/signup',
    login: '/users/login',
    google: '/users/google',
    otpSend: '/otp/send',
    otpVerify: '/otp/verify',
    otpResend: '/otp/resend',
    forgotPasswordRequest: '/password-reset/request',
    resetPassword: '/password-reset/reset',
  },
  users: {
    me: '/users/me',
    logout: '/users/logout',
    updateName: '/users/me/name',
    updatePhone: '/users/me/phone',
    requestEmailChange: '/users/me/email/request-change',
    confirmEmailChange: '/users/me/email/confirm-change',
    changePassword: '/users/me/password/change',
    setPassword: '/users/me/password/set',
    uploadAvatar: '/users/me/avatar',
  },
} as const;
