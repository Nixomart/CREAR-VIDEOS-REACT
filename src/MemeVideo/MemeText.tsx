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
    padding: "12px 24px", // Más padding vertical, menos horizontal
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
const getTextStyle = (
  index: number,
  customStyle?: "facebook" | "tiktok" | "contrast" | number,
): TextStyle => {
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

  // Calcular información de cada caption para posicionamiento dinámico
  const captionInfo = captions.map((caption, index) => {
    const fittedText = fitText({
      fontFamily,
      text: caption.text,
      withinWidth: 1000, // Ancho máximo para textos largos
      textTransform: "uppercase",
    });

    const fontSize = Math.min(
      DESIRED_FONT_SIZE,
      fittedText.fontSize + captions.length >= 1 ? 60 : 20,
    );
    const textStyle = getTextStyle(index, caption.style || defaultStyle);

    // Calcular altura aproximada del texto basada en el fontSize y número de líneas
    const lineHeight =  1.1;
    const estimatedLines = Math.ceil(
      caption.text.length / (1000 / (fontSize * 0.6)),
    ); // Estimación rough
    const textHeight = fontSize * lineHeight * estimatedLines;

    // Agregar padding extra si tiene backgroundColor (estilo Facebook)
    const extraHeight = textStyle.backgroundColor ? 0 : 16; // 16px de padding + margen extra

    return {
      caption,
      fontSize,
      textStyle,
      height: textHeight + extraHeight,
    };
  });

  // Detectar si todos los textos usan estilo Facebook
  const allFacebookStyle = captionInfo.every(
    (info) => info.textStyle.backgroundColor === "white",
  );

  // Calcular posiciones Y dinámicamente
  let currentY = position ? position.y : 0;
  const positions = captionInfo.map((info, index) => {
    if (index === 0) {
      // El primer elemento se centra en la posición original
      const y = position
        ? /* allFacebookStyle  ?  currentY -
          getTotalHeight(captionInfo, allFacebookStyle) / 2 +
          info.height / 2 - 150 : */ currentY -
          getTotalHeight(captionInfo, allFacebookStyle) / 2 +
          info.height / 2 
        : currentY;
      currentY = y + info.height / 2;
      return y;
    } else {
      // Los siguientes elementos se posicionan después del anterior
      // Si es estilo Facebook, reducir el gap a 2px para que el fondo sea continuo
      const gap = allFacebookStyle ? -50 : 20;
      const y =
        currentY + captionInfo[index - 1].height / 2 + info.height / 2 + gap;
      currentY =  y;
      return y;
    }
  });

  return (
    <AbsoluteFill style={position ? {} : containerStyle}>
      {captionInfo.map((info, index) => {
        // Configuraciones específicas para estilo Facebook
        const isFacebookStyle = info.textStyle.backgroundColor === "white";
        const maxWidth = isFacebookStyle ? "1200px" : "1000px"; // Más ancho para Facebook

        return (
          <div
            key={index}
            style={{
              fontSize: info.fontSize,
              fontFamily,
              textTransform: "uppercase",
              textAlign: "center",
              lineHeight: 1.1,
              fontWeight: "bold",
              paintOrder: "stroke",
              maxWidth,
              width: isFacebookStyle ? "900px" : undefined, // Auto width para Facebook
              ...(position
                ? {
                    position: "absolute",
                    left: position.x,
                    top: positions[index],
                    transform: "translate(-50%, -50%)",
                  }
                : {}),
              ...info.textStyle,
            }}
          >
            {info.caption.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Función auxiliar para calcular la altura total de todos los textos
function getTotalHeight(
  captionInfo: Array<{ height: number }>,
  isFacebookStyle: boolean = false,
): number {
  const totalTextHeight = captionInfo.reduce(
    (sum, info) => sum + info.height,
    0,
  );
  const gap = isFacebookStyle ? 2 : 20; // Gap más pequeño para Facebook
  const gaps = Math.max(0, captionInfo.length - 1) * gap;
  return totalTextHeight + gaps;
}
