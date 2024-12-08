import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { FIREBASE_AUTH, FIREBASE_DB } from "firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { sendEmailVerification } from "firebase/auth";

interface SignInScreenProps {
  onSignIn: (email: string, password: string) => void;
  onRegister?: () => void;
}

export default function SignInScreen({ onSignIn }: SignInScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigation = useNavigation();

  // Function to create a user document
  const createUserDoc = async (userId: string, userEmail: string) => {
    const userDocRef = doc(FIREBASE_DB, "users", userId);
    await setDoc(userDocRef, { email: userEmail });
  };

  const handleSignIn = async () => {
    if (email === "" || password === "") {
      setError("Please enter email and password.");
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(
        FIREBASE_AUTH,
        email,
        password
      );
      const user = userCredential.user;

      // Check if the email is verified
      if (!user.emailVerified) {
        await FIREBASE_AUTH.signOut(); // Sign out the user immediately
        Alert.alert(
          "Email Not Verified",
          "Your email is not verified. Please check your inbox or resend the verification email.",
          [
            {
              text: "Resend Email",
              onPress: async () => {
                try {
                  await sendEmailVerification(user);
                  Alert.alert(
                    "Verification Email Sent",
                    "Please check your inbox for the verification email."
                  );
                } catch (error: any) {
                  Alert.alert(
                    "Error",
                    "Failed to send verification email. Please try again later."
                  );
                }
              },
            },
            { text: "Cancel", style: "cancel" },
          ]
        );
        return;
      }

      setError(""); // Clear error if successful
      console.log("User signed in successfully!"); // Or navigate to the next screen
    } catch (error: any) {
      setError(error.message); // Display Firebase error message if sign-in fails
    }
  };

  // Register function
  const handleRegister = async () => {
    if (email === "" || password === "") {
      setError("Please enter email and password.");
      return;
    }
    try {
      const userCredentials = await createUserWithEmailAndPassword(
        FIREBASE_AUTH,
        email,
        password
      );
      const userId = userCredentials.user.uid;
      const userEmail = userCredentials.user.email ?? "";

      await createUserDoc(userId, userEmail);
      setError("");
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Welcome to Zenkai</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setError("");
        }}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setError("");
        }}
      />
      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.registerButton]}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    marginVertical: 30,
    fontWeight: "bold",
  },
  input: {
    width: "90%",
    height: 50,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 15,
    fontSize: 18,
  },
  button: {
    width: "90%",
    backgroundColor: "#4285F4",
    padding: 15,
    borderRadius: 10,
    marginTop: 25,
    alignItems: "center",
  },
  registerButton: {
    backgroundColor: "#34A853",
    marginTop: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  errorText: {
    color: "red",
    marginTop: 10,
  },
});
