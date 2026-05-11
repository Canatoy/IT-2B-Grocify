import { StyleSheet, View } from "react-native";
import { colors } from "../../constants/theme";

export default function TabScreenBackground() {
  return (
    <>
      <View pointerEvents="none" style={styles.circleLeft} />
      <View pointerEvents="none" style={styles.circleRight} />
    </>
  );
}

const styles = StyleSheet.create({
  circleLeft: {
    position: "absolute",
    left: -96,
    top: -40,
    height: 256,
    width: 256,
    borderRadius: 128,
    backgroundColor: colors.tealLight,
    opacity: 0.3,
  },
  circleRight: {
    position: "absolute",
    right: -80,
    top: 80,
    height: 288,
    width: 288,
    borderRadius: 144,
    backgroundColor: colors.tealLight,
    opacity: 0.2,
  },
});