import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { FIREBASE_DB } from "firebaseConfig";

export default function FolderDetail({ route }) {
  const { folderId } = route.params;
  const [exercisesByDate, setExercisesByDate] = useState([]);
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const folderDocRef = doc(
          FIREBASE_DB,
          "users",
          userId,
          "liftFolders",
          folderId
        );
        const folderDoc = await getDoc(folderDocRef);

        if (folderDoc.exists()) {
          const folderData = folderDoc.data();
          const fetchedExercises = folderData.exercises || [];
          setExercisesByDate(fetchedExercises);
        } else {
          console.log("No such folder document found!");
        }
      } catch (error) {
        console.error("Error fetching exercises:", error);
      }
    };

    if (userId && folderId) fetchExercises();
  }, [userId, folderId]);

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Folder Details</Text>
      <ScrollView>
        {exercisesByDate
          .slice()
          .reverse()
          .map((entry, entryIndex) => (
            <View key={entryIndex} style={styles.dateSection}>
              <Text style={styles.dateText}>Date: {entry.date}</Text>

              {entry.exercises.map((exercise, exerciseIndex) => (
                <View key={exerciseIndex} style={styles.exerciseItem}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>

                  {exercise.sets?.length ? (
                    exercise.sets.map((set, setIndex) => (
                      <View key={setIndex} style={styles.setDetails}>
                        <Text>Set {setIndex + 1}</Text>
                        <Text>Weight: {set.weight}</Text>
                        <Text>Reps: {set.reps}</Text>
                        <Text>Notes: {set.notes}</Text>
                      </View>
                    ))
                  ) : (
                    <Text>No sets available for this exercise.</Text>
                  )}
                </View>
              ))}
            </View>
          ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  dateSection: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#e0f7fa",
    borderRadius: 5,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  exerciseItem: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  setDetails: {
    paddingLeft: 10,
    paddingVertical: 5,
  },
});
