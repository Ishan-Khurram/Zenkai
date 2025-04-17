import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Alert } from "react-native";
import { getAuth } from "firebase/auth";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { FIREBASE_DB } from "firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { updateLiftEntry } from "@/components/editLiftFile";

export default function FolderDetail({ route }) {
  const { folderId, folderName } = route.params;
  const [groupedExercises, setGroupedExercises] = useState([]);
  const [currentlyEditing, setCurrentlyEditing] = useState({
    date: null,
    exerciseIndex: null,
    setIndex: null,
  });
  const [editedWeight, setEditedWeight] = useState("");
  const [editedReps, setEditedReps] = useState("");
  const [editedNotes, setEditedNotes] = useState("");
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  const navigation = useNavigation();

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
          if (!acc[date]) acc[date] = [];
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

  useEffect(() => {
    if (userId && folderId) fetchExercises();
  }, [userId, folderId]);

  const deleteCurrentFolder = async () => {
    try {
      if (!folderId || !userId)
        throw new Error("Folder ID or User ID is not available.");
      const folderRef = doc(
        FIREBASE_DB,
        "users",
        userId,
        "liftFolders",
        folderId
      );

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

  const onSaveEdit = async () => {
    if (
      !userId ||
      !folderId ||
      currentlyEditing.date === null ||
      currentlyEditing.exerciseIndex === null ||
      currentlyEditing.setIndex === null
    )
      return;

    const group = groupedExercises.find(
      (g) => g.date === currentlyEditing.date
    );
    if (!group || !group.exercises[currentlyEditing.exerciseIndex]) {
      console.error("Could not find matching exercise for editing.");
      return;
    }

    const originalExercise = group.exercises[currentlyEditing.exerciseIndex];
    const updatedSets = [...originalExercise.sets];
    updatedSets[currentlyEditing.setIndex] = {
      weight: editedWeight,
      reps: editedReps,
      notes: editedNotes,
    };

    const updatedLiftData = {
      name: originalExercise.name,
      sets: updatedSets,
    };

    const res = await updateLiftEntry({
      userId,
      folderId,
      liftDate: currentlyEditing.date,
      liftIndex: currentlyEditing.exerciseIndex,
      updatedLiftData,
    });

    if (res.success) {
      setCurrentlyEditing({ date: null, exerciseIndex: null, setIndex: null });
      fetchExercises();
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
          onPress={deleteCurrentFolder}
          style={styles.deleteButton}
        >
          <Text>🗑</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>{folderName}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {groupedExercises.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.dateSection}>
            {group.exercises.map((exercise, exerciseIndex) => (
              <View key={exerciseIndex} style={styles.exerciseContainer}>
                <View style={styles.exerciseHeader}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseDateInline}>{group.date}</Text>
                </View>

                {exercise.sets?.length ? (
                  <View style={styles.setsGrid}>
                    {exercise.sets.map((set, setIndex) => (
                      <View key={setIndex} style={styles.setCard}>
                        <Text style={styles.setTitle}>Set {setIndex + 1}</Text>

                        {currentlyEditing.date === group.date &&
                        currentlyEditing.exerciseIndex === exerciseIndex &&
                        currentlyEditing.setIndex === setIndex ? (
                          <>
                            <View style={styles.row}>
                              <View style={styles.statBlock}>
                                <Text style={styles.statLabel}>Weight</Text>
                                <TextInput
                                  value={editedWeight}
                                  onChangeText={setEditedWeight}
                                  placeholder="Weight"
                                  placeholderTextColor="#888"
                                  style={[styles.statValue, { padding: 0 }]}
                                />
                              </View>
                              <View style={styles.statBlock}>
                                <Text style={styles.statLabel}>Reps</Text>
                                <TextInput
                                  value={editedReps}
                                  onChangeText={setEditedReps}
                                  placeholder="Reps"
                                  placeholderTextColor="#888"
                                  style={[styles.statValue, { padding: 0 }]}
                                />
                              </View>
                            </View>

                            <TextInput
                              value={editedNotes}
                              onChangeText={setEditedNotes}
                              placeholder="Notes"
                              placeholderTextColor="#888"
                              multiline
                              style={[styles.notesText, { padding: 0 }]}
                            />

                            <View style={styles.inlineEditButtons}>
                              <TouchableOpacity onPress={onSaveEdit}>
                                <Text style={styles.saveIcon}>✅</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() =>
                                  setCurrentlyEditing({
                                    date: null,
                                    exerciseIndex: null,
                                    setIndex: null,
                                  })
                                }
                              >
                                <Text style={styles.cancelIcon}>❌</Text>
                              </TouchableOpacity>
                            </View>
                          </>
                        ) : (
                          <>
                            <View style={styles.row}>
                              <View style={styles.statBlock}>
                                <Text style={styles.statLabel}>Weight</Text>
                                <Text style={styles.statValue}>
                                  {set.weight}
                                </Text>
                              </View>
                              <View style={styles.statBlock}>
                                <Text style={styles.statLabel}>Reps</Text>
                                <Text style={styles.statValue}>{set.reps}</Text>
                              </View>
                            </View>

                            {set.notes ? (
                              <View style={styles.notesRow}>
                                <Text style={[styles.notesText, { flex: 1 }]}>
                                  📝 {set.notes}
                                </Text>
                                <TouchableOpacity
                                  onPress={() => {
                                    setCurrentlyEditing({
                                      date: group.date,
                                      exerciseIndex,
                                      setIndex,
                                    });
                                    setEditedWeight(set.weight.toString());
                                    setEditedReps(set.reps.toString());
                                    setEditedNotes(set.notes || "");
                                  }}
                                  style={styles.editIcon}
                                >
                                  <Text>✏️</Text>
                                </TouchableOpacity>
                              </View>
                            ) : (
                              <TouchableOpacity
                                onPress={() => {
                                  setCurrentlyEditing({
                                    date: group.date,
                                    exerciseIndex,
                                    setIndex,
                                  });
                                  setEditedWeight(set.weight.toString());
                                  setEditedReps(set.reps.toString());
                                  setEditedNotes(set.notes || "");
                                }}
                                style={styles.editAlone}
                              >
                                <Text>✏️</Text>
                              </TouchableOpacity>
                            )}
                          </>
                        )}
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
    backgroundColor: "#1E1F22",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    paddingBottom: 10,
    backgroundColor: "#2B2D31",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    height: "18%",
    position: "relative",
  },
  scrollContainer: {
    paddingVertical: 20,
    paddingHorizontal: 17,
    backgroundColor: "#1E1F22",
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
  deleteButton: {
    position: "absolute",
    top: 60,
    right: 15,
    backgroundColor: "#D93025",
    borderRadius: 20,
    width: 80,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
  },
  dateSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#2B2D31",
    borderRadius: 10,
  },
  exerciseContainer: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: "#1E1F22",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3A3B3C",
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  exerciseDateInline: {
    fontSize: 14,
    color: "#B0B3B8",
    fontStyle: "italic",
  },
  setsGrid: {
    flexDirection: "column",
    gap: 10,
  },
  setCard: {
    backgroundColor: "#2B2D31",
    borderRadius: 10,
    padding: 12,
    borderColor: "#3A3B3C",
    borderWidth: 1,
  },
  setTitle: {
    color: "#B0B3B8",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  statBlock: {
    width: "48%",
    alignItems: "center",
    backgroundColor: "#1E1F22",
    padding: 10,
    borderRadius: 6,
    borderColor: "#3A3B3C",
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 12,
    color: "#B0B3B8",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  notesText: {
    marginTop: 8,
    fontSize: 13,
    fontStyle: "italic",
    color: "#B0B3B8",
  },
  noSetsText: {
    fontSize: 14,
    color: "#999999",
    fontStyle: "italic",
  },
  notesRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    justifyContent: "space-between", // pushes ✏️ to the right
  },

  inlineEditButtons: {
    flexDirection: "row",
    alignSelf: "flex-end", // aligns ✅ ❌ to the right side of card
    marginTop: 8,
    gap: 15, // adds spacing between save and cancel
  },

  saveIcon: {
    color: "#4CAF50", // green
    fontWeight: "bold",
  },

  cancelIcon: {
    color: "#F44336", // red
    fontWeight: "bold",
  },

  editIcon: {
    marginLeft: 10, // spacing from notes
  },

  editAlone: {
    alignSelf: "flex-end", // right-align for notes-less cards
    marginTop: 8,
  },
});
