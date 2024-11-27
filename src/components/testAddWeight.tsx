import React, { useState } from "react";
import { Modal, Button, View, StyleSheet } from "react-native";
import AddWeight from "@/components/addWeight";

const AddWeightTest = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Button
        title="Open AddWeight Modal"
        onPress={() => setModalVisible(true)}
      />
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <AddWeight
              visible={true} // Pass true to render AddWeight inside modal
              onClose={() => {
                console.log("Closing AddWeight");
                setModalVisible(false);
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AddWeightTest;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dimmed background effect
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
});
