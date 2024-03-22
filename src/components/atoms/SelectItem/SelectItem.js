/* eslint-disable import/newline-after-import */
/* eslint-disable no-unused-vars */
import { SelectItem } from "@ui-kitten/components";
import React from "react";
import { Paragraph } from "../Text/index";
export const renderOption = (data, index) => (
  <SelectItem
    title={(TextProps) => <Paragraph>{data.name}</Paragraph>}
    key={index}
    disabled={!data}
  />
);

export default SelectItem;
