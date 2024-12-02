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
import { getAuth } from "firebase/auth";

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
        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Fetched and sorted data:", data);
        setWeightData(data); // Store sorted data directly
      } catch (error) {
        console.error("Error fetching weight data:", error);
      }
    };

    fetchData();
  }, [userId]);

  // Table setup
  const tableHead = ["Date", "Weight"];
  const tableData = weightData.map((item) => [item.date, item.weight]);

  return (
    <View style={styles.background}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Ishan's Weight Trends</Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Chart */}
        <View style={styles.chartContainer}>
          <ScrollView horizontal style={styles.scrollContainer}>
            <VictoryChart
              height={600}
              width={1000}
              theme={VictoryTheme.material}
            >
              <VictoryAxis
                tickValues={weightData.map((d) => d.date)}
                style={{
                  tickLabels: { angle: -45, fontSize: 10, padding: 15 },
                }}
              />
              <VictoryAxis
                dependentAxis
                tickFormat={(t) => `${t} lbs`}
                tickCount={15}
                style={{
                  tickLabels: { fontSize: 12, padding: 5 },
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
    backgroundColor: "#fff",
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
    backgroundColor: "#f1f8ff",
  },
  text: {
    margin: 6,
  },
});
