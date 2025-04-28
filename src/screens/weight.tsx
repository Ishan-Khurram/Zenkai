import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, Text } from "react-native";
import {
  VictoryLine,
  VictoryChart,
  VictoryScatter,
  VictoryTheme,
  VictoryAxis,
} from "victory-native";
import { Table, Row, Rows } from "react-native-table-component";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { FIREBASE_DB } from "firebaseConfig";
import { onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Dimensions } from "react-native";

export default function Weight() {
  const [weightData, setWeightData] = useState([]);
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Reference to Firestore weights collection, ordered by date
        const weightsRef = collection(
          FIREBASE_DB,
          "users",
          userId,
          "weightFolder"
        );
        const q = query(weightsRef, orderBy("date", "asc")); // Fetch in ascending order

        // listen to changes in REAL TIME.
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setWeightData(data); // Store sorted data directly
        });
        // Cleanup listener when component unmounts or userId changes
        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching weight data:", error);
      }
    };

    fetchData();
  }, [userId]);

  // Table setup
  const tableHead = ["Date", "Weight"];
  const tableData = weightData.map((item) => [item.date, item.weight]);

  // add scroll functionality once certain number of data points are hit.
  const screenWidth = Dimensions.get("window").width;
  const entryCount = weightData.length;
  const chartWidth = entryCount > 20 ? entryCount * 40 : screenWidth;

  return (
    <View style={styles.background}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Weight Trends</Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Chart */}
        <View style={styles.chartContainer}>
          <ScrollView horizontal style={styles.scrollContainer}>
            {entryCount > 20 && (
              <Text style={{ color: "#aaa", marginLeft: 10, marginBottom: 5 }}>
                Scroll → to view full chart
              </Text>
            )}

            <VictoryChart
              height={600}
              width={chartWidth}
              theme={VictoryTheme.material}
            >
              <VictoryAxis
                tickValues={weightData.map((d) => d.date)}
                style={{
                  tickLabels: {
                    angle: -45,
                    fontSize: 10,
                    padding: 15,
                    fill: "#fff",
                  },
                }}
              />
              <VictoryAxis
                dependentAxis
                tickFormat={(t) => `${t} lbs`}
                tickCount={15}
                style={{
                  tickLabels: { fontSize: 12, padding: -5, fill: "#fff" },
                }}
              />
              <VictoryLine
                data={weightData}
                x="date"
                y="weight"
                style={{
                  data: { stroke: "#007bff", strokeWidth: 2 },
                }}
              />
              <VictoryScatter
                data={weightData}
                x="date"
                y="weight"
                size={3}
                style={{
                  data: { fill: "#007bff" },
                }}
              />
            </VictoryChart>
          </ScrollView>
        </View>

        {/* Table */}
        <View style={styles.tableContainer}>
          <Table borderStyle={{ borderWidth: 1, borderColor: "#C1C0B9" }}>
            <Row data={tableHead} style={styles.head} textStyle={styles.text} />
            <Rows data={tableData} textStyle={styles.text} />
          </Table>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#1E1F22", // Main dark background
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#2B2D31", // Darker header
    borderRadius: 20,
    height: "20%",
  },
  headerText: {
    flex: 1,
    fontFamily: "DMSans-Black",
    fontSize: 32,
    lineHeight: 32,
    fontWeight: "bold",
    color: "#FFFFFF", // White for readability
  },
  contentContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  chartContainer: {
    marginBottom: 20,
  },
  scrollContainer: {
    paddingHorizontal: 10,
  },
  tableContainer: {
    paddingHorizontal: 10,
  },
  head: {
    height: 40,
    backgroundColor: "#3A3B3C", // Subtle table head background
  },
  text: {
    margin: 6,
    color: "#FFFFFF", // White text for contrast
  },
});
