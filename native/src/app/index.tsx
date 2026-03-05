
import Ionicons from '@expo/vector-icons/Ionicons'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import React from 'react'
import { FlatList, Pressable, Text, View } from 'react-native'
import { useAuth } from '../context/auth.context'
import { chatsService, type ChatListItem } from '../data/chats'
import { subscriptionService } from '../data/subscription'

export default function ChatsScreen() {
  const { token, logout } = useAuth()
  const [chats, setChats] = React.useState<ChatListItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isPro, setIsPro] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    let isMounted = true
      ; (async () => {
        if (!token) return
        try {
          const [chatsRes, sub] = await Promise.all([
            chatsService.list({ token }),
            subscriptionService.get({ token }),
          ])
          if (!isMounted) return
          setChats(Array.isArray(chatsRes?.data) ? chatsRes.data : [])
          setIsPro(sub?.status === 'active' || sub?.status === 'trialing')
        } finally {
          if (isMounted) setIsLoading(false)
        }
      })()
    return () => {
      isMounted = false
    }
  }, [token])

  return (
    <View className="flex-1 bg-neutral-950">
      <StatusBar style="light" />

      <View className="px-4 pt-14 pb-3 flex-row items-center justify-between">
        <Pressable
          className="h-10 w-10 items-center justify-center rounded-full bg-neutral-900"
          onPress={() => {
            router.push('/settings')
          }}
        >
          <Ionicons name="menu" size={18} color="#e5e5e5" />
        </Pressable>

        <Pressable className="px-3 py-2 rounded-full bg-neutral-900 border border-neutral-800">
          <Text className="text-neutral-200 font-semibold">Pumkin</Text>
        </Pressable>

        <Pressable
          className="h-10 w-10 items-center justify-center rounded-full bg-neutral-900"
          onPress={() => {
            void logout()
          }}
        >
          <Ionicons name="log-out-outline" size={18} color="#e5e5e5" />
        </Pressable>
      </View>

      <View className="flex-1 px-4">
        {isPro === false ? (
          <View className="mt-2 flex-row items-center justify-between rounded-full bg-neutral-900 border border-neutral-800 px-4 py-3">
            <Text className="text-neutral-400">Get more with Pro</Text>
            <Pressable
              onPress={() => {
                router.push('/upgrade')
              }}
            >
              <Text className="text-amber-400 font-semibold">Upgrade</Text>
            </Pressable>
          </View>
        ) : null}

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-neutral-400">Carregando...</Text>
          </View>
        ) : (
          <FlatList
            data={chats}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                className="py-3 border-b border-neutral-900"
                onPress={() => {
                  router.push(`/chat/${item.id}`)
                }}
              >
                <Text className="text-neutral-200 font-medium">{item.title}</Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center pt-24">
                <Text className="text-neutral-200 text-3xl font-semibold text-center">
                  Como posso ajudar?
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  )
}
