'use client';

import { useState } from 'react';
import { PromptInput, PromptInputTextarea, PromptInputSubmit, PromptInputModelSelectItem, PromptInputModelSelect, PromptInputModelSelectTrigger, PromptInputModelSelectContent, PromptInputTools, PromptInputToolbar, PromptInputButton } from '@/components/ai-elements/prompt-input';
import { SignInDialog } from '@/components/common/sign-in-dialog';
import { SignUpDialog } from '@/components/common/sign-up-dialog';
import { Header } from '@/components/common/header';
import { GlobeIcon } from 'lucide-react';
import Image from 'next/image';
import { modelSupportsWebSearch } from '@/data/model-capabilities';

const models = [
  {
    name: 'Gemini',
    value: 'google/gemini-2.5-flash',
    icon: <Image src="/models/gemini.svg" alt="Gemini" width={24} height={24} priority quality={100} />,
  },
  {
    name: 'ChatGPT',
    value: 'openai/gpt-5-nano',
    icon: <Image src="/models/chatgpt.svg" alt="openai" width={24} height={24} priority quality={100} />,
  },
  {
    name: 'Claude',
    value: 'anthropic/claude-haiku-4.5',
    icon: <Image src="/models/claude.svg" alt="claude" width={24} height={24} priority quality={100} />,
    off: false,
  },
  {
    name: 'DeepSeek',
    value: 'deepseek/deepseek-v3.2',
    icon: <Image src="/models/deepseek.svg" alt="deepseek" width={24} height={24} priority quality={100} />,
  },
  {
    name: 'Kimi',
    value: 'moonshotai/kimi-k2.5',
    icon: <Image src="/models/kimi.svg" alt="moonshotai" width={24} height={24} priority quality={100} />,
  },
  {
    name: 'MiniMax',
    value: 'minimax/minimax-m2.5',
    icon: <Image src="/models/minimax.png" alt="minimax" width={24} height={24} priority quality={100} />,
  },
  {
    name: 'Grok',
    value: 'xai/grok-code-fast-1',
    icon: <Image src="/models/grok.svg" alt="xai" width={24} height={24} priority quality={100} />,
  },
  {
    name: 'GLM',
    value: 'zai/glm-5',
    icon: <Image src="/models/chatgpt.svg" alt="zai" width={24} height={24} priority quality={100} />,
  },
  {
    name: 'Qwen',
    value: 'alibaba/qwen3.5-plus',
    icon: <Image src="/models/qwen.svg" alt="alibaba" width={24} height={24} priority quality={100} />,
  },
  {
    name: 'Llama',
    value: 'meta/llama-3.3-70b',
    icon: <Image src="/models/llama.svg" alt="meta" width={24} height={24} priority quality={100} />,
  },
  {
    name: 'Perplexity',
    value: 'perplexity/sonar',
    icon: <Image src="/models/perplexity.svg" alt="perplexity" width={24} height={24} priority quality={100} />,
  },
];

export default function HomePage() {
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>(models[0].value);
  const [webSearch, setWebSearch] = useState(false);

  const selectedModel = models.find((m) => m.value === model);
  const canWebSearch = modelSupportsWebSearch(model);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSignIn(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header onSignInClick={() => setShowSignIn(true)} onSignUpClick={() => setShowSignUp(true)} />
      <main className="flex flex-col items-center justify-center flex-grow">
        <div className="w-full max-w-3xl px-4 flex flex-col items-center space-y-4">
          <h1 className="text-2xl">Em que posso te ajudar?</h1>

          <div className="rounded-md w-full max-w-3xl mx-auto">
            <PromptInput onSubmit={handleSubmit}>
              <PromptInputTextarea
                onChange={(e) => setInput(e.target.value)}
                value={input}
              />
              <PromptInputToolbar>
                <PromptInputTools>
                  <PromptInputModelSelect
                    onValueChange={(value) => {
                      setModel(value);
                      if (!modelSupportsWebSearch(value)) {
                        setWebSearch(false);
                      }
                    }}
                    value={model}
                  >
                    <PromptInputModelSelectTrigger>
                      {selectedModel && (
                        <div className="flex items-center gap-2">
                          {selectedModel.icon}
                          <span className="font-medium">{selectedModel.name}</span>
                        </div>
                      )}
                    </PromptInputModelSelectTrigger>
                    <PromptInputModelSelectContent showSubscription={false} side="top">
                      {models.map((model) => {
                        const Icon = model.icon;
                        return (
                          <PromptInputModelSelectItem
                            key={model.value}
                            value={model.value}
                            disabled={model.off}
                          >
                            <div className="flex items-center gap-2">
                              {Icon}
                              <span className="font-medium">{model.name}</span>
                              {model.off && (
                                <span className="text-xs text-amber-500">Em breve</span>
                              )}
                            </div>
                          </PromptInputModelSelectItem>
                        );
                      })}
                    </PromptInputModelSelectContent>
                  </PromptInputModelSelect>
                  {canWebSearch && (
                    <PromptInputButton
                      variant={webSearch ? 'default' : 'ghost'}
                      onClick={() => setWebSearch(!webSearch)}
                    >
                      <GlobeIcon size={16} />
                      <span className="hidden sm:flex">Pesquisar</span>
                    </PromptInputButton>
                  )}
                </PromptInputTools>
                <PromptInputSubmit disabled={!input} />
              </PromptInputToolbar>
            </PromptInput>
          </div>
        </div>
      </main>
      <SignInDialog
        open={showSignIn}
        onOpenChange={setShowSignIn}
        onSignUpClick={() => setShowSignUp(true)}
      />
      <SignUpDialog
        open={showSignUp}
        onOpenChange={setShowSignUp}
      />
    </div>
  );
}