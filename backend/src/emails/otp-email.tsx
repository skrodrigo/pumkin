import { Html, Head, Preview, Tailwind, Body, Container, Section, Text, Button, Hr } from '@react-email/components';
import { emailTailwindConfig } from './tailwind.js';

export function OtpEmail(props: { code: string; appUrl: string }) {
  const { code, appUrl } = props;
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Seu código Pumkin: {code} (expira em 10 min)</Preview>
      <Tailwind config={emailTailwindConfig}>
        <Body className="m-0 py-6 font-sans">
          <Container className="mx-auto max-w-[560px] px-[14px]">
            <Section className="rounded-md border border-white/10 bg-panel px-5 py-5">
              <Text className="m-0 text-xs tracking-[2.5px] text-brand">PUMKIN</Text>
              <Text className="mt-2 mb-0 text-[20px] leading-7 text-text">
                Confirme agora e continue de onde parou
              </Text>
              <Text className="mt-2 mb-0 text-sm leading-5 text-muted">
                Aqui está seu código de verificação. Ele expira em <span className="text-text">10 minutos</span>.
              </Text>

              <Section className="mt-4 flex justify-center">
                <Section className="inline-block rounded-md border border-brand/25 px-5 py-4">
                  <Text className="m-0 text-[11px] tracking-[1.8px] text-brand2 text-center">CÓDIGO</Text>
                  <Text className="mt-2 mb-0 text-[30px] tracking-[6px] text-brand text-center">{code}</Text>
                </Section>
              </Section>

              <Button
                href={appUrl}
                className="mt-4 block rounded-full bg-brand px-5 py-3 text-center font-semibold text-[#0B0F0E] no-underline"
              >
                Abrir o Pumkin
              </Button>

              <Hr className="my-5 border-0 border-t border-white/10" />

              <Text className="m-0 text-xs leading-[18px] text-muted">
                Se você não pediu esse código, pode ignorar esta mensagem.
              </Text>
            </Section>

            <Text className="mt-3 mb-0 text-center text-xs leading-[18px] text-[#8E8E8E]">
              © {new Date().getFullYear()} Pumkin. Feito para quem quer foco e resultado.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default OtpEmail;
