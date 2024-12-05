import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { FIREBASE_AUTH } from "firebaseConfig";
import { getAuth, sendEmailVerification } from "firebase/auth";
import React, { useState } from "react";

const RegisterScreen = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");

  const areFieldsValid = () => {
    return (
      firstName.trim() &&
      lastName.trim() &&
      email &&
      password &&
      passwordConfirmation
    );
  };

  const alreadyRegistered = async (): Promise<boolean> => {
    try {
      const userCredentials = await createUserWithEmailAndPassword(
        FIREBASE_AUTH,
        email,
        password
      );
      return false;
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("Email already registered.");
      } else {
        setError(error.message);
      }
      return true;
    }
  };

  const validPasswords = (): boolean => {
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return false;
    }
    setError("");
    return true;
  };

  const matchesPasswords = (): boolean => {
    if (password !== passwordConfirmation) {
      setPassword("");
      setPasswordConfirmation("");
      setError("Passwords do not match.");
      return true;
    }
    setError("");
    return false;
  };

  const sendEmailConfirmation = async () => {
    try {
      const userCredentials = await createUserWithEmailAndPassword(
        FIREBASE_AUTH,
        email,
        password
      );
      const user = userCredentials.user;

      // send verification
      await sendEmailVerification(user);
      alert(
        "A verification email has been sent to your email address. Please verify to complete registration."
      );
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        alert(
          "This email is already in use. Please use another email or login to your account."
        );
        return;
      } else {
        alert(`Registration failed: ${error.message}`);
        return;
      }
    }

    const acceptTermsAndConditions = () => {};

    const handleRegister = async () => {
      // check if user is already registered
      if (await alreadyRegistered()) {
        return;
      }
      // check if all of the fields are filled
      if (!areFieldsValid()) {
        setError("All fields must be filled.");
        return;
      }
      // check password length < 8 char not valid
      if (validPasswords()) {
        return;
      }
      // check if passwords match
      if (matchesPasswords()) {
        return;
      }
      // send email confirmation
      await sendEmailConfirmation();
    };

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Register</Text>

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
    );
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
});

export default RegisterScreen;
