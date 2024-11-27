import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
} from "react-native";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { FIREBASE_DB } from "firebaseConfig";
import { getAuth } from "firebase/auth";
import { format } from "date-fns";

const AddRun = () => {
  const [folders, setFolders] = useState<{ name: string; folderID: string }[]>(
    []
  );
  const [selectedFolder, setSelectedFolder] = useState<{
    name: string;
    folderID: string;
  } | null>(null);
  const [name, setName] = useState("");
  const [distance, setDistance] = useState("");
  const [pace, setPace] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");

  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  // Fetch folders from Firestore on component mount
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const foldersRef = collection(
          FIREBASE_DB,
          "users",
          userId,
          "runFolders"
        );
        const querySnapshot = await getDocs(foldersRef);

        const fetchedFolders = querySnapshot.docs.map((doc) => ({
          name: doc.data().folderName,
          folderID: doc.id,
        }));
        setFolders(fetchedFolders);
      } catch (error) {
        console.error("Error fetching folders:", error);
      }
    };

    fetchFolders();
  }, [userId]);

  const handleSelectFolder = (folder) => {
    setSelectedFolder(folder);
  };

  // Save run data to Firestore
  const handleSaveRun = async () => {
    if (!selectedFolder) {
      Alert.alert(
        "No Folder Selected",
        "Please select a folder to save your run."
      );
      return;
    }

    if (!name || !distance || !pace || !duration) {
      Alert.alert(
        "Missing Information",
        "Please fill out all required fields."
      );
      return;
    }

    const today = format(new Date(), "yyyy-MM-dd");
    const runData = {
      date: today,
      name,
      distance: parseFloat(distance), // Save distance as a number
      pace,
      duration,
      notes,
    };

    try {
      const folderRef = doc(
        FIREBASE_DB,
        "users",
        userId,
        "runFolders",
        selectedFolder.folderID
      );
      await updateDoc(folderRef, {
        runs: arrayUnion(runData),
      });
      Alert.alert("Success", `Run saved to folder: ${selectedFolder.name}!`);

      // Reset inputs and folder selection after saving
      setName("");
      setDistance("");
      setPace("");
      setDuration("");
      setNotes("");
      setSelectedFolder(null);
    } catch (error) {
      console.error("Error saving run:", error);
      Alert.alert("Error", "Failed to save run. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {!selectedFolder ? (
          <View>
            <Text>Select a Folder:</Text>
            {folders.length > 0 ? (
              folders.map((folder, index) => (
                <Button
                  key={index}
                  title={folder.name}
                  onPress={() => handleSelectFolder(folder)}
                />
              ))
            ) : (
              <Text>No folders available.</Text>
            )}
          </View>
        ) : (
          <View>
            <Text style={styles.header}>
              Add Exercise to {selectedFolder.name}
            </Text>

            <Text style={styles.header}>Add Run</Text>

            <TextInput
              style={styles.input}
              placeholder="Run Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Distance (km or miles)"
              keyboardType="numeric"
              value={distance}
              onChangeText={setDistance}
            />
            <TextInput
              style={styles.input}
              placeholder="Pace (e.g., 5:15 per km)"
              keyboardType="numeric"
              value={pace}
              onChangeText={setPace}
            />
            <TextInput
              style={styles.input}
              placeholder="Duration (e.g., 1:00:00)"
              value={duration}
              onChangeText={setDuration}
            />
            <TextInput
              style={styles.input}
              placeholder="Notes (optional)"
              value={notes}
              onChangeText={setNotes}
            />

            <Button title="Save Run" onPress={handleSaveRun} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
});

export default AddRun;
