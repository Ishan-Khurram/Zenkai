import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import TabNavigator from "@/navigation/tabNavigator";

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
};

export default App;
