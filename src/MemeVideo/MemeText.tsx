import React from "react";
import { AbsoluteFill } from "remotion";
import { TheBoldFont } from "../load-font";
import { fitText } from "@remotion/layout-utils";
import { MemeCaption } from "./index";

const fontFamily = TheBoldFont;

const container: React.CSSProperties = {
  justifyContent: "center",
  alignItems: "center", // Cambiar de flex-start a center para centrar
  display: "flex",
  flexDirection: "column",
  gap: 50, // Aumentar gap de 40 a 50 por el texto más grande
  padding: 40,
};

const DESIRED_FONT_SIZE = 200; // Aumentado de 80 a 120

// Diferentes estilos de texto para variar los videos
type TextStyle = {
  color: string;
  WebkitTextStroke?: string;
  backgroundColor?: string;
  padding?: string;
  borderRadius?: string;
};

const textStyles: TextStyle[] = [
  // Estilo 1: Texto negro con fondo blanco (Facebook style)
  {
    color: "black",
    backgroundColor: "white",
    padding: "8px 16px",
    borderRadius: "8px",
  },
  // Estilo 2: Texto amarillo con borde negro (TikTok style)
  {
    color: "yellow",
    WebkitTextStroke: "8px black",
  },
  // Estilo 3: Texto negro con borde blanco
  {
    color: "black",
    WebkitTextStroke: "8px white",
  },
];

// Función para seleccionar un estilo basado en el índice del caption o estilo especificado
const getTextStyle = (index: number, customStyle?: "facebook" | "tiktok" | "contrast" | number): TextStyle => {
  if (typeof customStyle === "number") {
    return textStyles[customStyle % textStyles.length];
  }
  
  if (typeof customStyle === "string") {
    switch (customStyle) {
      case "facebook":
        return textStyles[0]; // Texto negro con fondo blanco
      case "tiktok":
        return textStyles[1]; // Texto amarillo con borde negro
      case "contrast":
        return textStyles[2]; // Texto negro con borde blanco
      default:
        return textStyles[index % textStyles.length];
    }
  }
  
  return textStyles[index % textStyles.length];
};

export const MemeText: React.FC<{
  captions: MemeCaption[];
  defaultStyle?: "facebook" | "tiktok" | "contrast" | number;
  position?: { x: number; y: number };
}> = ({ captions, defaultStyle, position }) => {
  // Crear el estilo del contenedor basado en si hay posición personalizada
  const containerStyle: React.CSSProperties = position 
    ? {
        position: "absolute",
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -50%)", // Centrar el texto en las coordenadas
      }
    : container;

  return (
    <AbsoluteFill style={position ? {} : containerStyle}>
      {captions.map((caption, index) => {
        const fittedText = fitText({
          fontFamily,
          text: caption.text,
          withinWidth: 1000, // Aumentado de 900 a 1000 para textos más largos
          textTransform: "uppercase",
        });

        const fontSize = Math.min(DESIRED_FONT_SIZE, fittedText.fontSize + 20);
        const textStyle = getTextStyle(index, caption.style || defaultStyle);

        return (
          <div
            key={index}
            style={{
              fontSize,
              fontFamily,
              textTransform: "uppercase",
              textAlign: "center", // Cambiar a centrado
              lineHeight: 1.1,
              fontWeight: "bold",
              paintOrder: "stroke",
              maxWidth: "1000px", // Ancho máximo para textos largos
              ...(position ? {
                position: "absolute",
                left: position.x,
                top: position.y + (index * 80), // Aumentar espaciado de 60 a 80px por el texto más grande
                transform: "translate(-50%, -50%)",
              } : {}),
              ...textStyle, // Aplicar el estilo dinámico
            }}
          >
            {caption.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
