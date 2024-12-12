import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { FIREBASE_DB } from "firebaseConfig";

const CreateFolder = ({ userId, onClose, folderType }) => {
  const [folderName, setFolderName] = useState("");
  const [error, setError] = useState("");

  // Handle creating a folder
  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      setError("Folder name cannot be empty.");
      return;
    }

    try {
      const liftFoldersRef = collection(
        FIREBASE_DB,
        "users",
        userId,
        folderType
      );
      const docData = await getDocs(liftFoldersRef);

      // Check maximum folder limit
      if (docData.size >= 10) {
        setError("You can only create up to 10 folders.");
        return;
      }

      // Check for duplicate folder names
      const folderNames = docData.docs.map((doc) => doc.data().folderName);
      if (folderNames.includes(folderName.trim())) {
        setError("Folder name already exists.");
        return;
      }

      // Add a new folder
      const newFolder = {
        folderName: folderName.trim(),
        createdAt: new Date().toISOString(),
        exercises: [],
      };
      await addDoc(liftFoldersRef, newFolder);

      alert("Folder Successfully Created!");

      // Clear modal and reset input
      setFolderName("");
      setError("");
      onClose();
    } catch (error) {
      console.error("Error Creating Folder", error);
      setError("Failed to create folder, please try again.");
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Text style={styles.label}>Folder Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter folder name"
          value={folderName}
          onChangeText={(text) => setFolderName(text)}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Button title="Create Folder" onPress={handleCreateFolder} />
        <Button title="Close" onPress={onClose} />
      </View>
    </View>
  );
};

export default CreateFolder;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "80%",
    maxWidth: 400,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  errorText: {
    color: "red",
    marginBottom: 20,
  },
});
