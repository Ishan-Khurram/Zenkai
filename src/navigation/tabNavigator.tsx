import React, { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import Runs from "@/screens/runs";
import Lifts from "@/screens/lifts";
import AddActivity from "@/screens/addActivity";
import Weight from "@/screens/weight";
import Settings from "@/screens/settings";
import LoginScreen from "@/screens/login";
import { FIREBASE_AUTH } from "firebaseConfig";
import {
  MaterialCommunityIcons,
  Ionicons,
  AntDesign,
  FontAwesome6,
} from "@expo/vector-icons";
import { Pressable, View, Text, Modal, StyleSheet } from "react-native";
import SignInScreen from "@/screens/login";
import AddLift from "@/screens/addLift";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator: React.FC = () => {
  // start with null so even if the user is authenticated, the login screen doesnt flash on
  // every app open.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const navigation = useNavigation();

  // Set up auth listener to check if the user is logged in or not
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setIsAuthenticated(!!user);
    });
    return unsubscribe; // Cleanup on unmount
  }, []);

  // // Display loading or login based on auth status
  // if (isAuthenticated === null) {
  //   return <SignInScreen />;
  // }

  if (!isAuthenticated) {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    );
  }

  // When authenticated, render the tab navigator
  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose an Activity</Text>
            <View style={styles.mainContainer}>
              <Pressable
                style={styles.button}
                onPress={() => {
                  setModalVisible(!modalVisible);
                  console.log("Run selected");
                }}
              >
                <Text style={styles.buttonText}>Run</Text>
              </Pressable>

              <Pressable
                style={styles.button}
                onPress={() => {
                  setModalVisible(!modalVisible);
                  console.log("Lift selected");
                }}
              >
                <Text style={styles.buttonText}>Lift</Text>
              </Pressable>

              <Pressable
                style={styles.button}
                onPress={() => {
                  setModalVisible(!modalVisible);
                  console.log("Weight selected");
                }}
              >
                <Text style={styles.buttonText}>Weight</Text>
              </Pressable>
            </View>

            {/* Close Button */}
            <Pressable
              style={[styles.button, styles.closeButton]}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={[styles.buttonText, styles.closeButtonText]}>
                Close
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            if (route.name === "Runs") {
              return (
                <MaterialCommunityIcons name="run" size={30} color={color} />
              );
            } else if (route.name === "Lifts") {
              return (
                <MaterialCommunityIcons
                  name="weight-lifter"
                  size={30}
                  color={color}
                />
              );
            } else if (route.name === "AddActivity") {
              return <AntDesign name="pluscircle" size={size} color={color} />;
            } else if (route.name === "Weight") {
              return <Ionicons name="scale" size={size} color={color} />;
            } else if (route.name === "Settings") {
              return (
                <FontAwesome6 name="user-gear" size={size} color={color} />
              );
            }
          },
          tabBarActiveTintColor: "#42f44b",
          tabBarInactiveTintColor: "gray",
        })}
      >
        <Tab.Screen name="Runs" component={Runs} />
        <Tab.Screen name="Lifts" component={Lifts} />
        <Tab.Screen
          name="AddActivity"
          component={AddActivity}
          options={{
            tabBarButton: (props) => (
              <Pressable {...props} onPress={() => setModalVisible(true)} />
            ),
          }}
        />
        <Tab.Screen name="Weight" component={Weight} />
        <Tab.Screen name="Settings" component={Settings} />
      </Tab.Navigator>
    </>
  );
};

export default TabNavigator;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    width: "100%",
    height: "40%",
    padding: 20,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20, // Rounded corners at the top
    borderTopRightRadius: 20,
    justifyContent: "space-between", // Space main content and close button
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#42f44b",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
  },
  mainContainer: {
    paddingTop: 15,
    width: "100%",
    alignItems: "center",
  },
  closeButton: {
    backgroundColor: "#ff5c5c",
    width: "100%", // Matches width of other buttons for consistency
    padding: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
  },
});
