"use client";

import Image from "next/image";
import { useState } from "react";

type StoryImageProps = {
  src: string;
  priority?: boolean;
  sizes: string;
};

export function StoryImage({ src, priority = false, sizes }: StoryImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <span className="absolute inset-0 bg-bg-elevated" aria-hidden="true" />;
  }

  return (
    <Image
      src={src}
      alt=""
      fill
      priority={priority}
      unoptimized
      sizes={sizes}
      className="object-cover"
      onError={() => setFailed(true)}
    />
  );
}
