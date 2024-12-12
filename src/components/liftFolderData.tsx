import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Alert } from "react-native";
import { getAuth } from "firebase/auth";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { FIREBASE_DB } from "firebaseConfig";
import { useNavigation } from "@react-navigation/native";

export default function FolderDetail({ route }) {
  const { folderId, folderName } = route.params;
  const [groupedExercises, setGroupedExercises] = useState([]);
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  const navigation = useNavigation();

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

          const grouped = fetchedExercises.reduce((acc, exerciseEntry) => {
            const date = exerciseEntry.date;
            if (!acc[date]) {
              acc[date] = [];
            }
            acc[date].push(...exerciseEntry.exercises);
            return acc;
          }, {});

          const groupedArray = Object.keys(grouped)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
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

  // function to delete folder.
  const deleteCurrentFolder = async () => {
    try {
      // Ensure folderId and userId are defined
      if (!folderId || !userId) {
        throw new Error("Folder ID or User ID is not available.");
      }

      // Create a reference to the document
      const folderRef = doc(
        FIREBASE_DB,
        "users",
        userId,
        "liftFolders",
        folderId
      );

      // Show a confirmation alert
      Alert.alert(
        "Confirm Deletion",
        "This action cannot be undone. Are you sure you want to delete this folder?",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Deletion canceled"),
            style: "cancel",
          },
          {
            text: "Delete",
            onPress: async () => {
              try {
                // Delete the document
                await deleteDoc(folderRef);
                console.log("Folder deleted successfully.");
              } catch (error) {
                console.error("Error deleting folder: ", error);
              }
            },
            style: "destructive",
          },
        ]
      );
    } catch (error) {
      console.error("Error in deleteCurrentFolder: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => deleteCurrentFolder()}
          style={styles.deleteButton}
        >
          <Text>🗑</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>{folderName}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {groupedExercises.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.dateSection}>
            <Text style={styles.dateText}>Date: {group.date}</Text>
            {group.exercises.map((exercise, exerciseIndex) => (
              <View key={exerciseIndex} style={styles.exerciseContainer}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                {exercise.sets?.length ? (
                  <View style={styles.setsContainer}>
                    {exercise.sets.map((set, setIndex) => (
                      <View key={setIndex} style={styles.setDetails}>
                        <Text style={styles.setInfoTitle}>
                          Set {setIndex + 1}
                        </Text>
                        <Text style={styles.detailValue}>
                          Weight: {set.weight}
                        </Text>
                        <Text style={styles.detailValue}>Reps: {set.reps}</Text>
                        {set.notes ? (
                          <Text style={styles.notesValue}>
                            Notes: {set.notes}
                          </Text>
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
    backgroundColor: "white",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    paddingBottom: 10,
    backgroundColor: "#f0f0f0",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    height: "18%",
    position: "relative",
  },
  scrollContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: "white",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 15,
    backgroundColor: "#fff",
    borderRadius: 20,
    width: 80,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  deleteButton: {
    position: "absolute",
    top: 60,
    right: 15,
    backgroundColor: "red",
    borderRadius: 20,
    width: 80,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    flex: 1,
    textAlign: "center",
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
  setInfoTitle: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
  },
  notesValue: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#555",
  },
  noSetsText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
});
