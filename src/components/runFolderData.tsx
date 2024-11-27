import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableHighlight,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { FIREBASE_DB } from "firebaseConfig";
import { useNavigation } from "@react-navigation/native";

const RunFolderDetail = ({ route }) => {
  const { folderId, folderName } = route.params;
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  const navigation = useNavigation();

  useEffect(() => {
    if (userId && folderId) {
      fetchRuns();
    }
  }, [userId, folderId]);

  const fetchRuns = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRuns();
    setRefreshing(false);
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
                {/* Header */}
                <View style={styles.runHeader}>
                  <Text style={styles.runName}>{run.name}</Text>
                  <Text style={styles.runDate}>{run.date}</Text>
                </View>

                {/* Distance, Pace, and Time */}
                <View style={styles.runDetailsContainer}>
                  <View style={styles.runDetailsLabel}>
                    <Text style={styles.detailLabel}>Distance:</Text>
                    <Text style={styles.detailLabel}>Pace:</Text>
                    <Text style={styles.detailLabel}>Total Time:</Text>
                  </View>
                  <View style={styles.runDetailsValue}>
                    <Text style={styles.detailValue}>{run.distance} km</Text>
                    <Text style={styles.detailValue}>{run.pace}</Text>
                    <Text style={styles.detailValue}>{run.duration}</Text>
                  </View>
                </View>

                {/* Notes */}
                <View style={styles.notesContainer}>
                  <Text style={styles.notesTitle}>Notes:</Text>
                  <Text style={styles.notesValue}>{run.notes || "N/A"}</Text>
                </View>
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
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    flexDirection: "column",
  },
  runHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  runName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  runDate: {
    fontSize: 14,
    color: "#555",
  },
  runDetailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  runDetailsLabel: {
    flex: 1,
  },
  runDetailsValue: {
    flex: 1,
    alignItems: "flex-end",
  },
  detailLabel: {
    fontSize: 14,
    color: "#555",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    marginBottom: 2,
  },
  notesContainer: {
    marginTop: 10,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 5,
  },
  notesValue: {
    fontSize: 14,
    color: "#333",
  },
  noRunsText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
});
