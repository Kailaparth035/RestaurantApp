import { Icon, Input, Spinner, useTheme } from "@ui-kitten/components";
import { Formik } from "formik";
import React, { useState } from "react";
import { ScrollView, TouchableWithoutFeedback } from "react-native";
import { ButtonExtended } from "../../components/atoms/Button/Button";
import LogoUsaa from "../../components/atoms/Logo/LogoUsaa";
import { Heading, Label } from "../../components/atoms/Text/index";
import { Block, Box } from "../../components/layouts/Index";
import { NormalisedFonts, NormalisedSizes } from "../../hooks/Normalized";

export const UserPasscode = ({ navigation, route }) => {
  const theme = useTheme();
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const renderIcon = (props) => (
    <TouchableWithoutFeedback onPress={toggleSecureEntry}>
      <Icon {...props} name={secureTextEntry ? "eye-off" : "eye"} />
    </TouchableWithoutFeedback>
  );

  return (
    <ScrollView>
      <Box width="100%" height={NormalisedSizes(1013)}>
        <Box
          width={NormalisedSizes(496)}
          style={{
            marginTop: NormalisedSizes(87),
            marginRight: "auto",
            marginLeft: "auto",
          }}
        >
          <Block
            style={{
              marginRight: "auto",
              marginLeft: "auto",
              marginBottom: NormalisedSizes(48),
            }}
          >
            <LogoUsaa
              width={NormalisedSizes(353)}
              height={NormalisedSizes(131)}
            />
          </Block>
          <Block>
            <Formik
              initialValues={{ passcode: "" }}
              onSubmit={(values, actions) => {
                actions.setSubmitting(false);
                navigation.navigate("Admin Panel");
              }}
            >
              {(formikProps) => (
                <Box>
                  <Block>
                    <Block style={{ marginBottom: NormalisedSizes(18) }}>
                      <Label
                        variantStyle="uppercaseBold"
                        style={{
                          fontSize: NormalisedFonts(21),
                          lineHeight: NormalisedFonts(22),
                          color: theme["color-basic-600"],
                        }}
                      >
                        admin passcode
                      </Label>
                    </Block>

                    <Block style={{ marginBottom: NormalisedSizes(32) }}>
                      <Input
                        onChangeText={formikProps.handleChange("passcode")}
                        placeholder="*****"
                        size="large"
                        onBlur={formikProps.handleBlur("passcode")}
                        accessoryRight={renderIcon}
                        secureTextEntry={secureTextEntry}
                        textStyle={{
                          fontSize: NormalisedFonts(21),
                          lineHeight: NormalisedFonts(30),
                          fontWeight: "400",
                          fontFamily: "OpenSans-Regular",
                        }}
                      />
                      <Heading style={{ color: "red" }} variants="h6">
                        {formikProps.touched.passcode &&
                          formikProps.errors.passcode}
                      </Heading>
                    </Block>
                  </Block>

                  <Block>
                    {formikProps.isSubmitting ? (
                      <Spinner />
                    ) : (
                      <ButtonExtended
                        onPress={formikProps.handleSubmit}
                        status="primary"
                        size="giant"
                      >
                        <Label
                          buttonLabel="LabelGiantBtn"
                          variants="label"
                          variantStyle="uppercaseBold"
                        >
                          Submit
                        </Label>
                      </ButtonExtended>
                    )}
                  </Block>
                </Box>
              )}
            </Formik>
          </Block>
        </Box>
      </Box>
    </ScrollView>
  );
};
