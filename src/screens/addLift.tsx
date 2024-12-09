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
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  TouchableOpacity,
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
  const [sets, setSets] = useState([]);
  const [exercises, setExercises] = useState([]);

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

    fetchFolders();
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
          keyboardType="numeric"
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
          keyboardType="numeric"
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
      exercises: [...exercises, { name: exerciseName, sets }],
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <SafeAreaView>
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
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleAddExercise}
                >
                  <Text style={styles.buttonText}>Add Exercise</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleSaveWorkout}
                >
                  <Text style={styles.buttonText}>Save Workout</Text>
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f8f9fa", // Light background for a clean look
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333", // Darker text for contrast
  },
  input: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  setContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  setTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4CAF50", // Accent color for titles
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  folderButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  folderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  noFoldersText: {
    textAlign: "center",
    fontSize: 16,
    color: "#999",
    marginTop: 20,
  },
});

export default AddLift;
