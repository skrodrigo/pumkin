import { Html, Head, Preview, Tailwind, Body, Container, Section, Text, Button, Hr } from '@react-email/components';
import { emailTailwindConfig } from './tailwind.js';

export function SubscriptionCanceledEmail(props: { name: string; appUrl: string }) {
  const { name, appUrl } = props;
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Você pode voltar quando quiser — e leva 30s.</Preview>
      <Tailwind config={emailTailwindConfig}>
        <Body className="m-0 py-6 font-sans">
          <Container className="mx-auto max-w-[560px] px-[14px]">
            <Section className="rounded-md border border-white/10 bg-panel px-5 py-5">
              <Text className="m-0 text-xs tracking-[2.5px] text-brand">PUMKIN</Text>
              <Text className="mt-2 mb-0 text-[22px] leading-7 text-text">
                Pausa feita. Progresso não precisa parar.
              </Text>
              <Text className="mt-2 mb-0 text-sm leading-5 text-muted">Oi, {name}.</Text>
              <Text className="mt-2 mb-0 text-sm leading-5 text-muted">
                Sua assinatura foi cancelada. Sem drama: acontece. O que importa é que quando você quiser voltar, está tudo aqui — histórico,
                contexto e seu ritmo.
              </Text>

              <Section className="mt-4 rounded-md border border-highlight/40 px-4 py-4">
                <Text className="m-0 text-xs tracking-[1.6px] uppercase text-highlight">Por que voltar?</Text>
                <Text className="mt-2 mb-0 text-[13px] leading-[18px] text-text">- Respostas mais completas e rápidas</Text>
                <Text className="mt-2 mb-0 text-[13px] leading-[18px] text-text">- Mais histórico e continuidade nas conversas</Text>
                <Text className="mt-2 mb-0 text-[13px] leading-[18px] text-text">- Menos fricção para transformar ideia em ação</Text>
              </Section>

              <Button
                href={appUrl}
                className="mt-4 block rounded-full bg-brand px-5 py-3 text-center font-semibold text-[#0B0F0E] no-underline"
              >
                Reativar agora
              </Button>

              <Hr className="my-5 border-0 border-t border-white/10" />

              <Text className="m-0 text-xs leading-[18px] text-muted">
                Se essa mudança foi um engano, você pode reativar em segundos.
              </Text>
            </Section>

            <Text className="mt-3 mb-0 text-center text-xs leading-[18px] text-[#8E8E8E]">
              Pumkin — foco, clareza e execução.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default SubscriptionCanceledEmail;
