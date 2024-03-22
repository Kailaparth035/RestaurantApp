import { Input, useTheme } from "@ui-kitten/components";
import { Formik } from "formik";
import React from "react";
import { StyleSheet } from "react-native";
import * as yup from "yup";
import { NormalisedFonts, NormalisedSizes } from "../../../../hooks/Normalized";
import { ButtonExtended } from "../../../atoms/Button/Button";
import { Label } from "../../../atoms/Text/index";
import { Block, Box, Flex } from "../../../layouts/Index";

const styles = StyleSheet.create({
  GapBetweenInputs: {
    marginRight: NormalisedSizes(26),
  },
  GapBetweenInputLabel: {
    marginBottom: NormalisedSizes(18),
  },
});

export const Filter = (props) => {
  const theme = useTheme();

  const validationSchema = yup.object().shape({
    username: yup.string(),
    status: yup.string(),
    payment: yup.string(),
  });

  return (
    <Box width="100%">
      <Formik
        initialValues={{ username: "", status: "", payment: "" }}
        onSubmit={(values, actions) => {
          actions.setSubmitting(false);
        }}
        validationSchema={validationSchema}
      >
        {(formikProps) => (
          <Flex flexDirection="row" alignItems="stretch">
            <Block width="25%" style={styles.GapBetweenInputs}>
              <Block style={styles.GapBetweenInputLabel}>
                <Label
                  variantStyle="uppercaseBold"
                  style={{
                    fontSize: NormalisedFonts(21),
                    lineHeight: NormalisedFonts(22),
                    color: theme["color-basic-600"],
                  }}
                >
                  username
                </Label>
              </Block>
              <Block>
                <Input
                  onChangeText={formikProps.handleChange("username")}
                  placeholder="Username"
                  size="large"
                  onBlur={formikProps.handleBlur("username")}
                  textStyle={{
                    fontSize: NormalisedFonts(21),
                    lineHeight: NormalisedFonts(30),
                    fontWeight: "400",
                    fontFamily: "OpenSans-Regular",
                  }}
                />
              </Block>
            </Block>

            <Block width="25%" style={styles.GapBetweenInputs}>
              <Block style={styles.GapBetweenInputLabel}>
                <Label
                  variantStyle="uppercaseBold"
                  style={{
                    fontSize: NormalisedFonts(21),
                    lineHeight: NormalisedFonts(22),
                    color: theme["color-basic-600"],
                  }}
                >
                  status
                </Label>
              </Block>
              <Block>
                <Input
                  onChangeText={formikProps.handleChange("status")}
                  placeholder="Status"
                  size="large"
                  onBlur={formikProps.handleBlur("status")}
                  textStyle={{
                    fontSize: NormalisedFonts(21),
                    lineHeight: NormalisedFonts(30),
                    fontWeight: "400",
                    fontFamily: "OpenSans-Regular",
                  }}
                />
              </Block>
            </Block>

            <Block width="25%" style={styles.GapBetweenInputs}>
              <Block style={styles.GapBetweenInputLabel}>
                <Label
                  variantStyle="uppercaseBold"
                  style={{
                    fontSize: NormalisedFonts(21),
                    lineHeight: NormalisedFonts(22),
                    color: theme["color-basic-600"],
                  }}
                >
                  payment
                </Label>
              </Block>
              <Block>
                <Input
                  onChangeText={formikProps.handleChange("payment")}
                  placeholder="Payment"
                  size="large"
                  onBlur={formikProps.handleBlur("payment")}
                  textStyle={{
                    fontSize: NormalisedFonts(21),
                    lineHeight: NormalisedFonts(30),
                    fontWeight: "400",
                    fontFamily: "OpenSans-Regular",
                  }}
                />
              </Block>
            </Block>

            <Block alignSelf="flex-end">
              <ButtonExtended
                onPress={formikProps.handleSubmit}
                status="primary"
                size="large"
              >
                <Label
                  buttonLabel="LabelLargeBtn"
                  variants="label"
                  variantStyle="uppercaseBold"
                >
                  search
                </Label>
              </ButtonExtended>
            </Block>
          </Flex>
        )}
      </Formik>
    </Box>
  );
};
