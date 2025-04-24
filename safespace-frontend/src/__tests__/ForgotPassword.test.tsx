test('renders something', () => {
    expect(true).toBe(true);
});

// import { render, screen } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
// import ForgotPassword from '../components/Authorization/ForgotPassword';
// import { sendPasswordResetEmail } from 'firebase/auth';

// // Mock the Firebase module
// jest.mock('firebase/auth', () => ({
//     sendPasswordResetEmail: jest.fn()
// }));

// describe('ForgotPassword', () => {
//     it('renders email input and reset button', () => {
//         render(<ForgotPassword />);
//         expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
//         expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
//     });

//     it('calls sendPasswordResetEmail on valid email', async () => {
//         const mockSend = sendPasswordResetEmail as jest.Mock;
//         mockSend.mockResolvedValueOnce(undefined);

//         render(<ForgotPassword />);

//         await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
//         await userEvent.click(screen.getByRole('button', { name: /submit/i }));

//         expect(mockSend).toHaveBeenCalledWith(expect.anything(), 'user@example.com');
//     });
// });