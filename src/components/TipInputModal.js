import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  Dimensions,
  ScrollView,
} from "react-native";
import { Heading, Subtitle } from "./atoms/Text";
import { Keypad } from "./organisms/NumericKeypad/NumericKeypad";
import { Flex } from "./layouts/flex";
import { Block } from "./layouts/block";
import { Button, Input, Modal } from "@ui-kitten/components";
import { NormalisedFonts } from "../../src/hooks/Normalized";
import { Box } from "./layouts/BoxContainer";
import { ConfirmationModal } from "./organisms/ConfirmationModal";
import { WriteLog } from "../../src/CommonLogFile";

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get("screen");

function TipInputModal(props) {
  const [tipInCents, setTipInCents] = React.useState(0);
  const [visible, setVisible] = React.useState(false);

  const handleInputChange = (text) => {
    let onlyNumbers = text.replace(/[^0-9]/g, "");

    // Convert the input to cents
    const newTipInCents = parseInt(onlyNumbers, 10);
    if (!isNaN(newTipInCents)) {
      setTipInCents(newTipInCents);
    }
    WriteLog("TipInputeModal" + { newTipInCents });
    console.log({ newTipInCents });
  };

  const handleNumPad = () => {
    if (tipInCents > 0) {
      props.setCustomTip(tipInCents / 100);
    } else {
      alert("Please enter a tip");
    }
  };
  const displayTip = `$${(tipInCents / 100).toFixed(2)}`;
  return (
    props.showCustomTip && (
      <>
        <Modal
          visible={props.showCustomTip}
          transparent
          backdropStyle={styles.backdrop}
        >
          <Box level="1" width="50%" height="60%" style={styles.prompt}>
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
            >
              <Flex style={styles.validateFlex}>
                <Block style={styles.heading}>
                  <Heading variants="h2">Enter a Custom Tip</Heading>
                </Block>
                <Input
                  keyboardType="numeric"
                  disableFullscreenUI
                  autoFocus
                  value={displayTip}
                  onChangeText={handleInputChange}
                  placeholder="$0.00"
                  size="large"
                  textStyle={{
                    fontSize: NormalisedFonts(21),
                    lineHeight: NormalisedFonts(30),
                    fontWeight: "400",
                    width: "50%",
                    fontFamily: "OpenSans-Regular",
                  }}
                />
              </Flex>

              <Flex>
                <Button
                  title="Confirm"
                  status="primary"
                  size="giant"
                  onPress={() => {
                    if (tipInCents >= props.subtotal_after_tokens / 2) {
                      setVisible(true);
                    } else {
                      handleNumPad();
                    }
                  }}
                  style={{ marginTop: 10 }}
                >
                  Add Custom Tip
                </Button>
              </Flex>
              <Flex>
                <Button
                  title="Cancel"
                  status="tertiary"
                  size="giant"
                  onPress={() => {
                    props.closeModal();
                    setTipInCents(0);
                    props.setCustomTip(0);
                  }}
                  style={{ marginTop: 10 }}
                >
                  Cancel
                </Button>
              </Flex>
            </ScrollView>
          </Box>
        </Modal>
        <ConfirmationModal
          visible={visible}
          setVisible={() => setVisible(false)}
          fromOverflow={false}
          customTip={displayTip}
          handleNumPad={() => handleNumPad()}
        />
      </>
    )
  );
}
export default TipInputModal;

const styles = StyleSheet.create({
  calcWrapper: {
    height: "100%",
    paddingLeft: 30,
    paddingRight: 30,
    width: SCREEN_WIDTH - 100,
    // borderWidth: 2
  },
  heading: {
    marginVertical: 20,
  },
  prompt: {
    height: "100%",
    width: "100%",
    alignItems: "center",
    alignSelf: "center",
    // marginTop: 120,
    // flex: 1,
    padding: 30,
    paddingBottom: 50,
    borderWidth: 1,
    borderColor: "grey",
    borderRadius: 5,
  },
  validateFlex: {
    alignItems: "center",
    padding: 10,
    flexDirection: "column",
    marginVertical: 20,
    width: "100%",
    alignSelf: "center",
  },
  backdrop: {
    backgroundColor: "rgba(0,0,0,0.35)",
  },
});
