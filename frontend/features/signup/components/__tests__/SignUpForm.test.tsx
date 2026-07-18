
import userEvent from '@testing-library/user-event';
import { push } from '@/__mocks__/next/navigation';
import { render, screen, waitFor } from '@/test/test-utils';
import { validSignUpApiResponse, validSignUpFormValues } from '@/test/fixtures/signup.fixture';
import { signUp } from '../../actions/signUpApi';
import { SignUpForm } from '../SignUpForm';


jest.mock('../../actions/signUpApi');
const signUpMock = jest.mocked(signUp);

describe('SignUpForm', () => {
  beforeEach(() => {

    push.mockClear();
    signUpMock.mockClear();
  });


  it('renders the heading and every expected field', () => {
    render(<SignUpForm />);

    expect(screen.getByRole('heading', { name: /get started/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/create password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create my account/i })).toBeInTheDocument();
  });

  // INTERACTION TEST (happy path): fills in valid data, submits, and checks
  // that our signUp() function was called with exactly what the user typed.
  it('submits the form with the values the user typed in', async () => {
    const user = userEvent.setup();
    signUpMock.mockResolvedValueOnce(validSignUpApiResponse);

    render(<SignUpForm />);

    await user.type(screen.getByLabelText(/full name/i), validSignUpFormValues.name);
    await user.type(screen.getByLabelText(/email address/i), validSignUpFormValues.email);
    await user.type(screen.getByLabelText(/phone number/i), validSignUpFormValues.phone);
    await user.type(screen.getByLabelText(/create password/i), validSignUpFormValues.password);
    await user.click(screen.getByLabelText(/by creating an account/i));
    await user.click(screen.getByRole('button', { name: /create my account/i }));

    await waitFor(() => {
      expect(signUpMock).toHaveBeenCalledWith(validSignUpFormValues);
    });
    // After a successful signup, the form should redirect to the OTP verification page.
    expect(push).toHaveBeenCalledWith(
      `/otp?email=${encodeURIComponent(validSignUpFormValues.email)}&purpose=signup&expiresInSeconds=${validSignUpApiResponse.expiresInSeconds}`,
    );
  });

  // INTERACTION TEST (error case): tries to submit without agreeing to the
  // terms, and checks the form blocks it — signUp() must never be called.
  it('does not submit when the terms checkbox is left unchecked', async () => {
    const user = userEvent.setup();

    render(<SignUpForm />);

    await user.type(screen.getByLabelText(/full name/i), validSignUpFormValues.name);
    await user.type(screen.getByLabelText(/email address/i), validSignUpFormValues.email);
    await user.type(screen.getByLabelText(/phone number/i), validSignUpFormValues.phone);
    await user.type(screen.getByLabelText(/create password/i), validSignUpFormValues.password);
    // Note: terms checkbox is intentionally left unchecked.
    await user.click(screen.getByRole('button', { name: /create my account/i }));

    expect(
      await screen.findByText(/you must agree to the terms of service/i),
    ).toBeInTheDocument();
    expect(signUpMock).not.toHaveBeenCalled();
  });
});
