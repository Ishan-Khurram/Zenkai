import React, { useState } from "react";
import { Button, View } from "react-native";
import AddWeight from "@/components/addWeight";

const AddWeightTest = () => {
  const [visible, setVisible] = useState(true);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="Open AddWeight Modal" onPress={() => setVisible(true)} />
      <AddWeight
        visible={visible}
        onClose={() => {
          console.log("Closing AddWeight");
          setVisible(false);
        }}
      />
    </View>
  );
};

export default AddWeightTest;
