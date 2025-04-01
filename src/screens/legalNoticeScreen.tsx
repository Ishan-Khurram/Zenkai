import React from "react";
import { ScrollView, Text, View, StyleSheet } from "react-native";

const LegalNoticeScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View>
        <Text style={styles.title}>Legal Notice</Text>
        <Text style={styles.subtitle}>Effective Date: Dec 5th, 2024</Text>
      </View>

      {/* Privacy Policy Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy Policy</Text>
        <Text style={styles.body}>
          Your privacy is important to us. This Privacy Policy explains how we
          collect, use, and protect your information.
        </Text>
        <Text style={styles.heading}>1. Information We Collect</Text>
        <Text style={styles.body}>
          - Personal Information: When you create an account, we may collect
          your name, email address, and any fitness-related data you input
          (e.g., workout logs, weight records).
          {"\n"}- Device Information: We may collect anonymous data such as your
          device type and app usage statistics to improve app performance.
        </Text>
        <Text style={styles.heading}>2. How We Use Your Information</Text>
        <Text style={styles.body}>
          We use your information to:
          {"\n"}- Provide the app’s core functionality (e.g., saving your
          workout data).
          {"\n"}- Improve the app experience and troubleshoot issues.
          {"\n"}- Send updates or reminders, if enabled.
        </Text>
        <Text style={styles.heading}>3. Data Sharing</Text>
        <Text style={styles.body}>
          We do not sell or share your personal information with third parties.
          However, we may share anonymous, aggregated data to enhance app
          performance.
        </Text>
        <Text style={styles.heading}>4. Data Security</Text>
        <Text style={styles.body}>
          We implement reasonable measures to protect your data from
          unauthorized access. However, no system is completely secure, and we
          cannot guarantee absolute security.
        </Text>
        <Text style={styles.heading}>5. Your Choices</Text>
        <Text style={styles.body}>
          - Access, update, or delete your data by contacting us at
          Zenkai.hq@gmail.com.
          {"\n"}- Stop using the app at any time, which will stop data
          collection.
        </Text>
        <Text style={styles.heading}>6. Changes to the Privacy Policy</Text>
        <Text style={styles.body}>
          We may update this Privacy Policy periodically. We will notify you of
          changes by updating the “Effective Date” above.
        </Text>
      </View>

      {/* Terms of Service Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Terms of Service</Text>
        <Text style={styles.heading}>1. Use of the App</Text>
        <Text style={styles.body}>
          - The app is intended for personal fitness tracking only.
          {"\n"}- You agree not to misuse the app, attempt to disrupt its
          functionality, or access data not intended for you.
        </Text>
        <Text style={styles.heading}>2. Account Responsibilities</Text>
        <Text style={styles.body}>
          - You are responsible for maintaining the accuracy and security of
          your account information.
          {"\n"}- You must be at least 13 to use the app.
        </Text>
        <Text style={styles.heading}>3. Disclaimer</Text>
        <Text style={styles.body}>
          - Zenkai is provided “as is” without warranties of any kind. We do not
          guarantee that the app will meet your fitness goals or be error-free.
          {"\n"}- We are not responsible for injuries, losses, or damages
          resulting from your use of the app.
        </Text>
        <Text style={styles.heading}>4. Limitation of Liability</Text>
        <Text style={styles.body}>
          - To the fullest extent permitted by law, our liability is limited to
          $0, regardless of any payments made or services rendered.
        </Text>
        <Text style={styles.heading}>5. Termination</Text>
        <Text style={styles.body}>
          - We reserve the right to terminate your access to the app at our
          discretion if you violate these terms.
        </Text>
        <Text style={styles.heading}>6. Governing Law</Text>
        <Text style={styles.body}>
          - These terms are governed by the laws of Canada.
        </Text>
        <Text style={styles.heading}>7. Changes to the Terms of Service</Text>
        <Text style={styles.body}>
          We may update these terms at any time. Continued use of the app
          indicates your acceptance of the updated terms.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.contactTitle}>Contact Us</Text>
        <Text style={styles.body}>
          If you have any questions or concerns, contact us at
          Zenkai.hq@gmail.com.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#1E1F22", // Dark background
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#B0B3B8", // Muted gray
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#FFFFFF",
  },
  heading: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
    color: "#FFFFFF",
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: "#D1D2D3", // Softer white for body text
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#FFFFFF",
  },
});

export default LegalNoticeScreen;
