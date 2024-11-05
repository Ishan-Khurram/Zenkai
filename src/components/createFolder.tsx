import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { FIREBASE_DB } from "firebaseConfig";

const CreateFolder = ({ userId, onClose, onAddFolder, folderType }) => {
  const [folderName, setFolderName] = useState("");
  const [error, setError] = useState("");

  // .trim to remove extra whitespace
  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      setError("Folder name cannot be empty.");
      return;
    }
    // reference lift folders.
    try {
      const liftFoldersRef = collection(
        FIREBASE_DB,
        "users",
        userId,
        folderType
      );
      const docData = await getDocs(liftFoldersRef);
      if (docData.size >= 10) {
        setError("You can only create up to 10 folders.");
        return;
      }

      // go over all folder names.
      const folderNames = docData.docs.map((doc) => doc.data().folderName);

      // check for dup name in folders.
      if (folderNames.includes(folderName.trim())) {
        setError("Folder name already exists.");
        return;
      }

      // adding a new folder
      const newFolder = {
        folderName: folderName.trim(),
        createdAt: new Date().toISOString(),
        exercies: [],
      };
      await addDoc(liftFoldersRef, newFolder);

      // param add folder is called upon to update UI with new Folder.
      onAddFolder(newFolder);
      alert("Folder Successfully Created!");

      // clear modal and reset input
      setFolderName("");
      setError("");
      onClose();
    } catch (error) {
      console.error("Error Creating Folder", error);
      setError("Failed to create folder, please try again.");
    }
  };

  return (
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
  );
};

export default CreateFolder;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
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
