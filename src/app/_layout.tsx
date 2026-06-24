import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
  return (
    <Stack>
      {/* Apuntamos a 'index' y ocultamos el header por defecto para diseñar a nuestro gusto */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}