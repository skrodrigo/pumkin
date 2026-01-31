import { Html, Head, Preview, Tailwind, Body, Container, Section, Text, Button, Hr } from '@react-email/components';
import { emailTailwindConfig } from './tailwind.js';

export function WelcomeEmail(props: { name: string; appUrl: string }) {
  const { name, appUrl } = props;
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Bem-vindo ao Nexus, {name}. Vamos começar?</Preview>
      <Tailwind config={emailTailwindConfig}>
        <Body className="m-0 py-6 font-sans">
          <Container className="mx-auto max-w-[560px] px-[14px]">
            <Section className="rounded-md border border-white/10 bg-panel px-5 py-5">
              <Text className="m-0 text-xs tracking-[2.5px] text-brand">NEXUS</Text>
              <Text className="mt-2 mb-0 text-2xl leading-[30px] text-text">Bem-vindo, {name}.</Text>
              <Text className="mt-2 mb-0 text-sm leading-5 text-muted">
                Sua conta está pronta. Agora é a parte boa: <span className="text-text">entrar, perguntar e produzir</span>.
              </Text>
              <Text className="mt-2 mb-0 text-sm leading-5 text-muted">
                Dica rápida: comece com um objetivo claro (ex.: “me ajude a planejar minha semana”) e deixe o Nexus quebrar em passos.
              </Text>

              <Button
                href={appUrl}
                className="mt-4 block rounded-full bg-brand px-5 py-3 text-center font-semibold text-[#0B0F0E] no-underline"
              >
                Abrir o Nexus
              </Button>

              <Hr className="my-5 border-0 border-t border-white/10" />

              <Text className="m-0 text-xs leading-[18px] text-muted">
                Você não precisa ser perfeito. Só precisa começar.
              </Text>
            </Section>
            <Text className="mt-3 mb-0 text-center text-xs leading-[18px] text-[#8E8E8E]">
              Feito para pessoas que querem clareza, foco e resultado.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default WelcomeEmail;
