export const useAuth = () => ({
    signIn: jest.fn(() => Promise.resolve()),
    user: null,
    loading: false,
    error: null,
});   