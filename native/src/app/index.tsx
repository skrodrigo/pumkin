
import { useMemo } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

type ChatListItem = {
  id: string;
  title: string;
};

export default function ChatsScreen() {
  const chats = useMemo<ChatListItem[]>(() => {
    return [
      { id: '1', title: 'Untitled' },
      { id: '2', title: 'VPN and proxy differences' },
    ];
  }, []);

  return (
    <View className="flex-1 bg-neutral-950">
      <StatusBar style="light" />

      <View className="px-4 pt-14 pb-3 flex-row items-center justify-between">
        <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-neutral-900" onPress={() => {
          router.push('/settings');
        }}>
          <Ionicons name="menu" size={18} color="#e5e5e5" />
        </Pressable>

        <Pressable className="px-3 py-2 rounded-full bg-neutral-900 border border-neutral-800">
          <Text className="text-neutral-200 font-semibold">Sonnet 4.5</Text>
        </Pressable>

        <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-neutral-900">
          <Ionicons name="sparkles-outline" size={18} color="#e5e5e5" />
        </Pressable>
      </View>

      <View className="flex-1 px-4">
        <View className="mt-2 flex-row items-center justify-between rounded-full bg-neutral-900 border border-neutral-800 px-4 py-3">
          <Text className="text-neutral-400">Get more with Claude Pro</Text>
          <Pressable onPress={() => { }}>
            <Text className="text-blue-400 font-semibold">Upgrade</Text>
          </Pressable>
        </View>

        <View className="flex-1 items-center justify-center">
          <Text className="text-neutral-200 text-4xl font-semibold text-center">
            How can I help you
          </Text>
          <Text className="text-neutral-200 text-4xl font-semibold text-center">
            this afternoon?
          </Text>
        </View>

        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          className="hidden"
          renderItem={({ item }) => (
            <Pressable
              className="py-3"
              onPress={() => {
                router.push(`/chat/${item.id}`);
              }}
            >
              <Text className="text-neutral-200">{item.title}</Text>
            </Pressable>
          )}
        />
      </View>

      <View className="px-4 pb-6">
        <View className="flex-row items-center gap-3 rounded-2xl bg-neutral-900 border border-neutral-800 px-3 py-3">
          <Pressable className="h-10 w-10 items-center justify-center rounded-md bg-neutral-800">
            <Ionicons name="add" size={22} color="#e5e5e5" />
          </Pressable>

          <View className="flex-1">
            <TextInput
              className="text-neutral-200"
              placeholder="Chat with Claude"
              placeholderTextColor="#737373"
            />
          </View>

          <Pressable className="h-10 w-10 items-center justify-center rounded-md bg-neutral-800">
            <Ionicons name="mic" size={18} color="#e5e5e5" />
          </Pressable>
          <Pressable className="h-10 w-10 items-center justify-center rounded-md bg-neutral-800">
            <Ionicons name="options" size={18} color="#e5e5e5" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
