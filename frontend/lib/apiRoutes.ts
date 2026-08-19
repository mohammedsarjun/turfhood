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
    refresh: '/users/refresh',
    updateName: '/users/me/name',
    updatePhone: '/users/me/phone',
    requestEmailChange: '/users/me/email/request-change',
    confirmEmailChange: '/users/me/email/confirm-change',
    changePassword: '/users/me/password/change',
    setPassword: '/users/me/password/set',
    uploadAvatar: '/users/me/avatar',
  },
  admin: {
    login: '/admin/login',
    logout: '/admin/logout',
    me: '/admin/me',
    refresh: '/admin/refresh',
  },
  sports: {
    base: '/sports',
    public: '/sports/public',
  },
  amenities: {
    base: '/amenities',
    public: '/amenities/public',
  },
  turfOwnerApplications: {
    base: '/turf-owner-applications',
    latest: '/turf-owner-applications/me',
    mine: '/turf-owner-applications/mine',
  },
  courts: {
    forTurf: (turfId: string) => `/turfs/${turfId}/courts`,
    details: (turfId: string, courtId: string) => `/turfs/${turfId}/courts/${courtId}`,
    overrides: (turfId: string, courtId: string) =>
      `/turfs/${turfId}/courts/${courtId}/availability-overrides`,
    override: (turfId: string, courtId: string, overrideId: string) =>
      `/turfs/${turfId}/courts/${courtId}/availability-overrides/${overrideId}`,
  },
  locations: {
    countries: '/locations/countries',
    states: (countryCode: string) => `/locations/countries/${countryCode}/states`,
    cities: (countryCode: string, stateCode: string) =>
      `/locations/countries/${countryCode}/states/${stateCode}/cities`,
  },
} as const;
