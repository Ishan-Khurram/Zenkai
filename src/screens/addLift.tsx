import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
} from "react-native";

const AddLift = ({ folders, onSaveWorkout }) => {
  // State to track which folder is selected
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [exerciseName, setExerciseName] = useState("");
  const [numSets, setNumSets] = useState(1);
  const [sets, setSets] = useState([]);
  const [exercises, setExercises] = useState([]);

  // Handle folder selection
  const handleSelectFolder = (folder) => {
    setSelectedFolder(folder);
  };

  // Function to render dynamic inputs based on number of sets
  const handleNumSetsChange = (value) => {
    const newNumSets = parseInt(value) || 1;
    setNumSets(newNumSets);

    // Adjust sets array based on number of sets
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

  // Render the component UI
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!selectedFolder ? (
        // Folder selection view
        <View>
          <Text>Select a Folder:</Text>
          {folders.map((folder, index) => (
            <Button
              key={index}
              title={folder.name}
              onPress={() => handleSelectFolder(folder)}
            />
          ))}
        </View>
      ) : (
        // Exercise input form
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
