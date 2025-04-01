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
    <View style={{ flex: 1, backgroundColor: "#1E1F22" }}>
      <>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => {
              if (selectedFolder) {
                setSelectedFolder(null); // Reset folder selection
              } else {
                navigation.goBack(); // Navigate back if no folder is selected
              }
            }}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>
            {!selectedFolder
              ? "Select a Workout Folder"
              : `Add Workout to ${selectedFolder.name}`}
          </Text>
        </View>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {!selectedFolder ? (
            <>
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
                  <Text style={styles.noFoldersText}>
                    No folders available.
                  </Text>
                )}
              </ScrollView>
            </>
          ) : (
            <>
              <ScrollView contentContainerStyle={styles.scrollContent}>
                <TextInput
                  style={styles.input}
                  placeholder="Exercise Name"
                  placeholderTextColor="#ffffff"
                  value={exerciseName}
                  onChangeText={setExerciseName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Number of Sets"
                  placeholderTextColor="#ffffff"
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
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSaveWorkout}
                >
                  <Text style={styles.buttonText}>Save Workout</Text>
                </TouchableOpacity>
              </ScrollView>
            </>
          )}
        </KeyboardAvoidingView>
      </>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1F22", // Dark base
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    paddingBottom: 10,
    backgroundColor: "#2B2D31", // Dark header
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    height: "18%",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 15,
    backgroundColor: "#3A3B3C",
    borderRadius: 20,
    width: 80,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
  },
  header: {
    backgroundColor: "#5865F2", // Discord blue for visual pop
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  scrollContent: {
    padding: 10,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#FFFFFF",
  },
  input: {
    backgroundColor: "#2B2D31",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#3A3B3C",
    marginBottom: 15,
    color: "#FFFFFF",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  setContainer: {
    backgroundColor: "#2B2D31",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  setTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#FFFFFF",
  },
  button: {
    backgroundColor: "#43B581", // Soft green for main CTA
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  saveButton: {
    backgroundColor: "#5865F2", // Match with rest of the UI
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  folderButton: {
    backgroundColor: "#5865F2",
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
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  noFoldersText: {
    fontSize: 16,
    color: "#B0B3B8",
    textAlign: "center",
    marginTop: 20,
  },
});

export default AddLift;
