// Manual mock for signUpApi.ts. Placed in a __mocks__ folder next to the
// real file, so any test that calls jest.mock('../../actions/signUpApi')
// gets this fake instead of a function that makes a real network request.
export const signUp = jest.fn();
