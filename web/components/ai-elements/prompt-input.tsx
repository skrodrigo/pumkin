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
import React, { ComponentProps, KeyboardEventHandler, useState, useEffect, Children, HTMLAttributes, useRef } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Loader2Icon, ArrowUpIcon, SquareIcon, XIcon, PaperclipIcon } from 'lucide-react';

export type PromptInputProps = HTMLAttributes<HTMLFormElement>;

export const PromptInput = ({ className, ...props }: PromptInputProps) => (
  <form
    className={cn(
      'w-full divide-y overflow-hidden rounded-md border border-border/60 bg-muted backdrop-blur-xl ',
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
      '',
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
        'shrink-0 gap-1.5 rounded-md h-9 border-none',
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
      className={cn('gap-1.5 rounded-md border-none', className)}
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

export const PromptInputModelSelect = (props: PromptInputModelSelectProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Select {...props} />
  );
};

export type PromptInputModelSelectTriggerProps = ComponentProps<
  typeof SelectTrigger
>;

export const PromptInputModelSelectTrigger = ({
  className,
  ...props
}: PromptInputModelSelectTriggerProps) => (
  <SelectTrigger
    className={cn(
      'font-medium text-muted-foreground shadow-none transition-colors',
      'aria-expanded:bg-background aria-expanded:text-foreground',
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
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsLoading(false);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <SelectContent
      className={cn(
        'w-[calc(100vw-3rem)] max-w-[400px] h-auto bg-muted',
        className
      )}
      collisionPadding={12}
      sideOffset={8}
      {...props}
    >
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

export type PromptInputAttachmentButtonProps = Omit<
  PromptInputButtonProps,
  'onClick'
> & {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
};

export const PromptInputAttachmentButton = ({
  className,
  onFilesSelected,
  accept,
  disabled,
  variant = 'ghost',
  size,
  ...props
}: PromptInputAttachmentButtonProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple
        accept={accept}
        disabled={disabled}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = '';
          if (files.length === 0) return;
          onFilesSelected(files);
        }}
      />
      <Button
        {...props}
        className={cn(
          'font-medium text-muted-foreground shadow-none transition-colors',
          'hover:bg-background hover:text-foreground',
          'dark:bg-input/30 dark:hover:bg-input/50',
          'border border-border rounded-md',
          className
        )}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        size={size ?? 'icon'}
        type="button"
        variant={variant}
      >
        <PaperclipIcon size={16} />
      </Button>
    </>
  );
};
