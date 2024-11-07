import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
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

const AddLift = () => {
  const [folders, setFolders] = useState<{ name: string; folderID: string }[]>(
    []
  );
  const [selectedFolder, setSelectedFolder] = useState<{
    name: string;
    folderID: string;
  } | null>(null);
  const [exerciseName, setExerciseName] = useState("");
  const [numSets, setNumSets] = useState("");
  const [sets, setSets] = useState<
    { weight: string; reps: string; notes: string }[]
  >([]);
  const [exercises, setExercises] = useState<
    { name: string; sets: { weight: string; reps: string; notes: string }[] }[]
  >([]);

  const auth = getAuth();
  const userId = auth.currentUser?.uid;

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
        const fetchedFolders = querySnapshot.docs.map((doc) => ({
          name: doc.data().folderName,
          folderID: doc.id,
        }));
        setFolders(fetchedFolders);
      } catch (error) {
        console.error("Error fetching folders:", error);
      }
    };

    if (userId) fetchFolders();
  }, [userId]);

  const handleSelectFolder = (folder) => {
    setSelectedFolder(folder);
  };

  const handleNumSetsChange = (value) => {
    setNumSets(value);
    const parsedNumSets = parseInt(value, 10);
    if (!isNaN(parsedNumSets) && parsedNumSets >= 0) {
      const updatedSets = Array.from({ length: parsedNumSets }).map(
        (_, index) => ({
          weight: sets[index]?.weight || "",
          reps: sets[index]?.reps || "",
          notes: sets[index]?.notes || "",
        })
      );
      setSets(updatedSets);
    }
  };

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

  const handleAddExercise = () => {
    if (
      !exerciseName ||
      sets.length === 0 ||
      sets.some((set) => !set.weight || !set.reps)
    ) {
      Alert.alert(
        "Incomplete Data",
        "Please enter an exercise name and complete all set details."
      );
      return;
    }

    const newExercise = { name: exerciseName, sets };
    setExercises((prev) => [...prev, newExercise]);
    setExerciseName("");
    setNumSets("");
    setSets([]);
  };

  const handleSaveWorkout = async () => {
    if (!userId || !selectedFolder) {
      Alert.alert(
        "Save Error",
        "User not authenticated or no folder selected."
      );
      return;
    }

    if (
      exerciseName &&
      sets.length > 0 &&
      !sets.some((set) => !set.weight || !set.reps)
    ) {
      handleAddExercise();
    }

    const today = format(new Date(), "yyyy-MM-dd");
    const folderRef = doc(
      FIREBASE_DB,
      "users",
      userId,
      "liftFolders",
      selectedFolder.folderID
    );

    const newExerciseData = {
      date: today,
      exercises,
    };

    try {
      await updateDoc(folderRef, {
        exercises: arrayUnion(newExerciseData),
      });
      Alert.alert("Workout Saved", "Your workout has been saved!");
      setExercises([]);
      setExerciseName("");
      setNumSets("");
      setSets([]);
      setSelectedFolder(null);
    } catch (error) {
      console.error("Error saving workout:", error);
      Alert.alert("Save Error", "Failed to save workout. Please try again.");
    }
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
            value={numSets}
            onChangeText={handleNumSetsChange}
          />

          {renderSetInputs()}

          <Button title="Add Exercise" onPress={handleAddExercise} />
          <Button title="Save Workout" onPress={handleSaveWorkout} />
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
