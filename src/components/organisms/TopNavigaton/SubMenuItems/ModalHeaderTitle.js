import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import Images from "../../../../Images";
import { Heading } from "../../../../components/atoms/Text";

const ModalHeaderTitle = ({ onclose, title }) => {
  return (
    <View style={styles.headeView}>
      <TouchableOpacity
        style={{ flex: 0.1, padding: 3 }}
        onPress={() => onclose()}
      >
        <Image source={Images.close} style={{ width: 25, height: 25 }} />
      </TouchableOpacity>
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Heading variants="h4">{title}</Heading>
      </View>
      <View style={{ flex: 0.1 }} />
    </View>
  );
};

export default ModalHeaderTitle;

const styles = StyleSheet.create({
  headeView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
