import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { FIREBASE_DB } from "firebaseConfig";

export default function FolderDetail({ route }) {
  const { folderId } = route.params; // Access folderId directly from params
  const [exercises, setExercises] = useState([]);
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        if (!userId || !folderId) return;

        const folderRef = doc(
          FIREBASE_DB,
          "users",
          userId,
          "liftFolders",
          folderId
        );
        const folderSnap = await getDoc(folderRef);

        if (folderSnap.exists()) {
          // Access the exercises array directly from the document's data
          const folderData = folderSnap.data();
          setExercises(folderData.exercises || []);
          console.log("Fetched exercises:", folderData.exercises);
        } else {
          console.error("No such folder document found.");
        }
      } catch (error) {
        console.error("Error fetching exercises:", error);
      }
    };

    fetchExercises();
  }, [folderId, userId]);

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Folder Details</Text>
      <ScrollView>
        {exercises.map((exerciseEntry, index) => (
          <View key={index} style={styles.exerciseItem}>
            <Text>Date: {exerciseEntry.date}</Text>
            {exerciseEntry.exercises.map((exercise, exIndex) => (
              <Text key={exIndex}>
                {exercise.name} - weight: {exercise.weight}, reps:{" "}
                {exercise.reps}, notes: {exercise.notes}
              </Text>
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
  exerciseItem: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});
