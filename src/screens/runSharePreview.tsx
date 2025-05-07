import React, { useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import ViewShot from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import RunShareCard from "@/components/runShareCard";
import { useNavigation } from "@react-navigation/native";

export default function RunSharePreview({ route }) {
  const { distance, pace, time } = route.params;
  const viewShotRef = useRef(null);
  const navigation = useNavigation();

  const handleSave = async () => {
    try {
      // 1. Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Allow storage access to save image."
        );
        return;
      }

      // 2. Capture PNG
      const uri = await viewShotRef.current.capture();

      // 3. Save to media library
      await MediaLibrary.saveToLibraryAsync(uri);

      Alert.alert("Success", "Image saved to your device!");
      navigation.goBack(); // Optional: go back after saving
    } catch (error) {
      console.error("Error saving image:", error);
      Alert.alert("Error", "Something went wrong while saving the image.");
    }
  };

  return (
    <View style={styles.container}>
      <ViewShot
        ref={viewShotRef}
        options={{ format: "png", result: "tmpfile", quality: 1 }}
        style={styles.captureArea}
      >
        <RunShareCard distance={distance} pace={pace} time={time} />
      </ViewShot>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.discardButton}
        >
          <Text style={styles.buttonText}>Discard</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40,
  },
  captureArea: {
    backgroundColor: "transparent",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 20,
    marginTop: 30,
  },
  discardButton: {
    backgroundColor: "#444",
    padding: 14,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: "#2196F3",
    padding: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
