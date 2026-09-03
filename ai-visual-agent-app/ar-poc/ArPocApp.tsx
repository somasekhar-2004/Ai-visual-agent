import { StyleSheet, View } from "react-native";
import { ViroARSceneNavigator } from "@reactvision/react-viro";

import ArPocScene from "./ArPocScene";

/**
 * Phase A toolchain validation root - completely separate from the real app's App.tsx. Only
 * mounted when EXPO_PUBLIC_AR_POC=1 is set (see index.ts) - the normal app is untouched and
 * this has zero effect unless that flag is explicitly on for a dev-client test build.
 */
export default function ArPocApp() {
  return (
    <View style={styles.container}>
      <ViroARSceneNavigator style={styles.arNavigator} initialScene={{ scene: ArPocScene }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  arNavigator: { flex: 1 },
});
