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
import { deleteAccount } from "@/components/deleteAccount"; // update path as needed
import { useNavigation } from "@react-navigation/native";

export default function SettingScreen() {
  const router = useRoute();
  const auth = getAuth();
  const navigation = useNavigation();

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

  const handleDeletePress = () => {
    Alert.prompt(
      "Delete Account",
      "Please enter your password to confirm account deletion.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: (password) => {
            deleteAccount(
              password,
              () => {
                Alert.alert(
                  "Account Deleted",
                  "Your account and data have been permanently removed."
                );
                navigation.navigate("Login"); // Or wherever your sign-in screen is
              },
              (errorMessage) => {
                Alert.alert("Error", errorMessage);
              }
            );
          },
        },
      ],
      "secure-text"
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Settings</Text>
      </View>
      <View style={styles.bodyContainer}>
        <TouchableOpacity style={styles.button} onPress={handleDeletePress}>
          <Text style={styles.buttonText}>Delete Account</Text>
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
    backgroundColor: "#1E1F22", // Main dark background
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#2B2D31", // Dark header section
    borderRadius: 20,
    height: "20%",
  },
  headerText: {
    flex: 1,
    fontFamily: "DMSans-Black",
    fontSize: 32,
    lineHeight: 32,
    fontWeight: "bold",
    color: "#FFFFFF", // Clean white header text
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
    color: "#FFFFFF", // Match with dark theme
  },
  bodyContainer: {
    flexDirection: "column",
    alignItems: "stretch",
    paddingHorizontal: 5,
    paddingVertical: 5,
    backgroundColor: "#2B2D31", // Card-style section
    margin: 20,
    borderRadius: 20,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontSize: 18,
    color: "#FFFFFF", // White button text for clarity
  },
  separator: {
    height: 1,
    backgroundColor: "#3A3B3C", // Soft divider line
    width: "80%",
    alignSelf: "center",
  },
});
