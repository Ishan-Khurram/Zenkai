import {
  getAuth,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { deleteDoc, doc, collection, getDocs } from "firebase/firestore";
import { FIREBASE_DB } from "firebaseConfig";
import { Alert } from "react-native";

export const deleteAccount = async (
  password: string,
  onSuccess: () => void,
  onError: (msg: string) => void
) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    onError("No user is currently logged in.");
    return;
  }

  const userId = user.uid;
  console.log(userId);
  const credential = EmailAuthProvider.credential(user.email || "", password);

  try {
    console.log("Reauthenticating...");
    await reauthenticateWithCredential(user, credential);
    console.log("Reauthentication successful");

    console.log("Deleting run folders...");
    const runFolders = await getDocs(
      collection(FIREBASE_DB, "users", userId, "runFolders")
    );
    for (const docSnap of runFolders.docs) {
      await deleteDoc(docSnap.ref);
    }

    console.log("Deleting lift folders...");
    const liftFolders = await getDocs(
      collection(FIREBASE_DB, "users", userId, "liftFolders")
    );

    for (const docSnap of liftFolders.docs) {
      await deleteDoc(docSnap.ref);
    }

    console.log("Deleting weight logs...");
    const weightFolder = await getDocs(
      collection(FIREBASE_DB, "users", userId, "weightFolder")
    );
    for (const docSnap of weightFolder.docs) {
      await deleteDoc(docSnap.ref);
    }

    console.log("Deleting root user doc...");
    await deleteDoc(doc(FIREBASE_DB, "users", userId));

    console.log("Deleting Firebase Auth user...");
    await deleteUser(user);

    onSuccess();
  } catch (error: any) {
    console.error("❌ ERROR at delete step:", error.code, error.message);
    onError(error.message || "Something went wrong");
  }
};
