import { Html, Text, Button } from '@react-email/components';

export function SubscriptionCanceledEmail(props: { name: string; appUrl: string }) {
  const { name, appUrl } = props;
  return (
    <Html lang="pt-BR">
      <Text>Oi, {name}.</Text>
      <Text>Sua assinatura foi cancelada. Se quiser voltar, você pode reativar a qualquer momento.</Text>
      <Button href={appUrl}>Reativar assinatura</Button>
    </Html>
  );
}

export default SubscriptionCanceledEmail;
