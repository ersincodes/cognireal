import type { ReactNode } from "react";

const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;

export const renderMessageWithLinks = (text: string): ReactNode[] => {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  const regex = new RegExp(LINK_PATTERN.source, "g");

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const label = match[1];
    const href = match[2];

    parts.push(
      <a
        key={`link-${key++}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-brand-blue underline underline-offset-2 hover:text-brand-cyan"
      >
        {label}
      </a>
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
};
