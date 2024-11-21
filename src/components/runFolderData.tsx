import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { FIREBASE_DB } from "firebaseConfig";

const RunFolderDetail = ({ route }) => {
  const { folderId, folderName } = route.params;
  const [runs, setRuns] = useState([]);
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (userId && folderId) {
      fetchRuns();
    }
  }, [userId, folderId]);

  const fetchRuns = async () => {
    try {
      const folderRef = doc(
        FIREBASE_DB,
        "users",
        userId,
        "runFolders",
        folderId
      );
      const docSnap = await getDoc(folderRef);
      if (docSnap.exists()) {
        const folderData = docSnap.data();
        setRuns(folderData.runs || []);
      } else {
        console.error("No such folder document found.");
      }
    } catch (error) {
      console.error("Error fetching folder data:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>{folderName}</Text>

      {/* Run List */}
      <ScrollView contentContainerStyle={styles.runContainer}>
        {runs.length > 0 ? (
          runs
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            ) // Sort by date (newest first)
            .map((run, index) => (
              <View key={index} style={styles.runItem}>
                <Text style={styles.runName}>{run.name}</Text>
                <Text style={styles.runDetails}>
                  {run.date} | {run.distance} km | {run.duration} | Pace:{" "}
                  {run.pace}
                </Text>
                {run.notes ? (
                  <Text style={styles.runNotes}>Notes: {run.notes}</Text>
                ) : null}
              </View>
            ))
        ) : (
          <Text style={styles.noRunsText}>
            No runs recorded in this folder.
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

export default RunFolderDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  runContainer: {
    paddingBottom: 20,
  },
  runItem: {
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  runName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  runDetails: {
    fontSize: 14,
    color: "#555",
  },
  runNotes: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
  noRunsText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
});
