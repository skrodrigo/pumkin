import { Html, Text, Button } from '@react-email/components';

export function WelcomeEmail(props: { name: string; appUrl: string }) {
  const { name, appUrl } = props;
  return (
    <Html lang="pt-BR">
      <Text>Bem-vindo, {name}.</Text>
      <Text>Seu cadastro foi concluído. Confirme seu email para começar.</Text>
      <Button href={appUrl}>Abrir o app</Button>
    </Html>
  );
}

export default WelcomeEmail;
