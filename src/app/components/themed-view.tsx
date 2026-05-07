import { View, ViewProps } from "react-native";

export function ThemedView(props: ViewProps) {
  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: "#fff", // default background
          flex: 1,
        },
        props.style,
      ]}
    />
  );
}
