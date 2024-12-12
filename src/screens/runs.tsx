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
    backgroundColor: "white",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    height: "20%",
  },
  headerText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "#007bff",
    borderRadius: 5,
    alignItems: "center",
    paddingVertical: 15,
    marginVertical: 10,
  },
  folderText: {
    color: "#fff",
    fontSize: 18,
  },
  addFolderButton: {
    backgroundColor: "#04AA6D",
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
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
