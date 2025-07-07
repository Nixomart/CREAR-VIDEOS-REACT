import React from "react";
import { AbsoluteFill } from "remotion";
import { TheBoldFont } from "../load-font";
import { fitText } from "@remotion/layout-utils";
import { MemeCaption } from "./index";

const fontFamily = TheBoldFont;

const container: React.CSSProperties = {
  justifyContent: "center",
  alignItems: "center",
  display: "flex",
  flexDirection: "column",
  gap: 40,
  padding: 40,
};

const DESIRED_FONT_SIZE = 80;

export const MemeText: React.FC<{
  captions: MemeCaption[];
}> = ({ captions }) => {
  return (
    <AbsoluteFill style={container}>
      {captions.map((caption, index) => {
        const fittedText = fitText({
          fontFamily,
          text: caption.text,
          withinWidth: 900, // Ancho máximo para el texto
          textTransform: "uppercase",
        });

        const fontSize = Math.min(DESIRED_FONT_SIZE, fittedText.fontSize);

        return (
          <div
            key={index}
            style={{
              fontSize,
              color: "white",
              WebkitTextStroke: "6px black",
              paintOrder: "stroke",
              fontFamily,
              textTransform: "uppercase",
              textAlign: "center",
              lineHeight: 1.1,
              fontWeight: "bold",
            }}
          >
            {caption.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
