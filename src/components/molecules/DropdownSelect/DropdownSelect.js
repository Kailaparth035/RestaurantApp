/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable react-native/no-raw-text */
/* eslint-disable arrow-body-style */

// import PropTypes from "prop-types";
import { Select, useTheme } from "@ui-kitten/components";
import nextFrame from "next-frame";
import { SelectItem } from "@ui-kitten/components";
import React, { useEffect, useRef, useState } from "react";

import { Text } from "react-native";

import { renderOption } from "../../atoms/SelectItem/SelectItem";
import { Paragraph } from "../../atoms/Text";
import { Box } from "../../layouts/Index";

function DropdownSelect({
  items,
  setContextState,
  siblingSelection,
  onSelectIndex,
  selectedIndex,
  selectedValue,
}) {
  const data = items || undefined;

  const selectRef = useRef();

  const theme = useTheme();

  const onSelect = async (index) => {
    onSelectIndex(index);
  };

  return (
    <Box>
      <Select
        placeholder={(TextProps) => {
          return (
            <Paragraph
              style={{
                flex: TextProps?.style?.flex,
                color: theme["color-basic-600"],
              }}
            >
              Select
            </Paragraph>
          );
        }}
        selectedIndex={selectedIndex}
        size="medium"
        value={(TextProps) => (
          <Paragraph
            style={{
              flex: TextProps?.style?.flex,
              color: theme["color-basic-600"],
            }}
          >
            {selectedValue !== undefined && selectedValue !== null && selectedValue !== ''
              ? selectedValue
              : "Select"}
          </Paragraph>
        )}
        onSelect={onSelect}
        ref={selectRef}
        disabled={!data}
      >
        {data &&
          data.map((d, index) => (
            <SelectItem
              title={(TextProps) => {
                return <Paragraph>{`${d?.name || d}`}</Paragraph>;
              }}
              key={index}
              disabled={!d}
            />
          ))}
      </Select>
    </Box>
  );
}

export default DropdownSelect;
