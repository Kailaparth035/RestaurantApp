import React, { useEffect } from "react";
import { Text, View, StyleSheet, Image } from "react-native";
import { Heading } from "../../components/atoms/Text";
import Images from "../../Images";
import { useNavigation } from "@react-navigation/native";
import Sound from 'react-native-sound';
import { onSuccess, onError } from '../../Sound'
import { useTheme } from "@ui-kitten/components";

const TokenRedeemSuccessFail = (props) => {
  const navigation = useNavigation();
  const status = props?.route?.params?.status;
  const message = props?.route?.params?.message;
  const currentTokenBalance = props?.route?.params?.currentTokenBalance;

  const theme = useTheme();

  const formatTokensBalanceDisplay = (currentTokenBalance) => {
    if (Object.keys(currentTokenBalance).length > 0) {
      return (
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
          <View>
            {Object.keys(currentTokenBalance).map((t) => {
              const token = currentTokenBalance[t];
              return (
                <Heading variants="h2" style={{ color: '#ffffff' }}>{` ${token?.redeemable_token_name || t
                  } - ${token.balance}`}</Heading>
              );
            })}
          </View>
        </View>
      );
    }
    return null;
  };

  useEffect(() => {
    Sound.setCategory('Playback');
    soundPlay();
    if (status == "success") {
      setTimeout(() => {
        navigation.navigate("ScaningScreen",{screenName: props?.route?.params?.screenName});
      }, 2000);
    }
  }, [props?.route?.params]);


  const soundPlay = () => {
    let soundPlay = status == "success" ? onSuccess : onError;
    const sound = new Sound(soundPlay, (error) => {
      if (error) {
        console.log('Failed to load sound', error);
        return;
      }
      // Play the sound
      sound.play((success) => {
        if (success) {
          console.log('Sound played successfully');
        } else {
          console.log('Playback failed due to audio decoding errors');
        }
      });
    });
  }

  return (
    <View style={[styles.container, { backgroundColor: status == "success" ? "#63ba3c" : theme["color-primary-default"] }]}>
      <Heading variants="h2" style={{ color: '#ffffff' }}>
        {message}
      </Heading>
      {currentTokenBalance &&
        <View variants="h2" style={{ marginTop: 10, marginBottom: 50 }}>
          {formatTokensBalanceDisplay(currentTokenBalance)}
        </View>
      }
      <Image
        source={
          status == "success" ? Images.checkmark_full_circle : Images.failed_circle
        }
        style={[
          styles.imageStyle,
          {
            tintColor: "#ffffff"
          },
        ]}
      />
    </View>
  );
};

export default TokenRedeemSuccessFail;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  imageStyle: {
    width: 150,
    height: 150,
  },
});