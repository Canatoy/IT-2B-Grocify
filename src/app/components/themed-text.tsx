import { Text, TextProps } from "react-native";

type ThemedTextProps = TextProps & {
  type?: "title" | "subtitle" | "default";
};

export function ThemedText({
  type = "default",
  style,
  ...props
}: ThemedTextProps) {
  let textStyle = {};

  if (type === "title") {
    textStyle = {
      fontSize: 24,
      fontWeight: "bold",
    };
  } else if (type === "subtitle") {
    textStyle = {
      fontSize: 18,
      fontWeight: "600",
    };
  } else {
    textStyle = {
      fontSize: 16,
    };
  }

  return <Text {...props} style={[textStyle, style]} />;
}
