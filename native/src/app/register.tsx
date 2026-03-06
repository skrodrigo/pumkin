import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  TextInput,
  Text,
  StyleSheet,
} from 'react-native';
import { toast } from 'sonner-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const SafeAreaViewAny = SafeAreaView as any;
const KeyboardAvoidingViewAny = KeyboardAvoidingView as any;
const ViewAny = View as any;
const ImageAny = Image as any;
const TextAny = Text as any;
const TextInputAny = TextInput as any;
const TouchableOpacityAny = TouchableOpacity as any;
const ActivityIndicatorAny = ActivityIndicator as any;

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error('Dados inválidos', {
        description: 'Informe e-mail e senha para continuar.',
      });
      return;
    }

    setLoading(true);
    try {
      toast.success('Conta criada', {
        description: 'Agora você pode entrar com seu e-mail e senha.',
      });
      router.replace('/login');
    } catch (error: any) {
      const rawMessage = error?.response?.data?.message;
      const errorMessage =
        typeof rawMessage === 'string'
          ? rawMessage
          : 'Ocorreu um erro inesperado.';

      toast.error('Falha no Cadastro', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaViewAny style={styles.container}>
      <KeyboardAvoidingViewAny
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <ViewAny style={styles.content}>
          <ImageAny source={require('../../assets/logo.png')} style={styles.logo} />
          <TextAny style={styles.title}>Criar conta</TextAny>

          <TextInputAny
            style={styles.input}
            placeholder="seuemail@gmail.com"
            placeholderTextColor="#A3A3A3"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInputAny
            style={styles.input}
            placeholder="********"
            placeholderTextColor="#A3A3A3"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacityAny style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicatorAny color="#fff" />
            ) : (
              <TextAny style={styles.buttonText}>Criar Conta</TextAny>
            )}
          </TouchableOpacityAny>

          <ViewAny style={styles.footer}>
            <TextAny style={styles.footerText}>Já tem conta? </TextAny>
            <TouchableOpacityAny onPress={() => router.push('/login')}>
              <TextAny style={styles.link}>Entrar</TextAny>
            </TouchableOpacityAny>
          </ViewAny>
        </ViewAny>
      </KeyboardAvoidingViewAny>
    </SafeAreaViewAny>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 40,
    borderRadius: 10,
  },
  title: {
    fontSize: 32,
    marginBottom: 40,
    color: '#1f2937',
  },
  input: {
    width: '100%',
    backgroundColor: '#E5E5E5',
    color: '#1f2937',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    width: '100%',
    backgroundColor: '#18C260',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
  },
  footerText: {
    color: '#A3A3A3',
    fontSize: 14,
  },
  link: {
    color: '#18C260',
  },
});
