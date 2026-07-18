// Manual mock for loginApi.ts. Placed in a __mocks__ folder next to the
// real file, so any test that calls jest.mock('../../actions/loginApi')
// gets this fake instead of a function that makes a real network request.
export const login = jest.fn();
