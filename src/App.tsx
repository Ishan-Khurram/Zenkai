import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import TabNavigator from "@/navigation/tabNavigator";
import LoginScreen from "@/screens/login";
import Runs from "@/screens/runs";
import { FIREBASE_AUTH } from "firebaseConfig";

// define types for nav
type RootStackParamList = {
  Login: undefined;
  Home: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  // auth listeners
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const auth = FIREBASE_AUTH;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return unsubscribe;
  }, []);

  // TODO: future loading screen to be added here.
  // if (isAuthenticated === null) {
  //   return <LoadingScreen />
  // }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isAuthenticated ? (
          <Stack.Screen
            name="Home"
            component={Runs}
            options={{ headerShown: false }}
          />
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
