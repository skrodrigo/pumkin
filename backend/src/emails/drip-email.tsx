import { Html, Text, Button } from '@react-email/components';

export function DripEmail(props: { name: string; day: number; appUrl: string }) {
  const { name, day, appUrl } = props;

  const title = day === 2 ? 'Dicas para começar' : day === 5 ? 'Aproveite melhor o Nexus' : 'Último lembrete';

  return (
    <Html lang="pt-BR">
      <Text>Oi, {name}.</Text>
      <Text>{title}</Text>
      <Text>Se você ainda não assinou, dá pra fazer upgrade em segundos.</Text>
      <Button href={appUrl}>Ver planos</Button>
    </Html>
  );
}

export default DripEmail;
