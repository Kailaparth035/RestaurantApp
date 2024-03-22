import { Button } from "@ui-kitten/components";
import PropTypes from "prop-types";
import React from "react";
import { NormalisedSizes } from "../../../hooks/Normalized";

/**
 * @todo Change the way the margin vertical is managed to fix the offset of the label inside.
 *
 * @param {variants} variants can be default or tags.
 * @param {props} props as any extended props that can be share like
 * @exemple status || state ...
 *
 */
export function ButtonExtended({ variants, ...props }) {
  return (
    <Button variants={variants || "default"} {...props}>
      {(evaProps) =>
        React.Children.map(props.children, (child) => {
          return React.cloneElement(child, {
            style: {
              // FIXME: marginTop auto was to for
              // marginTop: "auto",
              color: evaProps.style.color,
              paddingBottom: "auto",
              marginHorizontal:
                variants === "tags" || variants === "keypad"
                  ? 0
                  : NormalisedSizes(evaProps.style.marginHorizontal),
            },
          });
        })
      }
    </Button>
  );
}

ButtonExtended.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]).isRequired,
  variants: PropTypes.oneOf(["tags", "keypad", "default"]),
};
