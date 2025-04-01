import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableHighlight,
} from "react-native";
import { getAuth } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { FIREBASE_DB } from "firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import CreateFolder from "@/components/createFolder";

export default function Runs() {
  const [folders, setFolders] = useState([]);
  const [folderModalVisible, setFolderModalVisible] = useState(false);
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  const navigation = useNavigation();

  // Fetch folders on component mount
  useEffect(() => {
    if (!userId) return;

    const foldersRef = collection(FIREBASE_DB, "users", userId, "runFolders");

    const unsubscribe = onSnapshot(foldersRef, (snapshot) => {
      const updatedFolders = snapshot.docs.map((doc) => ({
        folderName: doc.data().folderName,
        folderId: doc.id,
      }));
      setFolders(updatedFolders);
    });

    // Clean up listener when component unmounts
    return () => unsubscribe();
  }, [userId]);

  // Navigate to FolderDetail
  const handleFolderPress = (folderId, folderName) => {
    navigation.navigate("RunFolderDetail", { folderId, folderName });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Runs</Text>
      </View>

      {/* Folder List */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {folders.map((folder) => (
          <TouchableHighlight
            key={folder.folderId}
            style={styles.button}
            onPress={() =>
              handleFolderPress(folder.folderId, folder.folderName)
            }
            underlayColor="#ddd"
          >
            <Text style={styles.folderText}>{folder.folderName}</Text>
          </TouchableHighlight>
        ))}
      </ScrollView>

      {/* Add Folder Button */}
      <TouchableHighlight
        style={styles.addFolderButton}
        onPress={() => setFolderModalVisible(true)}
        underlayColor="#ddd"
      >
        <Text style={styles.buttonText}>+</Text>
      </TouchableHighlight>

      {/* Create Folder Modal */}
      {folderModalVisible && (
        <CreateFolder
          userId={userId}
          onClose={() => setFolderModalVisible(false)}
          folderType="runFolders"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1F22", // Dark background
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#2B2D31",
    borderRadius: 20,
    height: "20%",
  },
  headerText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#1E1F22",
  },
  button: {
    backgroundColor: "#5865F2", // Updated from #007bff (bright blue) to soft blurple
    borderRadius: 5,
    alignItems: "center",
    paddingVertical: 15,
    marginVertical: 10,
  },
  folderText: {
    color: "#FFFFFF",
    fontSize: 18,
  },
  addFolderButton: {
    backgroundColor: "#43B581", // Soothing green for floating button
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 30,
    right: 20,
    zIndex: 1,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
