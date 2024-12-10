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
import { useNavigation } from "@react-navigation/native";

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
  const navigation = useNavigation();

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Select a Workout Folder</Text>
      </View>
      {!selectedFolder ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Available Folders:</Text>
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
        <View style={styles.selectedFolderContainer}>
          <Text style={styles.selectedFolderText}>
            Selected Folder: {selectedFolder.name}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  scrollContent: {
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  folderButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: "center",
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
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
  selectedFolderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedFolderText: {
    fontSize: 18,
    color: "#4CAF50",
    fontWeight: "bold",
  },
});

export default AddLift;
