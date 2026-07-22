// Manual mock for profileApi.ts. Placed in a __mocks__ folder next to the real
// file, so any test that calls jest.mock('../../actions/profileApi') gets this
// fake instead of a function that makes a real network request.
export const getMe = jest.fn();
export const updateName = jest.fn();
export const updatePhone = jest.fn();
export const requestEmailChange = jest.fn();
export const confirmEmailChange = jest.fn();
export const changePassword = jest.fn();
export const setPassword = jest.fn();
export const uploadAvatar = jest.fn();
