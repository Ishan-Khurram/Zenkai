import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { getAuth } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { FIREBASE_DB } from "firebaseConfig";
import { deleteDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

export default function RunFolderData({ route }) {
  const { folderId, folderName } = route.params;
  const [groupedRuns, setGroupedRuns] = useState([]);
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

      // Clean up the listener when the component unmounts or the folder changes
      return () => unsubscribe();
    }
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
        "runFolders",
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
      {/* Header with Back Button */}
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
        {groupedRuns.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.dateSection}>
            <Text style={styles.dateText}>{group.date}</Text>
            {group.runs.map((run) => (
              <View style={styles.statsContainer}>
                {/* Top Left */}
                <View style={styles.topLeft}>
                  <Text style={styles.statsLabel}>Distance</Text>
                  <Text style={styles.statsValue}>{run.distance} km</Text>
                </View>

                {/* Top Right */}
                <View style={styles.topRight}>
                  <Text style={styles.statsLabel}>Avg Pace</Text>
                  <Text style={styles.statsValue}>{run.pace} / km</Text>
                </View>

                {/* Bottom Left */}
                <View style={styles.bottomLeft}>
                  <Text style={styles.statsLabel}>Moving Time</Text>
                  <Text style={styles.statsValue}>{run.duration}</Text>
                </View>

                {/* Bottom Right */}
                <View style={styles.bottomRight}>
                  <Text style={styles.statsLabel}>Heart Rate</Text>
                  {run.heartRate ? (
                    <Text style={styles.statsValue}>{run.heartRate} bpm</Text>
                  ) : (
                    <Text style={styles.statsValue}>N/A</Text>
                  )}
                </View>
                {/* Notes */}
                <View>
                  {run.notes ? (
                    <Text style={styles.runNotes}>Notes: {run.notes}</Text>
                  ) : null}
                </View>
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
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "#f0f0f0",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    height: "18%",
    position: "relative",
  },
  scrollContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#fafafa",
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
    backgroundColor: "#f7f9fc",
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
    color: "#1f2937",
  },
  runNotes: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#6b7280",
    marginTop: 20,
  },
  statsContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap", // Allows 2x2 layout
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 20, // Adds spacing before the runs section
  },
  statsLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#777",
  },
  statsValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  topLeft: {
    width: "45%",
    marginBottom: 20,
    alignItems: "center",
  },
  topRight: {
    width: "45%",
    marginBottom: 20,
    alignItems: "center",
  },
  bottomLeft: {
    width: "45%",
    alignItems: "center",
  },
  bottomRight: {
    width: "45%",
    alignItems: "center",
  },
});
