/** Backend endpoint paths, relative to the Axios instance's baseURL. */
export const API_ROUTES = {
  auth: {
    signUp: '/users/signup',
    login: '/users/login',
    otpSend: '/otp/send',
    otpVerify: '/otp/verify',
    otpResend: '/otp/resend',
  },
} as const;
