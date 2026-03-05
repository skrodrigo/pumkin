
import './../../global.css';

import { Stack } from 'expo-router';
import { useSegments, router } from 'expo-router'
import React from 'react'
import { AuthProvider, useAuth } from '../context/auth.context'

function AuthGate() {
  const segments = useSegments()
  const { isLoading, token } = useAuth()

  React.useEffect(() => {
    if (isLoading) return

    const pathname = `/${segments.join('/')}`
    const isAuthRoute = pathname === '/login' || pathname === '/otp'
    if (!token && !isAuthRoute) router.replace('/login')
    if (token && isAuthRoute) router.replace('/')
  }, [isLoading, segments, token])

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  )
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  )
}
