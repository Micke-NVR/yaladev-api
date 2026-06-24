const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Esto es lo que obliga a Expo a inyectar Tailwind en Android/iOS
module.exports = withNativeWind(config, { input: "./src/global.css" });