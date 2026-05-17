import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, Tabs } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, typography } from "../../constants/theme";

type TabRoute = { key: string; name: string };
type TabBarProps = {
  state: { routes: TabRoute[]; index: number };
  descriptors: Record<string, { options: { tabBarLabel?: string; title?: string } }>;
  navigation: { emit: (e: object) => { defaultPrevented: boolean }; navigate: (n: string) => void };
};
type IconName = React.ComponentProps<typeof Ionicons>["name"];

function getIcon(routeName: string, focused: boolean): IconName {
  if (routeName === "index")    return focused ? "list"         : "list-outline";
  if (routeName === "planner")  return focused ? "add-circle"   : "add-circle-outline";
  if (routeName === "insights") return focused ? "bar-chart"    : "bar-chart-outline";
  if (routeName === "profile")  return focused ? "person"       : "person-outline";
  return "ellipse-outline";
}

function getLabel(routeName: string, title?: string): string {
  if (title) return title;
  if (routeName === "index") return "List";
  return routeName.charAt(0).toUpperCase() + routeName.slice(1);
}

function TabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom + 10 }]}>
      <LinearGradient
        colors={["#008296", "#7BC9BE"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.pill}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const label = getLabel(route.name, options.title);
          const iconName = getIcon(route.name, isFocused);

          const onPress = () => {
            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={label}
            >
              {isFocused ? (
                <View style={styles.activeTab}>
                  <Ionicons name={iconName} size={20} color={colors.teal} />
                  <Text style={styles.activeLabel}>{label}</Text>
                </View>
              ) : (
                <View style={styles.inactiveTab}>
                  <Ionicons name={iconName} size={20} color={colors.white} />
                  <Text style={styles.inactiveLabel}>{label}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </LinearGradient>
    </View>
  );
}

export default function TabsLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index"    options={{ title: "List" }} />
      <Tabs.Screen name="planner"  options={{ title: "Planner" }} />
      <Tabs.Screen name="insights" options={{ title: "Insights" }} />
      <Tabs.Screen name="profile"  options={{ title: "Profile" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrapper: {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  alignItems: "center",
  paddingTop: 12,
  paddingBottom: 16,
},
  pill: {
    flexDirection: "row",
    borderRadius: radius.pill,
    paddingHorizontal: 3,
    paddingVertical: 3,
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
    alignItems: "center",
    gap: 2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 5,
    gap: 2,
    minWidth: 72,
  },
  activeLabel: {
    fontSize: 9,
    fontWeight: typography.semibold,
    color: colors.teal,
    letterSpacing: 0.3,
  },
  inactiveTab: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 2,
    minWidth: 60,
  },
  inactiveLabel: {
    fontSize: 9,
    fontWeight: typography.semibold,
    color: colors.white,
    letterSpacing: 0.3,
  },
});