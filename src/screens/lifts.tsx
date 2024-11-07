import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableHighlight,
  Button,
} from "react-native";
import { getAuth } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { FIREBASE_DB } from "firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import CreateFolder from "@/components/createFolder";

export default function Lifts() {
  const [folders, setFolders] = useState([]);
  const [folderModalVisible, setFolderModalVisible] = useState(false);
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  const navigation = useNavigation();

  useEffect(() => {
    if (userId) {
      createFolders();
    }
  }, [userId]);

  const handleAddFolder = (newFolder) => {
    setFolders((prevFolders) => [...prevFolders, newFolder]);
  };

  const createFolders = async () => {
    const liftFoldersRef = collection(
      FIREBASE_DB,
      "users",
      userId,
      "liftFolders"
    );
    const docSnap = await getDocs(liftFoldersRef);
    const folderData = docSnap.docs.map((doc) => ({
      folderName: doc.data().folderName,
      exercises: doc.data().exercises || [],
    }));
    setFolders(folderData);
  };

  const handleFolderPress = (folder) => {
    navigation.navigate("FolderDetail", { folder });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Ishan's Lifts</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {folders.map((folder, index) => (
          <TouchableHighlight
            key={index}
            style={styles.button}
            onPress={() => handleFolderPress(folder)}
            underlayColor="#ddd"
          >
            <Text style={styles.folderText}>{folder.folderName}</Text>
          </TouchableHighlight>
        ))}
      </ScrollView>

      <TouchableHighlight
        style={styles.addFolderButton}
        onPress={() => setFolderModalVisible(true)}
        underlayColor="#ddd"
      >
        <Text style={styles.buttonText}>+</Text>
      </TouchableHighlight>

      {folderModalVisible && (
        <CreateFolder
          userId={userId}
          onClose={() => setFolderModalVisible(false)}
          onAddFolder={handleAddFolder}
          folderType="liftFolders"
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
