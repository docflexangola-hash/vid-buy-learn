import DOMPurify from "dompurify";

type RichTextRendererProps = {
  content: string;
  className?: string;
};

const proseStyles =
  "prose prose-sm sm:prose-base max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-xl prose-h3:text-lg prose-p:text-foreground/85 prose-p:leading-relaxed prose-a:text-gold prose-a:underline prose-blockquote:border-l-gold prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-md prose-img:rounded-xl prose-img:mx-auto prose-li:text-foreground/85";

export function RichTextRenderer({ content, className = "" }: RichTextRendererProps) {
  const sanitized = DOMPurify.sanitize(content);

  return (
    <div
      className={`${proseStyles} ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
