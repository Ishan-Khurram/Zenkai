import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { FIREBASE_AUTH, FIREBASE_DB } from "firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { signOut, getAuth, sendPasswordResetEmail } from "firebase/auth";
import React from "react";
import { useRoute } from "@react-navigation/native";

export default function SettingScreen() {
  const router = useRoute();
  const auth = getAuth();

  const handleAccountPress = () => {
    // Navigate to Account Settings screen
  };

  // password change goes here
  const handlePasswordReset = async () => {
    const userEmail = auth.currentUser.email;

    if (!userEmail) {
      Alert.alert("Error", "No email found for the current user.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, userEmail);
      Alert.alert(
        "Password Reset Email Sent",
        "Please check your inbox for the password reset email."
      );
    } catch (error) {
      const errorMessage = error.message;
      Alert.alert(
        "Error",
        `Failed to send password reset email. ${errorMessage}`
      );
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      router.replace("/"); // redirects to index.tsx upon signout.
      // After sign out, the component will re-render and show the login screen
    } catch (error) {}
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Settings</Text>
      </View>
      <View style={styles.bodyContainer}>
        <TouchableOpacity style={styles.button} onPress={handleAccountPress}>
          <Text style={styles.buttonText}>Account</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity style={styles.button} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
        {/* Add more buttons as needed, with separators */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    height: "20%",
  },
  headerText: {
    flex: 1,
    fontFamily: "DMSans-Black",
    fontSize: 32,
    lineHeight: 32,
    fontWeight: "bold",
    color: "#000",
  },
  image: {
    top: "10%",
    height: 55,
    width: 55,
    borderRadius: 50,
    marginRight: 20,
  },
  text: {
    flex: 1,
    fontFamily: "DMSans-Black",
    fontSize: 32,
    lineHeight: 32,
    fontWeight: "bold",
    color: "#000",
  },
  bodyContainer: {
    flexDirection: "column",
    alignItems: "stretch",
    paddingHorizontal: 5,
    paddingVertical: 5,
    backgroundColor: "#f0f0f0",
    margin: 20,
    borderRadius: 20,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontSize: 18,
    color: "#000",
  },
  separator: {
    height: 1,
    backgroundColor: "#ccc",
    width: "80%",
    alignSelf: "center",
  },
});
