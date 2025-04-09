import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Dimensions,
  SafeAreaView,
  Button,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import { FIREBASE_AUTH } from "firebaseConfig";
import { sendEmailVerification } from "firebase/auth";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import Checkbox from "expo-checkbox";

const { width, height } = Dimensions.get("window");

const RegisterScreen = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isChecked, setIsChecked] = useState(false);

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

  const handleAgreementToTermsOfService = (newValue) => {
    setIsChecked(newValue);
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
    if (!isChecked) {
      Alert.alert("Error", "You must agree to the terms of service.");
      return;
    }

    if (!matchesPasswords()) {
      return;
    }

    await sendEmailConfirmation();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
        <SafeAreaView style={styles.container}>
          <Text style={styles.title}>Create Your Account</Text>
          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor="#aaa"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor="#aaa"
              value={lastName}
              onChangeText={setLastName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#aaa"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={passwordConfirmation}
              onChangeText={setPasswordConfirmation}
            />
            <View style={styles.tosContainer}>
              <Checkbox
                style={styles.checkbox}
                value={isChecked}
                onValueChange={handleAgreementToTermsOfService}
              />
              <TouchableOpacity
                onPress={() => navigation.navigate("LegalNoticeScreen")}
                style={styles.tosButton}
              >
                <Text style={styles.tosText}>
                  Read our Terms of Service Here
                </Text>
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.secondaryButtonText}>← Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    display: "flex",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#1E1F22", // Dark background
    paddingHorizontal: 20,
  },
  title: {
    fontSize: width * 0.07,
    fontWeight: "bold",
    color: "#43B581", // Soft green accent
    textAlign: "center",
    marginBottom: height * 0.03,
  },
  card: {
    backgroundColor: "#2B2D31", // Dark card
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  input: {
    backgroundColor: "#1E1F22",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#3A3B3C",
    marginBottom: 15,
    color: "#fff",
  },
  button: {
    backgroundColor: "#43B581",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    marginTop: 15,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#43B581",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "#ff5c5c",
    textAlign: "center",
    marginBottom: 10,
  },
  tosContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#3A3B3C",
    backgroundColor: "#1E1F22",
    marginRight: 10,
  },
  tosButton: {
    flexShrink: 1,
    textAlign: "left",
  },
  tosText: {
    fontSize: 16,
    color: "#43B581",
    textDecorationLine: "underline",
  },
});

export default RegisterScreen;
