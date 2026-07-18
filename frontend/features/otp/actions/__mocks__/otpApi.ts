// Manual mock for otpApi.ts. Placed in a __mocks__ folder next to the real
// file, so any test that calls jest.mock('../../actions/otpApi') gets this
// fake instead of a function that makes a real network request.
export const sendOtp = jest.fn();
export const verifyOtp = jest.fn();
export const resendOtp = jest.fn();
