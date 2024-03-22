import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const styles = StyleSheet.create({
  TextInput: {
    backgroundColor: "#E7E7E7",
    borderRadius: 1,
    marginBottom: 20,
    padding: 20,
    width: "50%",
  },
  container: {
    alignItems: "center",
    flex: 1,
  },
});

export const RegistrationScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={styles.container}>
      <Text>Registration Screen</Text>
      {/* TODO: INPUT for email, password, submit  */}
      <TextInput
        style={styles.TextInput}
        placeholder="Phone Number: 10 digits"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />
      <TextInput
        style={styles.TextInput}
        placeholder="Create a Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity onPress={() => {}}>
        <Text>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};
