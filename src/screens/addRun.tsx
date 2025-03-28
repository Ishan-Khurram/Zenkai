import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import { useNavigation } from "@react-navigation/native";

const AddRun = () => {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [name, setName] = useState("");
  const [distance, setDistance] = useState("");
  const [pace, setPace] = useState("");
  const [duration, setDuration] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [notes, setNotes] = useState("");

  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  const navigation = useNavigation();

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

  const handleSelectFolder = (folder) => setSelectedFolder(folder);

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
      distance: parseFloat(distance),
      pace,
      duration,
      heartRate,
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
    <>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => {
            if (selectedFolder) {
              setSelectedFolder(null);
            } else {
              navigation.goBack();
            }
          }}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>
          {!selectedFolder
            ? "Select a Workout Folder"
            : `Add Run to ${selectedFolder.name}`}
        </Text>
      </View>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {!selectedFolder ? (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {folders.length > 0 ? (
              folders.map((folder, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.folderButton}
                  onPress={() => handleSelectFolder(folder)}
                >
                  <Text style={styles.folderButtonText}>{folder.name}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noFoldersText}>No folders available.</Text>
            )}
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <TextInput
              style={styles.input}
              placeholder="Run Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Distance (km)"
              keyboardType="numeric"
              value={distance}
              onChangeText={setDistance}
            />
            <TextInput
              style={styles.input}
              placeholder="Pace (e.g., 5:15 per km)"
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
              placeholder="Heart Rate (optional)"
              keyboardType="numeric"
              value={heartRate}
              onChangeText={setHeartRate}
            />
            <TextInput
              style={styles.input}
              placeholder="Notes (optional)"
              value={notes}
              onChangeText={setNotes}
            />
            <TouchableOpacity style={styles.button} onPress={handleSaveRun}>
              <Text style={styles.buttonText}>Save Run</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    paddingBottom: 10,
    backgroundColor: "#f0f0f0",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    height: "18%",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 15,
    backgroundColor: "#fff",
    borderRadius: 20,
    width: 80,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    flex: 1,
    textAlign: "center",
  },
  scrollContent: {
    padding: 10,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 15,
    color: "#333",
    width: "100%",
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  folderButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: "center",
    width: "90%",
  },
  folderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  noFoldersText: {
    fontSize: 16,
    color: "#aaa",
    textAlign: "center",
    marginTop: 20,
  },
});

export default AddRun;
