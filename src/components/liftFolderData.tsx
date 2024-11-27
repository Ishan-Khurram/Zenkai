import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { FIREBASE_DB } from "firebaseConfig";

export default function FolderDetail({ route }) {
  const { folderId } = route.params;
  const [groupedExercises, setGroupedExercises] = useState([]);
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

          // Group exercises by date
          const grouped = fetchedExercises.reduce((acc, exerciseEntry) => {
            const date = exerciseEntry.date;
            if (!acc[date]) {
              acc[date] = [];
            }
            acc[date].push(...exerciseEntry.exercises);
            return acc;
          }, {});

          // Convert grouped object to an array sorted by date
          const groupedArray = Object.keys(grouped)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()) // Newest first
            .map((date) => ({
              date,
              exercises: grouped[date],
            }));

          setGroupedExercises(groupedArray);
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
      <Text style={styles.headerText}>{folderId}</Text>
      <ScrollView>
        {groupedExercises.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.dateSection}>
            {/* Date Header */}
            <Text style={styles.dateText}>Date: {group.date}</Text>

            {/* Exercises */}
            {group.exercises.map((exercise, exerciseIndex) => (
              <View key={exerciseIndex} style={styles.exerciseContainer}>
                {/* Exercise Name */}
                <Text style={styles.exerciseName}>{exercise.name}</Text>

                {/* Sets Information */}
                {exercise.sets?.length ? (
                  <View style={styles.setsContainer}>
                    {exercise.sets.map((set, setIndex) => (
                      <View key={setIndex} style={styles.setDetails}>
                        <View style={styles.setInfoContainer}>
                          <Text style={styles.setInfoTitle}>
                            Set {setIndex + 1}
                          </Text>
                        </View>
                        <View style={styles.setInfoRow}>
                          <Text style={styles.detailLabel}>Weight:</Text>
                          <Text style={styles.detailValue}>{set.weight}</Text>
                        </View>
                        <View style={styles.setInfoRow}>
                          <Text style={styles.detailLabel}>Reps:</Text>
                          <Text style={styles.detailValue}>{set.reps}</Text>
                        </View>
                        {set.notes ? (
                          <View style={styles.notesContainer}>
                            <Text style={styles.notesTitle}>Notes:</Text>
                            <Text style={styles.notesValue}>{set.notes}</Text>
                          </View>
                        ) : null}
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noSetsText}>
                    No sets available for this exercise.
                  </Text>
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
    padding: 15,
    backgroundColor: "#e0f7fa",
    borderRadius: 10,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  exerciseContainer: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  setsContainer: {
    marginTop: 10,
  },
  setDetails: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  setInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  setInfoTitle: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  setInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },
  detailLabel: {
    fontSize: 14,
    color: "#555",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  notesContainer: {
    marginTop: 5,
  },
  notesTitle: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#555",
    marginBottom: 3,
  },
  notesValue: {
    fontSize: 14,
    color: "#333",
    fontStyle: "italic",
  },
  noSetsText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    marginTop: 5,
  },
});
