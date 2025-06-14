import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, signOut, User, UserCredential } from "firebase/auth";

interface LoginResult {
  success: boolean;
  user?: User;
  error?: any;
}

export const login = async (email: string, password: string): Promise<LoginResult> => {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    return { success: true, user };
  } catch (error) {
    return { success: false, error };
  }
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
  window.location.href = '/';
};
