import { BaseButton, Props } from "./ButtonBase";
import React, { FC } from "react";
import * as styles from "./styles";
import { cx } from "@emotion/css";

export const ButtonSecondary: FC<Props> = (props) => {
  const buttonStyle = cx(
    styles.buttonSecondary,
    {
      gray: props.variant === "gray",
      blueRounded: props.variant === "blueRounded",
      icon: props.variant === "icon",
    },
    props.className
  );
  return <BaseButton {...props} buttonStyle={buttonStyle} />;
};
