import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import React from "react";
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
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            // Use specific icons from each library based on the route name
            if (route.name === "Runs") {
              return (
                <MaterialCommunityIcons name="run" size={size} color={color} />
              );
            } else if (route.name === "Lifts") {
              return (
                <MaterialCommunityIcons
                  name="weight-lifter"
                  size={size}
                  color={color}
                />
              );
            } else if (route.name === "addActivity") {
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
          name="addActivity"
          component={AddActivity}
          options={{ title: " " }}
        />
        <Tab.Screen name="Weight" component={Weight} />
        <Tab.Screen name="Settings" component={Settings} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default TabNavigator;
