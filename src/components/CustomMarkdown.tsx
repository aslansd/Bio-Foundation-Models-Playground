import React from "react";

interface CustomMarkdownProps {
  content: string;
}

export default function CustomMarkdown({ content }: CustomMarkdownProps) {
  if (!content) return null;

  // Split content by lines
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeBlockLang = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for code blocks
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        // End of code block
        inCodeBlock = false;
        elements.push(
          <pre
            key={`code-${i}`}
            className="my-3 p-4 bg-slate-900/80 border border-slate-700/50 rounded-lg overflow-x-auto font-mono text-xs text-teal-300"
          >
            <code>{codeBlockLines.join("\n")}</code>
          </pre>
        );
        codeBlockLines = [];
      } else {
        // Start of code block
        inCodeBlock = true;
        codeBlockLang = line.replace("```", "").trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    const trimmed = line.trim();

    // Headers
    if (trimmed.startsWith("###")) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-sm font-semibold text-slate-200 mt-4 mb-2 flex items-center gap-1.5 uppercase tracking-wider font-display">
          <span className="w-1 h-3 bg-teal-500 rounded-sm"></span>
          {parseInline(trimmed.slice(3).trim())}
        </h3>
      );
    } else if (trimmed.startsWith("##")) {
      elements.push(
        <h2 key={`h2-${i}`} className="text-base font-semibold text-teal-400 mt-5 mb-2.5 font-display border-b border-slate-800 pb-1 uppercase tracking-wide">
          {parseInline(trimmed.slice(2).trim())}
        </h2>
      );
    } else if (trimmed.startsWith("#")) {
      elements.push(
        <h1 key={`h1-${i}`} className="text-lg font-bold text-teal-300 mt-6 mb-3 font-display">
          {parseInline(trimmed.slice(1).trim())}
        </h1>
      );
    }
    // Bullet points
    else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      elements.push(
        <li key={`li-${i}`} className="ml-5 list-disc text-slate-300 my-1 text-sm leading-relaxed">
          {parseInline(trimmed.slice(2).trim())}
        </li>
      );
    }
    // Numbered lists
    else if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s(.*)/);
      if (match) {
        elements.push(
          <div key={`ol-${i}`} className="ml-5 text-slate-300 my-1.5 text-sm leading-relaxed flex gap-2">
            <span className="text-teal-400 font-mono font-medium">{match[1]}.</span>
            <span>{parseInline(match[2])}</span>
          </div>
        );
      }
    }
    // Dividers
    else if (trimmed === "---") {
      elements.push(<hr key={`hr-${i}`} className="my-5 border-slate-800" />);
    }
    // Empty lines
    else if (trimmed === "") {
      elements.push(<div key={`space-${i}`} className="h-2"></div>);
    }
    // Paragraph
    else {
      elements.push(
        <p key={`p-${i}`} className="text-slate-300 text-sm leading-relaxed my-2">
          {parseInline(line)}
        </p>
      );
    }
  }

  return <div className="space-y-1 font-sans">{elements}</div>;
}

// Simple parser for **bold**, *italic*, and `inline code`
function parseInline(text: string): React.ReactNode[] {
  if (!text) return [];

  const parts: React.ReactNode[] = [];
  let currentText = text;
  let keyIdx = 0;

  // Regular expression to find **bold**, *italic*, and `inline code`
  // We can do an iterative regex match
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const matches = currentText.split(regex);

  if (matches.length === 1) {
    return [text];
  }

  return matches.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    } else if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={index} className="italic text-slate-200">
          {part.slice(1, -1)}
        </em>
      );
    } else if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 bg-slate-900 text-teal-400 font-mono text-xs rounded border border-slate-800"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
