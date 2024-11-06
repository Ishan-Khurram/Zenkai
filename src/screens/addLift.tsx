import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { FIREBASE_DB } from "firebaseConfig"; // Import your Firebase Firestore config
import { getAuth } from "firebase/auth";

const AddLift = () => {
  // State to track folders and selected folder
  const [folders, setFolders] = useState<{ name: string }[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<{ name: string } | null>(
    null
  );
  const [exerciseName, setExerciseName] = useState("");
  const [numSets, setNumSets] = useState(0);
  const [sets, setSets] = useState([]);
  const [exercises, setExercises] = useState([]);

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
          "liftFolders"
        );
        const querySnapshot = await getDocs(foldersRef);

        // Map through each folder document and use folderName
        const fetchedFolders = querySnapshot.docs.map((doc) => ({
          name: doc.data().folderName, // Use folderName from Firebase document
        }));

        setFolders(fetchedFolders); // Update state with the correct folder names
      } catch (error) {
        console.error("Error fetching folders:", error);
      }
    };

    fetchFolders();
  }, []);

  // Handle folder selection
  const handleSelectFolder = (folder) => {
    setSelectedFolder(folder);
  };

  // Update the number of sets and initialize sets data
  const handleNumSetsChange = (value) => {
    const newNumSets = parseInt(value) || 1;
    setNumSets(newNumSets);

    // Initialize sets array based on number of sets
    const updatedSets = Array.from({ length: newNumSets }).map((_, index) => ({
      weight: sets[index]?.weight || "",
      reps: sets[index]?.reps || "",
      notes: sets[index]?.notes || "",
    }));
    setSets(updatedSets);
  };

  // Render dynamic inputs for each set
  const renderSetInputs = () => {
    return sets.map((set, index) => (
      <View key={index} style={styles.setContainer}>
        <Text style={styles.setTitle}>Set {index + 1}</Text>
        <TextInput
          style={styles.input}
          placeholder="Weight"
          value={set.weight}
          onChangeText={(text) =>
            setSets((prev) =>
              prev.map((item, i) =>
                i === index ? { ...item, weight: text } : item
              )
            )
          }
        />
        <TextInput
          style={styles.input}
          placeholder="Reps"
          value={set.reps}
          onChangeText={(text) =>
            setSets((prev) =>
              prev.map((item, i) =>
                i === index ? { ...item, reps: text } : item
              )
            )
          }
        />
        <TextInput
          style={styles.input}
          placeholder="Notes"
          value={set.notes}
          onChangeText={(text) =>
            setSets((prev) =>
              prev.map((item, i) =>
                i === index ? { ...item, notes: text } : item
              )
            )
          }
        />
      </View>
    ));
  };

  // Handle adding an exercise to the list
  const handleAddExercise = () => {
    const newExercise = { name: exerciseName, sets };
    setExercises((prev) => [...prev, newExercise]);
    setExerciseName("");
    setNumSets(1);
    setSets([]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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

          <TextInput
            style={styles.input}
            placeholder="Exercise Name"
            value={exerciseName}
            onChangeText={setExerciseName}
          />
          <TextInput
            style={styles.input}
            placeholder="Number of Sets"
            keyboardType="numeric"
            value={numSets.toString()}
            onChangeText={handleNumSetsChange}
          />

          {renderSetInputs()}

          <Button title="Add Exercise" onPress={handleAddExercise} />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
  },
  setContainer: {
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  setTitle: {
    fontWeight: "bold",
  },
});

export default AddLift;
