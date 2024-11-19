import React, { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { onAuthStateChanged } from "firebase/auth";
import {
  useNavigation,
  NavigationProp,
  NavigationContainer,
} from "@react-navigation/native";
import Runs from "@/screens/runs";
import Lifts from "@/screens/lifts";
import AddActivity from "@/screens/addActivity";
import Weight from "@/screens/weight";
import Settings from "@/screens/settings";
import SignInScreen from "@/screens/login";
import { FIREBASE_AUTH } from "firebaseConfig";
import {
  MaterialCommunityIcons,
  Ionicons,
  AntDesign,
  FontAwesome6,
} from "@expo/vector-icons";
import { Pressable, View, Text, Modal, StyleSheet } from "react-native";
import AddLift from "@/screens/addLift";
import FolderDetail from "@/components/liftFolderData";
import AddWeight from "@/components/addWeight";
import AddRun from "@/screens/addRun";

type RootStackParamList = {
  MainTabs: undefined;
  AddLift: { folders: { name: string }[] };
  AddWeightTest: undefined; // Adding Test Route
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

const MainTabs = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <>
      {/* Main Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose an Activity</Text>
            <View style={styles.mainContainer}>
              <Pressable
                style={styles.button}
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate("AddRun");
                }}
              >
                <Text style={styles.buttonText}>Run</Text>
              </Pressable>

              <Pressable
                style={styles.button}
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate("AddLift");
                  console.log("Lift selected");
                }}
              >
                <Text style={styles.buttonText}>Lift</Text>
              </Pressable>

              <Pressable
                style={styles.button}
                onPress={() => {
                  setModalVisible(false); // Close main modal
                  console.log("weight modal state: ", weightModalVisible);
                  setTimeout(() => setWeightModalVisible(true), 200); // Open AddWeight modal
                  console.log(
                    "Weight button pressed, AddWeight modal opening..."
                  );
                  console.log("weight modal state: ", weightModalVisible);
                }}
              >
                <Text style={styles.buttonText}>Weight</Text>
              </Pressable>
            </View>

            <Pressable
              style={[styles.button, styles.closeButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.buttonText, styles.closeButtonText]}>
                Close
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* AddWeight Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={weightModalVisible}
        onRequestClose={() => setWeightModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AddWeight onClose={() => setWeightModalVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* Bottom Tab Navigator */}
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

const TabNavigator: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setIsAuthenticated(!!user);
    });
    return unsubscribe;
  }, []);

  if (!isAuthenticated) {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={SignInScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="AddLift" component={AddLift} />
      <Stack.Screen
        name="FolderDetail"
        component={FolderDetail}
        options={{ title: "Folder Details" }}
      />
      <Stack.Screen
        name="AddRun"
        component={AddRun} // Register AddRun here
        options={{ title: "Add Run" }} // Optional: Customize screen title
      />
    </Stack.Navigator>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    justifyContent: "space-between",
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
    width: "100%",
    padding: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
  },
});
