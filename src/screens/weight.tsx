import React from "react";
import { StyleSheet, View, ScrollView, Text, Image } from "react-native";
import {
  VictoryLine,
  VictoryChart,
  VictoryScatter,
  VictoryTheme,
  VictoryAxis,
} from "victory-native";
import { Table, Row, Rows } from "react-native-table-component";

const data = [
  { date: "11/25/22", weight: 270 },
  { date: "01/07/23", weight: 252 },
  { date: "01/14/23", weight: 249.7 },
  { date: "01/21/23", weight: 248 },
  { date: "01/29/23", weight: 247.2 },
  { date: "02/06/23", weight: 245.6 },
  { date: "02/13/23", weight: 242.2 },
  { date: "02/23/23", weight: 240 },
  { date: "03/01/23", weight: 239.2 },
  { date: "03/09/23", weight: 236.4 },
  { date: "03/19/23", weight: 232.8 },
  { date: "03/31/23", weight: 232.4 },
  { date: "04/07/23", weight: 227.6 },
  { date: "04/14/23", weight: 225 },
  { date: "04/21/23", weight: 222.8 },
  { date: "04/29/23", weight: 219.6 },
  { date: "05/05/23", weight: 220 },
  { date: "05/12/23", weight: 214.6 },
  { date: "05/29/23", weight: 214.2 },
  { date: "06/06/23", weight: 210 },
  { date: "06/15/23", weight: 208.8 },
  { date: "06/30/23", weight: 206.8 },
  { date: "07/12/23", weight: 205.4 },
  { date: "07/18/23", weight: 203.4 },
  { date: "08/01/23", weight: 202.4 },
  { date: "08/12/23", weight: 201.0 },
  { date: "09/06/23", weight: 199.8 },
  { date: "09/17/23", weight: 196.2 },
  { date: "09/29/23", weight: 198 },
  { date: "10/01/23", weight: 197.6 },
  { date: "10/02/23", weight: 195 },
  { date: "10/22/23", weight: 192.6 },
  { date: "09/10/24", weight: 185 },
  { date: "01/14/23", weight: 249.7 },
  { date: "01/21/23", weight: 248 },
  { date: "01/29/23", weight: 247.2 },
  { date: "02/06/23", weight: 245.6 },
  { date: "02/13/23", weight: 242.2 },
  { date: "02/23/23", weight: 240 },
  { date: "03/01/23", weight: 239.2 },
  { date: "03/09/23", weight: 236.4 },
  { date: "03/19/23", weight: 232.8 },
  { date: "03/31/23", weight: 232.4 },
  { date: "04/07/23", weight: 227.6 },
  { date: "04/14/23", weight: 225 },
  { date: "04/21/23", weight: 222.8 },
  { date: "04/29/23", weight: 219.6 },
  { date: "05/05/23", weight: 220 },
  { date: "05/12/23", weight: 214.6 },
  { date: "05/29/23", weight: 214.2 },
  { date: "06/06/23", weight: 210 },
  { date: "06/15/23", weight: 208.8 },
  { date: "06/30/23", weight: 206.8 },
  { date: "07/12/23", weight: 205.4 },
  { date: "07/18/23", weight: 203.4 },
  { date: "08/01/23", weight: 202.4 },
  { date: "08/12/23", weight: 201.0 },
  { date: "09/06/23", weight: 199.8 },
  { date: "09/17/23", weight: 196.2 },
  { date: "09/29/23", weight: 198 },
  { date: "10/01/23", weight: 197.6 },
  { date: "10/02/23", weight: 195 },
  { date: "10/22/23", weight: 192.6 },
  { date: "09/10/24", weight: 185 },
];

export default function Weight() {
  const tableHead = ["Date", "Weight"];
  const tableData = data.map((item) => [item.date, item.weight]).reverse();

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
                tickValues={data.map((d) => d.date)}
                style={{
                  tickLabels: {
                    angle: -45,
                    fontSize: 10,
                    padding: 15,
                  },
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
                data={data}
                x="date"
                y="weight"
                style={{
                  data: { stroke: "#007bff", strokeWidth: 2 },
                }}
              />
              <VictoryScatter
                data={data}
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
