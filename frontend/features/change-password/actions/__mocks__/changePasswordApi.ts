// Manual mock for changePasswordApi.ts. Placed in a __mocks__ folder next to the
// real file, so any test that calls jest.mock('../../actions/changePasswordApi')
// gets this fake instead of a function that makes a real network request.
export const changePassword = jest.fn();
