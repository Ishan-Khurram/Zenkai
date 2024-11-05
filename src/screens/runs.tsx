import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableHighlight,
  Modal,
  Button,
} from "react-native";
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import CreateFolder from "@/components/createFolder";
import { FIREBASE_DB } from "firebaseConfig";

export default function Runs() {
  const [modalVisible, setModalVisible] = useState(false);
  const [folderModalVisible, setFolderModalVisible] = useState(false);
  const [folders, setFolders] = useState([]); // State to hold folder data (exercises, etc.)
  // Will hold data for the selected folder, displaying upon user click/render
  const [selectedFolder, setSelectedFolder] = useState(null); // State to hold the selected folder

  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  // Fetch folders and set state
  // As long as there is a signed in user, the data fetched will match the current users id.
  useEffect(() => {
    if (userId) {
      createFolders();
    }
  }, [userId]);

  // Function to handle adding a new folder
  const handleAddFolder = (newFolder) => {
    setFolders((prevFolders) => [...prevFolders, newFolder]);
  }; // appends new folder to existing.
  // ... (spread operator) used to copy all existing folders, and to add them to this array.

  // Function to fetch and log folder names from Firestore
  const createFolders = async () => {
    //async allows you to run this function in the background while others continue to execute. returns promise.
    const liftFoldersRef = collection(
      FIREBASE_DB,
      "users",
      userId,
      "runFolders"
    );
    const docSnap = await getDocs(liftFoldersRef); // waits on firestore response before running
    const folderData = docSnap.docs.map((doc) => ({
      folderName: doc.data().folderName,
      exercises: doc.data().exercises || [], // add/access data within folder. if no data, empty array.
    }));
    setFolders(folderData); // Update state with folder data
  };
  // promise represents an optiect of eventual completion (or failure) of an async function.
  // a placeholder value for a value that will be available in the future.

  // Function to render exercises when a folder is pressed
  const handleFolderPress = (folder) => {
    setSelectedFolder(folder); // Set the selected folder
    setModalVisible(true); // Show modal with exercises
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Ishan's Lifts</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Loop through the folders to render folder names in TouchableHighlight */}
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

      {/* Modal to display exercises for the selected folder */}
      {selectedFolder && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{selectedFolder.folderName}</Text>
            <ScrollView>
              {selectedFolder.exercises.map((exercise, index) => (
                <View key={index} style={styles.exerciseItem}>
                  <Text>
                    {exercise.name} - weight: {exercise.weight} sets:{" "}
                    {exercise.sets} reps: {exercise.reps} reps notes:{" "}
                    {exercise.notes}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </Modal>
      )}

      {/* Add Folder Button */}
      <TouchableHighlight
        style={styles.addFolderButton}
        onPress={() => setFolderModalVisible(true)}
        underlayColor="#ddd"
      >
        <Text style={styles.buttonText}>+</Text>
      </TouchableHighlight>

      {/* Folder Creation Modal */}
      <Modal
        visible={folderModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFolderModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <CreateFolder
              userId={userId}
              onClose={() => setFolderModalVisible(false)}
              onAddFolder={handleAddFolder}
              folderType="runFolders"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "white",
  },
  exerciseItem: {
    backgroundColor: "#fff", // White background for each exercise item
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2, // Adds shadow for Android
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
    flex: 1,
    fontFamily: "DMSans-Black",
    fontSize: 32,
    lineHeight: 32,
    fontWeight: "bold",
    color: "#000",
  },
  button: {
    backgroundColor: "#007bff",
    borderRadius: 5,
    alignItems: "center",
    paddingVertical: 15,
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
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
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  folderItem: {
    width: "45%",
    aspectRatio: 1,
    backgroundColor: "#007bff",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  folderText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
