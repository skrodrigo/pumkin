import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { UIMessage } from 'ai';
import type { ComponentProps, HTMLAttributes } from 'react';

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: UIMessage['role'];
};

export const Message = ({
  className,
  from,
  children,
  ...props
}: MessageProps) => (
  <div
    className={cn(
      'group flex w-full items-end justify-end gap-2',
      from === 'user' ? 'is-user' : 'is-assistant flex-row-reverse justify-end',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export type MessageContentProps = HTMLAttributes<HTMLDivElement>;

export const MessageContent = ({
  children,
  className,
  ...props
}: MessageContentProps) => (
  <div
    className={cn(
      'flex flex-col gap-2 group-[.is-user]:rounded-lg px-4 py-3 text-foreground text-[16px] md:text-sm',
      'group-[.is-user]:bg-muted group-[.is-user]:text-foreground',
      'group-[.is-assistant]:bg-background group-[.is-assistant]:rounded-none group-[.is-assistant]:text-foreground',
      'min-w-0 max-w-full overflow-x-hidden [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:whitespace-pre [&_code]:wrap-break-word',
      className
    )}
    {...props}
  >
    <div className="is-user:dark min-w-0 w-full wrap-break-word">{children}</div>
  </div>
);

export type MessageAvatarProps = ComponentProps<typeof Avatar> & {
  src: string;
  name?: string;
};

export const MessageAvatar = ({
  src,
  name,
  className,
  ...props
}: MessageAvatarProps) => (
  <Avatar
    className={cn('size-8 ring-[0.5px] ring-border', className)}
    {...props}
  >
    <AvatarImage alt="" className="mt-0 mb-0" src={src} />
    <AvatarFallback>{name?.slice(0, 2) || 'ME'}</AvatarFallback>
  </Avatar>
);
