import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

interface RunShareCardProps {
  distance: string;
  pace: string;
  time: string;
}

const RunShareCard = ({ distance, pace, time }: RunShareCardProps) => {
  return (
    <View style={styles.container}>
      {/* Metrics vertically stacked */}
      <View style={styles.metricsStack}>
        <View style={styles.metricBlock}>
          <Text style={styles.label}>Distance</Text>
          <Text style={styles.value}>{distance} km</Text>
        </View>

        <View style={styles.metricBlock}>
          <Text style={styles.label}>Pace</Text>
          <Text style={styles.value}>{pace} / km</Text>
        </View>

        <View style={styles.metricBlock}>
          <Text style={styles.label}>Time</Text>
          <Text style={styles.value}>{time}</Text>
        </View>
      </View>

      {/* ZENKAI branding */}
      <Image
        source={require("../images/zenkai.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.zenkai}>ZENKAI</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    width: 512,
    height: 768,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  metricsStack: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    gap: 25,
  },
  metricBlock: {
    width: "100%",
    alignItems: "center",
  },
  label: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 6,
  },
  value: {
    fontSize: 36,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  logo: {
    width: 100,
    height: 100,
  },
  zenkai: {
    fontSize: 30,
    color: "#FFFFFF",
    fontWeight: "bold",
    letterSpacing: 2,
  },
});

export default RunShareCard;
