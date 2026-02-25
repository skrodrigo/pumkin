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

interface SubscriptionCanceledEmailProps {
  name: string;
  appUrl: string;
}

export function SubscriptionCanceledEmail(props: SubscriptionCanceledEmailProps) {
  const { name, appUrl } = props;

  return (
    <Html lang="pt" dir="ltr">
      <Head />
      <Preview>Você pode voltar quando quiser</Preview>
      <Body className="font-sans py-[40px]" style={{ backgroundColor: '#F6F9FC' }}>
        <Container className="bg-white rounded-[8px] shadow-sm max-w-[600px] mx-auto p-[40px]">
          <Section className="text-center mb-[32px]">
            <Heading className="text-[28px] font-bold m-0 mb-[8px] text-black">
              Assinatura Cancelada
            </Heading>
            <Text className="text-[16px] m-0 text-black">
              Você pode voltar quando quiser
            </Text>
          </Section>

          <Section className="mb-[32px]">
            <Text className="text-[16px] m-0 mb-[16px] text-black">
              Oi <span style={{ color: '#ffad5b', fontWeight: 600 }}>{name}</span>,
            </Text>
            <Text className="text-[16px] m-0 leading-[24px] text-black">
              Sua assinatura foi cancelada. Sem drama: acontece. O que importa é que quando você quiser voltar, está tudo aqui — histórico, contexto e seu ritmo.
            </Text>
          </Section>

          <Section className="mb-[32px]">
            <div className="rounded-[12px] p-[24px]" style={{ backgroundColor: '#F6F9FC' }}>
              <Text className="text-[14px] m-0 mb-[16px] uppercase tracking-wide text-black font-semibold">
                Por que voltar?
              </Text>
              <Text className="text-[14px] m-0 mb-[8px] text-black">
                • Respostas mais completas e rápidas
              </Text>
              <Text className="text-[14px] m-0 mb-[8px] text-black">
                • Mais histórico e continuidade nas conversas
              </Text>
              <Text className="text-[14px] m-0 text-black">
                • Menos fricção para transformar ideia em ação
              </Text>
            </div>
          </Section>

          <Section className="text-center mb-[32px]">
            <Button
              href={appUrl}
              className="rounded-full px-[32px] py-[12px] font-semibold text-black no-underline"
              style={{ backgroundColor: '#ffad5b' }}
            >
              Reativar agora
            </Button>
          </Section>

          <Hr className="my-[32px]" style={{ borderColor: '#E5E7EB' }} />

          <Section className="mb-[32px]">
            <div className="bg-white border-l-[4px] p-[16px] rounded-r-[8px]" style={{ borderColor: '#ffad5b' }}>
              <Text className="text-[14px] m-0 mb-[8px] font-semibold" style={{ color: '#ffad5b' }}>
                Importante
              </Text>
              <Text className="text-[14px] m-0 leading-[20px] text-black">
                Se essa mudança foi um engano, você pode reativar em segundos.
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

export default SubscriptionCanceledEmail;
