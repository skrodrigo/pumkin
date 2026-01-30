'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { ChatStatus } from 'ai';
import React, { ComponentProps, KeyboardEventHandler, useState, useEffect, Children, HTMLAttributes } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Loader2Icon, ArrowUpIcon, SquareIcon, XIcon } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { getSubscription } from '@/server/stripe/get-subscription';

const createSubscription = async () => {
  const session = await authClient.getSession();

  const userId = session.data?.user.id;

  const subscription = await getSubscription();

  await authClient.subscription.upgrade({
    plan: "Pro",
    annual: false,
    referenceId: userId,
    subscriptionId: subscription?.stripeSubscriptionId ?? undefined,
    successUrl: process.env.BETTER_AUTH_URL,
    cancelUrl: process.env.BETTER_AUTH_URL,
    disableRedirect: false,
  })
}

export type PromptInputProps = HTMLAttributes<HTMLFormElement>;

export const PromptInput = ({ className, ...props }: PromptInputProps) => (
  <form
    className={cn(
      'w-full divide-y overflow-hidden rounded-2xl border bg-muted/20 backdrop-blur-xl ',
      className
    )}
    {...props}
  />

);

export type PromptInputTextareaProps = ComponentProps<typeof Textarea> & {
  minHeight?: number;
  maxHeight?: number;
};

export const PromptInputTextarea = ({
  onChange,
  className,
  placeholder = 'Digite sua mensagem aqui...',
  minHeight = 48,
  maxHeight = 164,
  ...props
}: PromptInputTextareaProps) => {
  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        return;
      }

      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  return (
    <Textarea
      className={cn(
        'w-full resize-none rounded-none border-none p-3 shadow-none outline-none ring-0',
        'field-sizing-content max-h-[6lh] bg-transparent dark:bg-transparent',
        'focus-visible:ring-0',
        className
      )}
      name="message"
      onChange={(e) => {
        onChange?.(e);
      }}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      {...props}
    />
  );
};

export type PromptInputToolbarProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputToolbar = ({
  className,
  ...props
}: PromptInputToolbarProps) => (
  <div
    className={cn('flex items-center justify-between p-1', className)}
    {...props}
  />
);

export type PromptInputToolsProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputTools = ({
  className,
  ...props
}: PromptInputToolsProps) => (
  <div
    className={cn(
      'flex items-center gap-1',
      '[&_button:first-child]:rounded-bl-xl',
      className
    )}
    {...props}
  />
);

export type PromptInputButtonProps = ComponentProps<typeof Button>;

export const PromptInputButton = ({
  variant = 'ghost',
  className,
  size,
  ...props
}: PromptInputButtonProps) => {
  const newSize =
    (size ?? Children.count(props.children) > 1) ? 'default' : 'icon';

  return (
    <Button
      className={cn(
        'shrink-0 gap-1.5 rounded-2xl border-none',
        variant === 'ghost' && 'text-muted-foreground',
        newSize === 'default' && 'px-3',
        className
      )}
      size={newSize}
      type="button"
      variant={variant}
      {...props}
    />
  );
};

export type PromptInputSubmitProps = ComponentProps<typeof Button> & {
  status?: ChatStatus;
};

export const PromptInputSubmit = ({
  className,
  variant = 'default',
  size = 'icon',
  status,
  children,
  ...props
}: PromptInputSubmitProps) => {
  let Icon = <ArrowUpIcon className="size-5 rounded-full" />;

  if (status === 'submitted') {
    Icon = <Loader2Icon className="size-4 animate-spin rounded-full" />;
  } else if (status === 'streaming') {
    Icon = <SquareIcon className="size-4 rounded-full" />;
  } else if (status === 'error') {
    Icon = <XIcon className="size-4 rounded-full" />;
  }

  return (
    <Button
      className={cn('gap-1.5 rounded-2xl border-none', className)}
      size={size}
      type="submit"
      variant={variant}
      {...props}
    >
      {children ?? Icon}
    </Button>
  );
};

export type PromptInputModelSelectProps = ComponentProps<typeof Select>;

export const PromptInputModelSelect = (props: PromptInputModelSelectProps) => (
  <Select {...props} />
);

export type PromptInputModelSelectTriggerProps = ComponentProps<
  typeof SelectTrigger
>;

export const PromptInputModelSelectTrigger = ({
  className,
  ...props
}: PromptInputModelSelectTriggerProps) => (
  <SelectTrigger
    className={cn(
      'border-none bg-transparent font-medium text-muted-foreground shadow-none transition-colors',
      'hover:bg-accent hover:text-foreground [&[aria-expanded="true"]]:bg-accent [&[aria-expanded="true"]]:text-foreground',
      className
    )}
    {...props}
  />
);

export interface PromptInputModelSelectContentProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {
  showSubscription?: boolean;
}

export const PromptInputModelSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  PromptInputModelSelectContentProps
>(({ className, children, showSubscription = true, ...props }, ref) => {
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const sub = await getSubscription();
        setSubscription(sub);
      } catch (error) { }
      finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  return (
    <SelectContent className={cn('w-[420px] h-auto bg-muted', className)} {...props}>
      <div className="h-auto overflow-y-auto">
        {children}
      </div>
    </SelectContent>
  );
});


export type PromptInputModelSelectItemProps = ComponentProps<typeof SelectItem>;

export const PromptInputModelSelectItem = ({
  className,
  ...props
}: PromptInputModelSelectItemProps) => (
  <SelectItem
    className={cn('flex items-center justify-between', className)}
    {...props}
  />
);

export type PromptInputModelSelectValueProps = ComponentProps<
  typeof SelectValue
>;

export const PromptInputModelSelectValue = ({
  className,
  ...props
}: PromptInputModelSelectValueProps) => (
  <SelectValue className={cn(className)} {...props} />
);
