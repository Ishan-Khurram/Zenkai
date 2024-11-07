import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { getAuth } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { FIREBASE_DB } from "firebaseConfig";

export default function FolderDetail({ route }) {
  const { folderId, folderName } = route.params;
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    const fetchExercises = async () => {
      if (!userId || !folderId) return; // Ensure userId and folderId are set
      try {
        const exercisesRef = collection(
          FIREBASE_DB,
          "users",
          userId,
          "liftFolders",
          folderId,
          "exercises"
        );
        const querySnapshot = await getDocs(exercisesRef);
        const fetchedExercises = querySnapshot.docs.map((doc) => doc.data());
        setExercises(fetchedExercises);
      } catch (error) {
        console.error("Error fetching exercises:", error);
      }
    };

    fetchExercises();
  }, [userId, folderId]);

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>{folderName}</Text>
      <ScrollView>
        {exercises.length > 0 ? (
          exercises.map((exercise, index) => (
            <View key={index} style={styles.exerciseItem}>
              <Text>
                {exercise.name} - Weight: {exercise.weight} lbs, Sets:{" "}
                {exercise.sets}, Reps: {exercise.reps}, Notes: {exercise.notes}
              </Text>
            </View>
          ))
        ) : (
          <Text>No exercises found.</Text>
        )}
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
  exerciseItem: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});
