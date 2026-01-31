import { Html, Head, Preview, Tailwind, Body, Container, Section, Text, Button, Hr } from '@react-email/components';
import { emailTailwindConfig } from './tailwind.js';

export function DripEmail(props: { name: string; day: number; appUrl: string }) {
  const { name, day, appUrl } = props;

  const title =
    day === 2
      ? 'Você já pode destravar resultados (em 2 minutos)'
      : day === 5
        ? 'Seu cérebro ama clareza. Vamos voltar pro jogo.'
        : 'Último lembrete (sem pressão): isso aqui pode te poupar horas';

  const preview =
    day === 2
      ? '3 prompts prontos para começar hoje'
      : day === 5
        ? 'Um jeito simples de transformar ideia em tarefa'
        : 'Se você quiser voltar, a porta está aberta';

  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind config={emailTailwindConfig}>
        <Body className="m-0 py-6 font-sans">
          <Container className="mx-auto max-w-[560px] px-[14px]">
            <Section className="rounded-md border border-white/10 bg-panel px-5 py-5">
              <Text className="m-0 text-xs tracking-[2.5px] text-brand">NEXUS</Text>
              <Text className="mt-2 mb-0 text-[22px] leading-7 text-text">{title}</Text>
              <Text className="mt-2 mb-0 text-sm leading-5 text-muted">Oi, {name}.</Text>

              {day === 2 ? (
                <>
                  <Text className="mt-2 mb-0 text-sm leading-5 text-muted">
                    Você não precisa “ter tempo”. Precisa de um ponto de partida. Aqui vão 3 prompts que funcionam:
                  </Text>
                  <Section className="mt-3 rounded-md border border-brand2/40 px-4 py-4">
                    <Text className="m-0 text-[13px] leading-[18px] text-text">1) “Me ajude a planejar minha semana com prioridades.”</Text>
                    <Text className="mt-2 mb-0 text-[13px] leading-[18px] text-text">2) “Resuma este texto e me diga o que fazer com ele.”</Text>
                    <Text className="mt-2 mb-0 text-[13px] leading-[18px] text-text">3) “Crie um checklist para eu executar isso hoje.”</Text>
                  </Section>
                </>
              ) : day === 5 ? (
                <Text className="mt-2 mb-0 text-sm leading-5 text-muted">
                  A diferença entre “ideia” e “resultado” é <span className="text-text">execução guiada</span>. No Pro você mantém contexto,
                  ganha mais histórico e transforma conversa em ação mais rápido.
                </Text>
              ) : (
                <Text className="mt-2 mb-0 text-sm leading-5 text-muted">
                  Último lembrete: se fizer sentido, você pode fazer upgrade e voltar quando quiser. Sem burocracia.
                </Text>
              )}

              <Button
                href={appUrl}
                className="mt-4 block rounded-full bg-brand px-5 py-3 text-center font-semibold text-[#0B0F0E] no-underline"
              >
                Ver planos e fazer upgrade
              </Button>

              <Hr className="my-5 border-0 border-t border-white/10" />

              <Text className="m-0 text-xs leading-[18px] text-muted">
                Se você já assinou, ignora esta mensagem — e obrigado por apoiar o Nexus.
              </Text>
            </Section>

            <Text className="mt-3 mb-0 text-center text-xs leading-[18px] text-[#8E8E8E]">
              Nexus — menos ruído, mais entrega.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default DripEmail;
