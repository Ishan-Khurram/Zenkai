import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { FIREBASE_DB } from "firebaseConfig";
import { getAuth } from "firebase/auth";
import { format } from "date-fns";
import { useNavigation } from "@react-navigation/native";

const AddRun = () => {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [name, setName] = useState("");
  const [distance, setDistance] = useState("");
  const [paceMins, setPaceMins] = useState("");
  const [paceSecs, setPaceSecs] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [notes, setNotes] = useState("");

  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  const navigation = useNavigation();

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const foldersRef = collection(
          FIREBASE_DB,
          "users",
          userId,
          "runFolders"
        );
        const querySnapshot = await getDocs(foldersRef);

        const fetchedFolders = querySnapshot.docs.map((doc) => ({
          name: doc.data().folderName,
          folderID: doc.id,
        }));
        setFolders(fetchedFolders);
      } catch (error) {
        console.error("Error fetching folders:", error);
      }
    };

    fetchFolders();
  }, [userId]);

  // Automatically calculate elapsed time when distance or pace changes
  useEffect(() => {
    elapsedTime();
  }, [distance, paceMins, paceSecs]);

  const handleSelectFolder = (folder) => setSelectedFolder(folder);

  const elapsedTime = () => {
    if (!distance || (!paceMins && !paceSecs)) {
      return;
    }

    // get the needed variables
    const distanceNum = parseFloat(distance);
    const paceMinutes = parseInt(paceMins) || 0;
    const paceSeconds = parseInt(paceSecs) || 0;

    // calculate the total elapsed time using minutes and decimal places
    const decimalPace = paceMinutes + paceSeconds / 60;
    const totalMinutes = distanceNum * decimalPace;

    // convert to hh:mm:ss
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = Math.floor(totalMinutes % 60);
    const remainingSeconds = Math.round((totalMinutes % 1) * 60);

    // push the data to the proper place.
    setHours(totalHours.toString());
    setMinutes(remainingMinutes.toString().padStart(2, "0"));
    setSeconds(remainingSeconds.toString().padStart(2, "0"));
  };

  const handleSaveRun = async () => {
    if (!selectedFolder) {
      Alert.alert(
        "No Folder Selected",
        "Please select a folder to save your run."
      );
      return;
    }

    if (
      !name ||
      !distance ||
      (!paceMins && !paceSecs) ||
      (!hours && !minutes && !seconds)
    ) {
      Alert.alert(
        "Missing Information",
        "Please fill out all required fields."
      );
      return;
    }

    const today = format(new Date(), "yyyy-MM-dd");
    const formattedDuration = `${hours || "0"}:${minutes || "00"}:${
      seconds || "00"
    }`;
    const pace = `${paceMins || "0"}:${paceSecs || "00"}`;

    const runData = {
      date: today,
      name,
      distance: parseFloat(distance),
      pace,
      duration: formattedDuration,
      heartRate,
      notes,
    };

    try {
      const folderRef = doc(
        FIREBASE_DB,
        "users",
        userId,
        "runFolders",
        selectedFolder.folderID
      );
      await updateDoc(folderRef, {
        runs: arrayUnion(runData),
      });
      Alert.alert("Success", `Run saved to folder: ${selectedFolder.name}!`);

      setName("");
      setDistance("");
      setPaceMins("");
      setPaceSecs("");
      setHours("");
      setMinutes("");
      setSeconds("");
      setHeartRate("");
      setNotes("");
      setSelectedFolder(null);
    } catch (error) {
      console.error("Error saving run:", error);
      Alert.alert("Error", "Failed to save run. Please try again.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#1E1F22" }}>
      <>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => {
              if (selectedFolder) {
                setSelectedFolder(null);
              } else {
                navigation.goBack();
              }
            }}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>
            {!selectedFolder
              ? "Select a Workout Folder"
              : `Add Run to ${selectedFolder.name}`}
          </Text>
        </View>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {!selectedFolder ? (
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {folders.length > 0 ? (
                folders.map((folder, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.folderButton}
                    onPress={() => handleSelectFolder(folder)}
                  >
                    <Text style={styles.folderButtonText}>{folder.name}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noFoldersText}>No folders available.</Text>
              )}
            </ScrollView>
          ) : (
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <TextInput
                style={styles.input}
                placeholder="Run Name"
                placeholderTextColor="#ffffff"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="Distance (km)"
                placeholderTextColor="#ffffff"
                keyboardType="numeric"
                value={distance}
                onChangeText={setDistance}
              />

              {/* Pace Section */}
              <View style={styles.durationContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.subLabel}>Minutes</Text>
                  <TextInput
                    style={styles.durationInput}
                    placeholder="0"
                    placeholderTextColor="#ffffff"
                    keyboardType="numeric"
                    value={paceMins}
                    onChangeText={setPaceMins}
                    maxLength={2}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.subLabel}>Seconds</Text>
                  <TextInput
                    style={styles.durationInput}
                    placeholder="00"
                    placeholderTextColor="#ffffff"
                    keyboardType="numeric"
                    value={paceSecs}
                    onChangeText={setPaceSecs}
                    maxLength={2}
                  />
                </View>
              </View>

              {/* Duration Section */}
              <View style={styles.durationContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.subLabel}>Hours</Text>
                  <TextInput
                    style={styles.durationInput}
                    placeholder="0"
                    placeholderTextColor="#ffffff"
                    keyboardType="numeric"
                    value={hours}
                    onChangeText={setHours}
                    editable={false}
                    maxLength={2}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.subLabel}>Minutes</Text>
                  <TextInput
                    style={styles.durationInput}
                    placeholder="00"
                    placeholderTextColor="#ffffff"
                    keyboardType="numeric"
                    value={minutes}
                    onChangeText={setMinutes}
                    editable={false}
                    maxLength={2}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.subLabel}>Seconds</Text>
                  <TextInput
                    style={styles.durationInput}
                    placeholder="00"
                    placeholderTextColor="#ffffff"
                    keyboardType="numeric"
                    value={seconds}
                    onChangeText={setSeconds}
                    editable={false}
                    maxLength={2}
                  />
                </View>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Heart Rate (optional)"
                placeholderTextColor="#ffffff"
                keyboardType="numeric"
                value={heartRate}
                onChangeText={setHeartRate}
              />
              <TextInput
                style={styles.input}
                placeholder="Notes (optional)"
                placeholderTextColor="#ffffff"
                value={notes}
                onChangeText={setNotes}
              />
              <TouchableOpacity style={styles.button} onPress={handleSaveRun}>
                <Text style={styles.buttonText}>Save Run</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </KeyboardAvoidingView>
      </>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1F22", // Dark background
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    paddingBottom: 10,
    backgroundColor: "#2B2D31", // Dark header
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    height: "18%",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 15,
    backgroundColor: "#3A3B3C", // Soft button background
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
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
  },
  scrollContent: {
    padding: 10,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  input: {
    backgroundColor: "#2B2D31",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#3A3B3C",
    marginBottom: 15,
    color: "#FFFFFF",
    width: "100%",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    alignSelf: "flex-start",
    marginBottom: 6,
    color: "#B0B3B8",
  },
  button: {
    backgroundColor: "#43B581", // Soft green
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  folderButton: {
    backgroundColor: "#5865F2", // Discord blue
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: "center",
    width: "90%",
  },
  folderButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  noFoldersText: {
    fontSize: 16,
    color: "#B0B3B8",
    textAlign: "center",
    marginTop: 20,
  },
  durationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    width: "100%",
    gap: 10,
  },
  inputGroup: {
    flex: 1,
    alignItems: "center",
  },
  durationInput: {
    backgroundColor: "#2B2D31",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#3A3B3C",
    textAlign: "center",
    color: "#FFFFFF",
    width: "100%",
  },
  subLabel: {
    fontSize: 14,
    color: "#B0B3B8",
    marginBottom: 4,
  },
});

export default AddRun;
