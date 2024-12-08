import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { FIREBASE_AUTH } from "firebaseConfig";
import { sendEmailVerification } from "firebase/auth";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window"); // Get screen dimensions

const RegisterScreen = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");

  const navigation = useNavigation();

  const matchesPasswords = (): boolean => {
    if (password !== passwordConfirmation) {
      setPassword("");
      setPasswordConfirmation("");
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const sendEmailConfirmation = async () => {
    try {
      const userCredentials = await createUserWithEmailAndPassword(
        FIREBASE_AUTH,
        email,
        password
      );

      const user = userCredentials.user;

      if (!user) {
        Alert.alert("Error", "User not created. Please try again.");
        return;
      }

      // Send email verification
      await sendEmailVerification(user);

      // Sign out immediately after sending verification email
      await FIREBASE_AUTH.signOut();

      Alert.alert(
        "Registration Successful",
        "A verification email has been sent to your email address. Please verify your email before logging in."
      );
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        Alert.alert(
          "Registration Failed",
          "This email is already in use. Please use another email or log in."
        );
      } else {
        Alert.alert("Registration Failed", error.message);
      }
    }
  };

  const handleRegister = async () => {
    if (!matchesPasswords()) {
      return;
    }
    await sendEmailConfirmation();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} // Adjust as needed
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <SafeAreaView style={styles.container}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Create Your Account</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              secureTextEntry
              value={passwordConfirmation}
              onChangeText={setPasswordConfirmation}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1, // Allows scrolling when keyboard is active
    justifyContent: "center",
  },
  container: {
    flex: 1,
    width: "90%",
    alignSelf: "center",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: height * 0.1, // Dynamic top positioning
    left: width * 0.01, // Dynamic left positioning
    paddingVertical: 5,
  },
  backButtonText: {
    fontSize: width * 0.04, // Relative font size
    color: "#4CAF50",
    fontWeight: "bold",
  },
  title: {
    fontSize: width * 0.07, // Title adjusts to screen width
    fontWeight: "bold",
    marginBottom: height * 0.1, // Dynamic vertical spacing
    textAlign: "center",
    color: "#333",
  },
  form: {
    backgroundColor: "white",
    padding: width * 0.05, // Padding scales with screen width
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: width * 0.03, // Input padding scales with screen width
    borderRadius: 8,
    marginBottom: height * 0.02, // Dynamic spacing between inputs
    fontSize: width * 0.045, // Font size adjusts to screen width
    backgroundColor: "#f2f2f2",
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: height * 0.02, // Vertical padding scales with screen height
    borderRadius: 8,
    alignItems: "center",
    marginTop: height * 0.02, // Dynamic spacing above the button
  },
  buttonText: {
    color: "white",
    fontSize: width * 0.05, // Button text scales with screen width
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: height * 0.02, // Dynamic spacing below the error text
  },
});

export default RegisterScreen;
