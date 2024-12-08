import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { FIREBASE_DB } from "firebaseConfig";
import { useNavigation } from "@react-navigation/native";

export default function RunFolderData({ route }) {
  const { folderId, folderName } = route.params;
  const [groupedRuns, setGroupedRuns] = useState([]);
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  const navigation = useNavigation();

  useEffect(() => {
    const fetchRuns = async () => {
      try {
        const folderDocRef = doc(
          FIREBASE_DB,
          "users",
          userId,
          "runFolders",
          folderId
        );
        const folderDoc = await getDoc(folderDocRef);

        if (folderDoc.exists()) {
          const folderData = folderDoc.data();
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
        }
      } catch (error) {
        console.error("Error fetching runs:", error);
      }
    };

    if (userId && folderId) fetchRuns();
  }, [userId, folderId]);

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
        <Text style={styles.headerText}>{folderName}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {groupedRuns.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.dateSection}>
            <Text style={styles.dateText}>Date: {group.date}</Text>
            {group.runs.map((run, runIndex) => (
              <View key={runIndex} style={styles.runContainer}>
                <Text style={styles.runName}>{run.name}</Text>
                <Text style={styles.runDetail}>Distance: {run.distance}</Text>
                <Text style={styles.runDetail}>Duration: {run.duration}</Text>
                {run.notes ? (
                  <Text style={styles.runNotes}>Notes: {run.notes}</Text>
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
  runContainer: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  runName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  runDetail: {
    fontSize: 14,
    color: "#333",
  },
  runNotes: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#555",
  },
});
