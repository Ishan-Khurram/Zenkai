import React, { useState } from "react";
import {
  SafeAreaView,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { sendPasswordResetEmail } from "firebase/auth";
import { FIREBASE_AUTH } from "firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const navigation = useNavigation();

  const handlePasswordReset = async () => {
    if (!email) {
      setError("Please enter your email.");
      return;
    }

    try {
      await sendPasswordResetEmail(FIREBASE_AUTH, email);
    } catch (error) {
      console.log("Error sending password reset:", error); // Don't show error to user
    }

    Alert.alert(
      "Password Reset",
      "If an account with this email exists, a password reset link will be sent to your inbox."
    );
    navigation.goBack(); // Optional: return user to login screen
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.title}>Forgot Password?</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#ffffff"
        keyboardType="email-address"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setError("");
        }}
      />
      <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
        <Text style={styles.buttonText}>Send Email</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#1E1F22",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    marginVertical: 30,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  input: {
    width: "90%",
    height: 50,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderColor: "#3A3B3C",
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 15,
    fontSize: 18,
    color: "#FFFFFF",
    backgroundColor: "#2B2D31",
  },
  button: {
    width: "90%",
    backgroundColor: "#5865F2",
    padding: 15,
    borderRadius: 10,
    marginTop: 25,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    color: "#FF5C5C",
    marginTop: 10,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
  },
});
