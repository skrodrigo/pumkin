import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  CodeInline,
  Hr,
} from '@react-email/components';

interface OtpEmailProps {
  code: string;
  appUrl: string;
}

export function OtpEmail(props: OtpEmailProps) {
  const { code, } = props;

  return (
    <Html lang="pt" dir="ltr">
      <Head />
      <Preview>Seu código de verificação chegou</Preview>
      <Body className="font-sans py-[40px]" style={{ backgroundColor: '#F6F9FC' }}>
        <Container className="bg-white rounded-[8px] shadow-sm max-w-[600px] mx-auto p-[40px]">
          <Section className="text-center mb-[32px]">
            <Heading className="text-[28px] font-bold m-0 mb-[8px] text-black">
              Código de Verificação
            </Heading>
            <Text className="text-[16px] m-0 text-black">
              Use o código abaixo para continuar
            </Text>
          </Section>

          <Section className="mb-[32px]">
            <Text className="text-[16px] m-0 leading-[24px] text-black">
              Aqui está seu código. Ele expira em <span style={{ color: '#ffad5b', fontWeight: 600 }}>10 minutos</span>.
            </Text>
          </Section>

          <Section className="text-center mb-[32px]">
            <div className="rounded-[12px] py-[24px] px-[32px]" style={{ backgroundColor: '#F6F9FC' }}>
              <Text className="text-[14px] m-0 mb-[8px] uppercase tracking-wide text-black">
                Seu código
              </Text>
              <CodeInline className="text-[36px] font-bold bg-transparent p-0 font-mono tracking-[8px] text-black">
                {code}
              </CodeInline>
            </div>
          </Section>

          <Section className="mb-[32px]">
            <Text className="text-[14px] m-0 mb-[8px] text-black">
              • Digite o código na tela de verificação
            </Text>
            <Text className="text-[14px] m-0 mb-[8px] text-black">
              • O código expira em 10 minutos
            </Text>
            <Text className="text-[14px] m-0 text-black">
              • Use apenas uma vez
            </Text>
          </Section>

          <Hr className="my-[32px] border-black" style={{ borderColor: '#E5E7EB' }} />

          <Section className="mb-[32px]">
            <div className="bg-white border-l-[4px] p-[16px] rounded-r-[8px]" style={{ borderColor: '#ffad5b' }}>
              <Text className="text-[14px] m-0 mb-[8px] font-semibold" style={{ color: '#ffad5b' }}>
                Importante para sua segurança
              </Text>
              <Text className="text-[14px] m-0 leading-[20px] text-black">
                Nunca compartilhe este código. Nossa equipe nunca solicitará seu código por telefone ou email.
              </Text>
            </div>
          </Section>

          <Section className="mb-[32px]">
            <Text className="text-[14px] m-0 leading-[20px] text-black">
              Não solicitou este código? Ignore este email.
            </Text>
          </Section>

          <Hr className="my-[32px] border-black" style={{ borderColor: '#E5E7EB' }} />
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

export default OtpEmail;
