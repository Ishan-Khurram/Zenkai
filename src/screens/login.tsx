import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { FIREBASE_AUTH, FIREBASE_DB } from "firebaseConfig";
import { signInWithEmailAndPassword, initializeAuth } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { sendEmailVerification } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

      // store user details within the async storage
      await AsyncStorage.setItem("user", JSON.stringify(user));

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
      setError(error.message);
    }
  };

  // restore authg session when relaunching app
  const restoreAuthSession = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user: User = JSON.parse(userData);
        console.log("User restored from AsyncStorage:", user);
      }
    } catch (error) {
      console.error("Error restoring auth session:", error);
    }
  };

  useEffect(() => {
    restoreAuthSession();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Welcome to Zenkai</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#ffffff"
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
        placeholderTextColor="#ffffff"
        secureTextEntry
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setError("");
        }}
      />

      {/* Horizontal Row for Sign In and Forgot Password */}
      <View style={styles.rowContainer}>
        <TouchableOpacity
          style={styles.halfButton}
          onPress={() => navigation.navigate("ForgotPassword")}
        >
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.halfButtonAlt} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
      </View>

      {/* Full-width Register Button */}
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
    backgroundColor: "#1E1F22", // Dark background
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    marginVertical: 30,
    fontWeight: "bold",
    color: "#FFFFFF", // White title text
  },
  input: {
    width: "90%",
    height: 50,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderColor: "#3A3B3C", // Slightly lighter border
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 15,
    fontSize: 18,
    color: "#FFFFFF",
    backgroundColor: "#2B2D31", // Input field color
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginTop: 25,
  },

  halfButton: {
    width: "48%",
    backgroundColor: "#2B2D31", // Match input background
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#5865F2", // Optional accent border
  },

  halfButtonAlt: {
    width: "48%",
    backgroundColor: "#5865F2",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  forgotText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  button: {
    width: "90%",
    backgroundColor: "#5865F2", // Discord blue
    padding: 15,
    borderRadius: 10,
    marginTop: 25,
    alignItems: "center",
  },
  registerButton: {
    backgroundColor: "#43B581", // Soft green for register
    marginTop: 15,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    color: "#FF5C5C", // Softer red
    marginTop: 10,
  },
});
