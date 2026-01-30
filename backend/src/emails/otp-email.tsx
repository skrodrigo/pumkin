import { Html, Text, Button } from '@react-email/components';

export function OtpEmail(props: { code: string; appUrl: string }) {
  const { code, appUrl } = props;
  return (
    <Html lang="pt-BR">
      <Text>Seu código de verificação:</Text>
      <Text style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '2px' }}>{code}</Text>
      <Text>Esse código expira em 10 minutos.</Text>
      <Button href={appUrl}>Abrir o app</Button>
    </Html>
  );
}

export default OtpEmail;
