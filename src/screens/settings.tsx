import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { FIREBASE_AUTH } from "firebaseConfig";
import { signOut } from "firebase/auth";
import React from "react";
import { useRoute } from "@react-navigation/native";

export default function SettingScreen() {
  const router = useRoute();
  const handleAccountPress = () => {
    // Navigate to Account Settings screen
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
        <Image style={styles.image} source={require("../images/icon.jpeg")} />
        <Text style={styles.headerText}>Ishan Khurram</Text>
      </View>
      <View style={styles.bodyContainer}>
        <ScrollView>
          <TouchableOpacity style={styles.button} onPress={handleAccountPress}>
            <Text style={styles.buttonText}>Account</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.button} onPress={handleSignOut}>
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
          {/* Add more buttons as needed, with separators */}
        </ScrollView>
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
    alignItems: "center",
    height: "20%",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
  },
  headerText: {
    flex: 1,
    fontFamily: "DMSans-Black",
    fontSize: 32,
    lineHeight: 32,
    fontWeight: "bold",
    color: "#000",
    top: "10%",
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
