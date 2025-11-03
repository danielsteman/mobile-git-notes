import { View, Text, Switch } from "react-native";
import { useState } from "react";

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [analytics, setAnalytics] = useState(false);

  return (
    <View className="flex-1 justify-center p-4">
      <View className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <Text className="text-2xl font-bold">Settings</Text>

        <View className="mt-4 h-px bg-neutral-200 dark:bg-neutral-800" />

        <View className="mt-4 flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-base font-medium">Notifications</Text>
            <Text className="text-sm text-neutral-600 dark:text-neutral-400">
              Receive reminders and updates
            </Text>
          </View>
          <Switch value={notifications} onValueChange={setNotifications} />
        </View>

        <View className="mt-4 h-px bg-neutral-200 dark:bg-neutral-800" />

        <View className="mt-4 flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-base font-medium">Analytics</Text>
            <Text className="text-sm text-neutral-600 dark:text-neutral-400">
              Help improve the app by sharing usage
            </Text>
          </View>
          <Switch value={analytics} onValueChange={setAnalytics} />
        </View>
      </View>
    </View>
  );
}
