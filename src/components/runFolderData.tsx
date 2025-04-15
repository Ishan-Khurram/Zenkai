import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { getAuth } from "firebase/auth";
import { doc, getDoc, onSnapshot, deleteDoc } from "firebase/firestore";
import { FIREBASE_DB } from "firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { updateRunEntry } from "./editFile"; // Adjust path if needed

export default function RunFolderData({ route }) {
  const { folderId, folderName } = route.params;
  const [groupedRuns, setGroupedRuns] = useState([]);
  const [currentlyEditing, setCurrentlyEditing] = useState({
    date: null,
    index: null,
  });
  const [editedDistance, setEditedDistance] = useState("");
  const [editedPace, setEditedPace] = useState("");
  const [editedDuration, setEditedDuration] = useState("");
  const [editedHeartRate, setEditedHeartRate] = useState("");
  const [editedNotes, setEditedNotes] = useState("");
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  const navigation = useNavigation();

  useEffect(() => {
    if (userId && folderId) {
      const folderDocRef = doc(
        FIREBASE_DB,
        "users",
        userId,
        "runFolders",
        folderId
      );

      const unsubscribe = onSnapshot(folderDocRef, (snapshot) => {
        if (snapshot.exists()) {
          const folderData = snapshot.data();
          const fetchedRuns = folderData.runs || [];

          const grouped = fetchedRuns.reduce((acc, runEntry) => {
            const date = runEntry.date;
            if (!acc[date]) {
              acc[date] = [];
            }
            acc[date].push(runEntry);
            return acc;
          }, {});

          const groupedArray = Object.keys(grouped)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
            .map((date) => ({
              date,
              runs: grouped[date],
            }));

          setGroupedRuns(groupedArray);
        } else {
          console.log("No such folder document found!");
          setGroupedRuns([]);
        }
      });

      return () => unsubscribe();
    }
  }, [userId, folderId]);

  const deleteCurrentFolder = async () => {
    try {
      if (!folderId || !userId)
        throw new Error("Folder ID or User ID is not available.");
      const folderRef = doc(
        FIREBASE_DB,
        "users",
        userId,
        "runFolders",
        folderId
      );

      Alert.alert(
        "Confirm Deletion",
        "This action cannot be undone. Are you sure you want to delete this folder?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            onPress: async () => {
              try {
                await deleteDoc(folderRef);
                navigation.goBack();
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

  const formatTime = (value) => value.toString().padStart(2, "0");
  const formatDuration = (duration) => {
    const [h, m, s] = duration.split(":");
    return `${formatTime(h)}:${formatTime(m)}:${formatTime(s)}`;
  };
  const formatPace = (pace) => {
    const [m, s] = pace.split(":");
    return `${m}:${formatTime(s)}`;
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
        {groupedRuns.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.dateSection}>
            <Text style={styles.dateText}>{group.date}</Text>

            {group.runs.map((run, index) => {
              const isEditing =
                currentlyEditing.date === group.date &&
                currentlyEditing.index === index;

              return (
                <View key={index} style={styles.statsContainer}>
                  {/* Distance */}
                  <View style={styles.statBlock}>
                    <Text style={styles.statsLabel}>Distance</Text>
                    {isEditing ? (
                      <TextInput
                        value={editedDistance}
                        onChangeText={setEditedDistance}
                        style={styles.statsValue}
                        keyboardType="numeric"
                      />
                    ) : (
                      <Text style={styles.statsValue}>{run.distance} km</Text>
                    )}
                  </View>

                  {/* Pace */}
                  <View style={styles.statBlock}>
                    <Text style={styles.statsLabel}>Pace</Text>
                    {isEditing ? (
                      <TextInput
                        value={editedPace}
                        onChangeText={setEditedPace}
                        style={styles.statsValue}
                      />
                    ) : (
                      <Text style={styles.statsValue}>
                        {formatPace(run.pace)} / km
                      </Text>
                    )}
                  </View>

                  {/* Duration */}
                  <View style={styles.statBlock}>
                    <Text style={styles.statsLabel}>Duration</Text>
                    {isEditing ? (
                      <TextInput
                        value={editedDuration}
                        onChangeText={setEditedDuration}
                        style={styles.statsValue}
                      />
                    ) : (
                      <Text style={styles.statsValue}>
                        {formatDuration(run.duration)}
                      </Text>
                    )}
                  </View>

                  {/* Heart Rate */}
                  <View style={styles.statBlock}>
                    <Text style={styles.statsLabel}>Heart Rate</Text>
                    {isEditing ? (
                      <TextInput
                        value={editedHeartRate}
                        onChangeText={setEditedHeartRate}
                        style={styles.statsValue}
                        keyboardType="numeric"
                      />
                    ) : (
                      <Text style={styles.statsValue}>
                        {run.heartRate ? `${run.heartRate} bpm` : "N/A"}
                      </Text>
                    )}
                  </View>

                  {/* Notes */}
                  {isEditing ? (
                    <TextInput
                      value={editedNotes}
                      onChangeText={setEditedNotes}
                      style={[
                        styles.runNotes,
                        { borderWidth: 1, borderColor: "#3A3B3C" },
                      ]}
                      placeholder="Notes"
                      multiline
                    />
                  ) : run.notes ? (
                    <Text style={styles.runNotes}>📝 {run.notes}</Text>
                  ) : null}

                  {/* Action Buttons */}
                  <View
                    style={{ flexDirection: "row", marginTop: 10, gap: 15 }}
                  >
                    {isEditing ? (
                      <>
                        <TouchableOpacity
                          onPress={async () => {
                            // Regex validators
                            const paceRegex = /^\d{1,2}:\d{2}$/;
                            const durationRegex = /^\d{1,2}:\d{2}:\d{2}$/;

                            if (!paceRegex.test(editedPace)) {
                              Alert.alert(
                                "Invalid Pace Format",
                                "Pace must be in x:xx or xx:xx format."
                              );
                              return;
                            }

                            if (!durationRegex.test(editedDuration)) {
                              Alert.alert(
                                "Invalid Duration Format",
                                "Duration must be in xx:xx:xx format."
                              );
                              return;
                            }

                            const result = await updateRunEntry({
                              userId,
                              folderId,
                              runDate: group.date,
                              runIndex: index,
                              updatedRunData: {
                                distance: parseFloat(editedDistance),
                                pace: editedPace,
                                duration: editedDuration,
                                heartRate: editedHeartRate
                                  ? parseInt(editedHeartRate)
                                  : null,
                                notes: editedNotes,
                              },
                            });

                            if (result.success) {
                              setCurrentlyEditing({ date: null, index: null });
                            } else {
                              Alert.alert("Error", result.message);
                            }
                          }}
                        >
                          <Text>✅</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() =>
                            setCurrentlyEditing({ date: null, index: null })
                          }
                        >
                          <Text>❌</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity
                        onPress={() => {
                          setCurrentlyEditing({ date: group.date, index });
                          setEditedDistance(run.distance.toString());
                          setEditedPace(run.pace);
                          setEditedDuration(run.duration);
                          setEditedHeartRate(run.heartRate?.toString() || "");
                          setEditedNotes(run.notes || "");
                        }}
                      >
                        <Text>✏️</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1E1F22" },
  headerContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "#2B2D31",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    height: "18%",
    position: "relative",
  },
  scrollContainer: {
    paddingVertical: 10,
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
    backgroundColor: "#B22222",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#FFFFFF",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statBlock: {
    width: "48%",
    backgroundColor: "#1E1F22",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#3A3B3C",
  },
  statsLabel: {
    fontSize: 14,
    color: "#B0B3B8",
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  runNotes: {
    fontSize: 14,
    color: "#B0B3B8",
    marginTop: 10,
    fontStyle: "italic",
    paddingHorizontal: 5,
  },
});
