import React, { Component } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

const TextFiledWithValue = ({
  instructionText,
  value,
  isNetworkCheck,
  netWorkConnection,
  image,
  containerStyle,
}) => {
  return (
    <View style={[styles.textViewStyle, containerStyle]}>
      <Text style={styles.instructionText}>{instructionText}</Text>
      {isNetworkCheck ? (
        netWorkConnection ? (
          <Text style={styles.valueText}>{value}</Text>
        ) : (
          <Image source={image} style={styles.imageStyle} />
        )
      ) : (
        <Text style={styles.valueText}>{value}</Text>
      )}
    </View>
  );
};

export default TextFiledWithValue;

const styles = StyleSheet.create({
  textViewStyle: {
    marginTop: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  instructionText: { fontSize: 17, fontWeight: "400" },
  valueText: { fontSize: 18, fontWeight: "700", marginLeft: 5 },
  imageStyle: { width: 20, height: 20, marginLeft: 5 },
});
