import { auth } from './firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  type User,
} from 'firebase/auth';

export async function signIn(email: string, password: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function signOutUser(): Promise<void> {
  return signOut(auth);
}

export async function sendPasswordReset(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email);
}

export async function reauthenticateAndChangePassword(
  email: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No user is currently signed in.');
  }

  const credential = EmailAuthProvider.credential(email, currentPassword);

  try {
    await reauthenticateWithCredential(user, credential);
    // User re-authenticated. Now they can change the password.
    await updatePassword(user, newPassword);
  } catch (error: any) {
    // Handle re-authentication errors, e.g., "auth/wrong-password"
    console.error('Re-authentication failed:', error);
    if (error.code === 'auth/wrong-password') {
      throw new Error(
        'The current password you entered is incorrect. Please try again.'
      );
    }
    throw new Error(
      'Failed to re-authenticate. Please try logging out and in again.'
    );
  }
}
