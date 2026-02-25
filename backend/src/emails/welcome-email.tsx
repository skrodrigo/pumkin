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

interface WelcomeEmailProps {
  name: string;
  appUrl: string;
}

export function WelcomeEmail(props: WelcomeEmailProps) {
  const { name, appUrl } = props;

  return (
    <Html lang="pt" dir="ltr">
      <Head />
      <Preview>Bem-vindo, {name}. Vamos começar?</Preview>
      <Body className="font-sans py-[40px]" style={{ backgroundColor: '#F6F9FC' }}>
        <Container className="bg-white rounded-[8px] shadow-sm max-w-[600px] mx-auto p-[40px]">
          <Section className="text-center mb-[32px]">
            <Heading className="text-[28px] font-bold m-0 mb-[8px] text-black">
              Bem-vindo
            </Heading>
            <Text className="text-[16px] m-0 text-black">
              Sua conta está pronta
            </Text>
          </Section>

          <Section className="mb-[32px]">
            <Text className="text-[16px] m-0 mb-[16px] text-black">
              Oi <span style={{ color: '#ffad5b', fontWeight: 600 }}>{name}</span>,
            </Text>
            <Text className="text-[16px] m-0 mb-[16px] leading-[24px] text-black">
              Agora é a parte boa: <span style={{ color: '#ffad5b', fontWeight: 600 }}>entrar, perguntar e produzir</span>.
            </Text>
            <Text className="text-[16px] m-0 leading-[24px] text-black">
              Dica: comece com um objetivo claro (ex.: "me ajude a planejar minha semana") e deixe o Pumkin quebrar em passos.
            </Text>
          </Section>

          <Section className="text-center mb-[32px]">
            <Button
              href={appUrl}
              className="rounded-full px-[32px] py-[12px] font-semibold text-black no-underline"
              style={{ backgroundColor: '#ffad5b' }}
            >
              Começar agora
            </Button>
          </Section>

          <Hr className="my-[32px]" style={{ borderColor: '#E5E7EB' }} />

          <Section className="mb-[32px]">
            <div className="bg-white border-l-[4px] p-[16px] rounded-r-[8px]" style={{ borderColor: '#ffad5b' }}>
              <Text className="text-[14px] m-0 mb-[8px] font-semibold" style={{ color: '#ffad5b' }}>
                Lembrete
              </Text>
              <Text className="text-[14px] m-0 leading-[20px] text-black">
                Você não precisa ser perfeito. Só precisa começar.
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

export default WelcomeEmail;
