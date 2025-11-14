import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./CodeBlock";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose dark:prose-invert max-w-none prose-sm">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          code(props: any) {
            const { children, className, inline } = props;
            return (
              <CodeBlock
                inline={inline}
                className={className}
              >
                {children}
              </CodeBlock>
            );
          },
          // Custom link styling
          a(props) {
            return (
              <a
                {...props}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              />
            );
          },
          // Custom list styling
          ul(props) {
            return <ul {...props} className="list-disc list-inside" />;
          },
          ol(props) {
            return <ol {...props} className="list-decimal list-inside" />;
          },
          // Custom table styling
          table(props) {
            return (
              <table
                {...props}
                className="border-collapse border border-gray-300 dark:border-gray-700"
              />
            );
          },
          th(props) {
            return (
              <th
                {...props}
                className="border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-3 py-2"
              />
            );
          },
          td(props) {
            return (
              <td
                {...props}
                className="border border-gray-300 dark:border-gray-700 px-3 py-2"
              />
            );
          },
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
