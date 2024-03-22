import { Icon, useTheme } from "@ui-kitten/components";
import PropTypes from "prop-types";
import React from "react";
import { StyleSheet } from "react-native";
import { NormalisedSizes } from "../../../../hooks/Normalized";
import { Subtitle } from "../../../atoms/Text/index";
import { Block, Flex } from "../../../layouts/Index";
import StyledNavigationItem from "./NavigationItem.styles";

export const NavigationItem = ({ variants, name, iconName, ...props }) => {
  const theme = useTheme();

  return (
    <StyledNavigationItem variants={variants || "default"} {...props}>
      <Flex
        flexDirection="row"
        alignItems="center"
        style={styles.ContainerInside}
      >
        {iconName ? (
          <Block>
            <Icon
              style={styles.icon}
              fill={
                variants === "focused"
                  ? theme["color-primary-500"]
                  : theme["color-basic-600"]
              }
              name={iconName}
            />
          </Block>
        ) : null}
        <Block>
          <Subtitle
            style={
              variants === "focused"
                ? { color: theme["color-primary-500"] }
                : ""
            }
            variants="s1"
          >
            {name || ""}
          </Subtitle>
        </Block>
      </Flex>
    </StyledNavigationItem>
  );
};

NavigationItem.propTypes = {
  variants: PropTypes.oneOf(["focused", "default"]),
};

const styles = StyleSheet.create({
  ContainerInside: {
    margin: NormalisedSizes(20),
  },

  icon: {
    marginRight: NormalisedSizes(6),
    width: NormalisedSizes(24),
    height: NormalisedSizes(24),
  },
});
