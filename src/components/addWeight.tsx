import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";
import { collection, addDoc } from "firebase/firestore";
import { FIREBASE_DB } from "firebaseConfig";
import { getAuth } from "firebase/auth";
import { DateTimePickerEvent } from "@react-native-community/datetimepicker";

const AddWeight = ({ visible, onClose }) => {
  // state for weight and date input.
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState("");

  // get user id via session
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  // submit handling
  const handleSubmit = async () => {
    // validate inputs
    if (!weight || isNaN(Number(weight)) || !date) {
      Alert.alert("Invalid Inputs", "Please provide valid weight and date.");
      return;
    }

    try {
      // reference weight folder from within DB
      const weightRef = collection(
        FIREBASE_DB,
        "users",
        userId,
        "weightFolder"
      );

      // add new entry with weight and date
      await addDoc(weightRef, {
        weight: Number(weight),
        date: date,
      });

      Alert.alert("Weight entry added successfully!");

      // reset input fields and close modal
      setWeight("");
      setDate("");
      onClose(); // Close the modal
    } catch (error) {
      Alert.alert("Failed to add weight entry, please try again.");
    }
  };

  const formatDate = (input) => {
    // Remove all non-numeric characters.
    const cleaned = input.replace(/\D/g, "");

    // If input is empty or being deleted, return cleaned value
    if (cleaned.length <= 4) {
      return cleaned; // Allows user to delete freely
    }

    // Construct formatted date as 'YYYY-MM-DD'
    let formattedDate = cleaned;

    if (cleaned.length > 4) {
      formattedDate = `${cleaned.substring(0, 4)}-${cleaned.substring(4, 6)}`;
    }
    if (cleaned.length > 6) {
      formattedDate += `-${cleaned.substring(6, 8)}`;
    }

    return formattedDate;
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Text style={styles.title}>Add Weight Entry</Text>
        <TextInput
          style={styles.input}
          placeholder="Weight (lbs)"
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric" // Only allows numeric input for weight
        />
        <TextInput
          style={styles.input}
          placeholder="Date (YYYY-MM-DD)"
          placeholderTextColor="#FFFFFF"
          value={date}
          onChangeText={(text) => setDate(formatDate(text))}
          keyboardType="numeric"
          maxLength={10} // inclusive of the dashes.
        />
        <Button title="Submit" onPress={handleSubmit} />
        <Button title="Cancel" onPress={onClose} color="#ff5c5c" />
      </View>
    </View>
  );
};

export default AddWeight;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  container: {
    width: "80%",
    maxWidth: 400,
    padding: 20,
    backgroundColor: "#1E1F22",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#FFFFFF",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#3A3B3C",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#2B2D31",
    color: "#FFFFFF",
  },
});
