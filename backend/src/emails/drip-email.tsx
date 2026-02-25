import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
  Hr,
} from '@react-email/components';

interface DripEmailProps {
  name: string;
  day: number;
  appUrl: string;
}

export function DripEmail(props: DripEmailProps) {
  const { name, day, appUrl } = props;

  const title =
    day === 2
      ? 'Você já pode destravar resultados'
      : day === 5
        ? 'Seu cérebro ama clareza'
        : 'Último lembrete';

  const preview =
    day === 2
      ? '3 prompts prontos para começar hoje'
      : day === 5
        ? 'Um jeito simples de transformar ideia em tarefa'
        : 'A porta está aberta se você quiser voltar';

  return (
    <Html lang="pt" dir="ltr">
      <Head />
      <Preview>{preview}</Preview>
      <Body className="font-sans py-[40px]" style={{ backgroundColor: '#F6F9FC' }}>
        <Container className="bg-white rounded-[8px] shadow-sm max-w-[600px] mx-auto p-[40px]">
          <Section className="text-center mb-[32px]">
            <Heading className="text-[28px] font-bold m-0 mb-[8px] text-black">
              {title}
            </Heading>
            <Text className="text-[16px] m-0 text-black">
              {preview}
            </Text>
          </Section>

          <Section className="mb-[32px]">
            <Text className="text-[16px] m-0 mb-[16px] text-black">
              Oi <span style={{ color: '#ffad5b', fontWeight: 600 }}>{name}</span>,
            </Text>

            {day === 2 ? (
              <>
                <Text className="text-[16px] m-0 mb-[16px] leading-[24px] text-black">
                  Você não precisa "ter tempo". Precisa de um ponto de partida. Aqui vão 3 prompts que funcionam:
                </Text>
                <div className="rounded-[12px] p-[24px]" style={{ backgroundColor: '#F6F9FC' }}>
                  <Text className="text-[14px] m-0 mb-[8px] text-black">
                    • "Me ajude a planejar minha semana com prioridades."
                  </Text>
                  <Text className="text-[14px] m-0 mb-[8px] text-black">
                    • "Resuma este texto e me diga o que fazer com ele."
                  </Text>
                  <Text className="text-[14px] m-0 text-black">
                    • "Crie um checklist para eu executar isso hoje."
                  </Text>
                </div>
              </>
            ) : day === 5 ? (
              <Text className="text-[16px] m-0 leading-[24px] text-black">
                A diferença entre "ideia" e "resultado" é <span style={{ color: '#ffad5b', fontWeight: 600 }}>execução guiada</span>. No Pro você mantém contexto, ganha mais histórico e transforma conversa em ação mais rápido.
              </Text>
            ) : (
              <Text className="text-[16px] m-0 leading-[24px] text-black">
                Se fizer sentido, você pode fazer upgrade e voltar quando quiser. Sem burocracia.
              </Text>
            )}
          </Section>

          <Section className="text-center mb-[32px]">
            <Button
              href={appUrl}
              className="rounded-full px-[32px] py-[12px] font-semibold text-black no-underline"
              style={{ backgroundColor: '#ffad5b' }}
            >
              Ver planos e fazer upgrade
            </Button>
          </Section>

          <Hr className="my-[32px]" style={{ borderColor: '#E5E7EB' }} />

          <Section className="mb-[32px]">
            <div className="bg-white border-l-[4px] p-[16px] rounded-r-[8px]" style={{ borderColor: '#ffad5b' }}>
              <Text className="text-[14px] m-0 mb-[8px] font-semibold" style={{ color: '#ffad5b' }}>
                Importante
              </Text>
              <Text className="text-[14px] m-0 leading-[20px] text-black">
                Se você já assinou, ignore esta mensagem — e obrigado por apoiar o Pumkin.
              </Text>
            </div>
          </Section>

          <Hr className="my-[32px]" style={{ borderColor: '#E5E7EB' }} />
          <Section>
            <Text className="text-[12px] m-0 text-center leading-[18px]" style={{ color: '#687385' }}>
              © {new Date().getFullYear()} Pumkin. Todos os direitos reservados.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default DripEmail;
