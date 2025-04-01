import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { getAuth } from "firebase/auth";
import { doc, getDoc, onSnapshot, deleteDoc } from "firebase/firestore";
import { FIREBASE_DB } from "firebaseConfig";
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

      return () => unsubscribe();
    }
  }, [userId, folderId]);

  const deleteCurrentFolder = async () => {
    try {
      if (!folderId || !userId) {
        throw new Error("Folder ID or User ID is not available.");
      }

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
            {group.runs.map((run, index) => (
              <View key={index} style={styles.statsContainer}>
                <View style={styles.statBlock}>
                  <Text style={styles.statsLabel}>Distance</Text>
                  <Text style={styles.statsValue}>{run.distance} km</Text>
                </View>

                <View style={styles.statBlock}>
                  <Text style={styles.statsLabel}>Pace</Text>
                  <Text style={styles.statsValue}>{run.pace} / km</Text>
                </View>

                <View style={styles.statBlock}>
                  <Text style={styles.statsLabel}>Duration</Text>
                  <Text style={styles.statsValue}>{run.duration}</Text>
                </View>

                <View style={styles.statBlock}>
                  <Text style={styles.statsLabel}>Heart Rate</Text>
                  <Text style={styles.statsValue}>
                    {run.heartRate ? `${run.heartRate} bpm` : "N/A"}
                  </Text>
                </View>

                {run.notes ? (
                  <Text style={styles.runNotes}>📝 {run.notes}</Text>
                ) : null}
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
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statBlock: {
    width: "48%",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  statsLabel: {
    fontSize: 14,
    color: "#888",
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  runNotes: {
    fontSize: 14,
    color: "#555",
    marginTop: 10,
    fontStyle: "italic",
    paddingHorizontal: 5,
  },
});
