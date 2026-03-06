function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatInline(input: string): string {
  let text = escapeHtml(input);
  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/`(.+?)`/g, "<code>$1</code>");
  text = text.replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer noopener">$1</a>');
  return text;
}

function parseTableRow(line: string): string[] {
  let cleaned = line.trim();
  if (cleaned.startsWith("|")) cleaned = cleaned.slice(1);
  if (cleaned.endsWith("|")) cleaned = cleaned.slice(0, -1);
  return cleaned.split("|").map((cell) => cell.trim());
}

function isTableDivider(line: string): boolean {
  const cells = parseTableRow(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s+/g, "")));
}

function getTableAlign(cell: string): "left" | "center" | "right" {
  const normalized = cell.replace(/\s+/g, "");
  if (normalized.startsWith(":") && normalized.endsWith(":")) {
    return "center";
  }
  if (normalized.endsWith(":")) {
    return "right";
  }
  return "left";
}

function normalizeRowCells(cells: string[], count: number): string[] {
  if (cells.length === count) return cells;
  if (cells.length > count) return cells.slice(0, count);
  return [...cells, ...new Array(count - cells.length).fill("")];
}

export function renderDecisionMarkdown(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let list: "ul" | "ol" | null = null;

  const closeList = () => {
    if (list) {
      html.push(`</${list}>`);
      list = null;
    }
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();

    if (!line) {
      closeList();
      continue;
    }

    if (/^---+$/.test(line)) {
      closeList();
      html.push("<hr />");
      continue;
    }

    if (line.startsWith("### ")) {
      closeList();
      html.push(`<h3>${formatInline(line.slice(4))}</h3>`);
      continue;
    }

    if (line.startsWith("- ")) {
      if (list !== "ul") {
        closeList();
        list = "ul";
        html.push("<ul>");
      }
      html.push(`<li>${formatInline(line.slice(2))}</li>`);
      continue;
    }

    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (ordered) {
      if (list !== "ol") {
        closeList();
        list = "ol";
        html.push("<ol>");
      }
      html.push(`<li>${formatInline(ordered[1])}</li>`);
      continue;
    }

    if (line.startsWith("> ")) {
      closeList();
      html.push(`<blockquote>${formatInline(line.slice(2))}</blockquote>`);
      continue;
    }

    const nextLine = lines[index + 1]?.trim();
    if (line.includes("|") && nextLine && isTableDivider(nextLine)) {
      closeList();
      const headerCells = parseTableRow(line);
      const dividerCells = parseTableRow(nextLine);
      const columnCount = Math.min(headerCells.length, dividerCells.length);

      if (columnCount >= 2) {
        const head = normalizeRowCells(headerCells, columnCount);
        const alignments = normalizeRowCells(dividerCells, columnCount).map(getTableAlign);
        const rows: string[][] = [];

        index += 2;
        while (index < lines.length) {
          const rowLine = lines[index].trim();
          if (!rowLine || !rowLine.includes("|")) {
            index -= 1;
            break;
          }
          const rowCells = parseTableRow(rowLine);
          if (rowCells.length < 2) {
            index -= 1;
            break;
          }
          rows.push(normalizeRowCells(rowCells, columnCount));
          if (index === lines.length - 1) {
            break;
          }
          index += 1;
        }

        const thead = head
          .map((cell, cellIndex) => `<th style="text-align:${alignments[cellIndex]}">${formatInline(cell)}</th>`)
          .join("");
        const tbody = rows
          .map((row) => {
            const cells = row
              .map((cell, cellIndex) => `<td style="text-align:${alignments[cellIndex]}">${formatInline(cell)}</td>`)
              .join("");
            return `<tr>${cells}</tr>`;
          })
          .join("");

        html.push(`<table><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>`);
        continue;
      }
    }

    closeList();
    html.push(`<p>${formatInline(line)}</p>`);
  }

  closeList();
  return html.join("\n");
}
