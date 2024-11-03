import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { Modal, StyleSheet, Text, Pressable, View } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import React from "react";
import { useState } from "react";
import LoginScreen from "@/screens/login";
import Runs from "@/screens/runs";
import Lifts from "@/screens/lifts";
import AddActivity from "@/screens/addActivity";
import Weight from "@/screens/weight";
import Settings from "@/screens/settings";
// run icons
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
// scale icon
import Ionicons from "@expo/vector-icons/Ionicons";
// activity circle
import AntDesign from "@expo/vector-icons/AntDesign";
// settings
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const Tab = createBottomTabNavigator();

const TabNavigator: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <NavigationContainer>
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
            // Use specific icons from each library based on the route name
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
            } else if (route.name === " ") {
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
          name=" "
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
    </NavigationContainer>
  );
};

// Styles for modal and buttons
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end", // Aligns modal to slide up from bottom
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
  mainContainer: {
    paddingTop: 15,
    width: "100%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10, // Reduced margin for tighter layout
  },
  button: {
    width: "100%",
    padding: 10,
    marginTop: 5,
    marginBottom: 12, // Adds custom spacing between each button
    borderRadius: 5,
    backgroundColor: "#42f44b",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
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

export default TabNavigator;
