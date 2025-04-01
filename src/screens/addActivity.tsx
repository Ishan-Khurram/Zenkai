import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

export default function AddActivity() {
  return (
    <View style={styles.container}>
      <Text>middle plus button here</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1F22",
    alignItems: "center",
    justifyContent: "center",
  },
});
