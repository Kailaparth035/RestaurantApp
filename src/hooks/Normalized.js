import { Dimensions, PixelRatio } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen");

const layoutScale = (SCREEN_WIDTH * SCREEN_HEIGHT) / (1280 * 800);

export function NormalisedFonts(size) {
  const newSize = PixelRatio.getFontScale() * size * layoutScale;
  return PixelRatio.getPixelSizeForLayoutSize(newSize);
}

export function NormalisedSizes(size) {
  const newSizeLayout = size * layoutScale;
  return PixelRatio.getPixelSizeForLayoutSize(newSizeLayout);
}
