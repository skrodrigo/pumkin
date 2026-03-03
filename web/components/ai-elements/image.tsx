import { cn } from '@/lib/utils';
import type { Experimental_GeneratedImage } from 'ai';

export type ImageProps = Omit<Experimental_GeneratedImage, 'base64' | 'mediaType' | 'uint8Array'> & {
  className?: string;
  alt?: string;
  base64?: string;
  mediaType?: string;
  url?: string;
  uint8Array?: Uint8Array;
};

export const Image = ({
  base64,
  uint8Array,
  mediaType,
  url,
  ...props
}: ImageProps) => {
  const src = url
    ? url
    : base64 && mediaType
      ? `data:${mediaType};base64,${base64}`
      : '';

  return (
    <img
      {...props}
      alt={props.alt}
      className={cn(
        'h-auto w-auto max-w-full sm:max-w-[200px] md:max-w-[300px] lg:max-w-[400px] overflow-hidden rounded-md',
        props.className
      )}
      src={src}
    />
  );
};
