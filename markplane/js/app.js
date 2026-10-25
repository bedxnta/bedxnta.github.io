(() => {
  "use strict";

  const STORAGE_KEY = "markplane-document";
  const SAMPLE = `# A little space to think

Welcome to **MarkPlane** — a simple place to write in Markdown.

## Make yourself at home

- Write your ideas as they come
- Add *emphasis* when it helps
- Keep useful details close with \`inline code\`

> “Great things are done by a series of small things brought together.”

### A tiny code sample

\`\`\`js
const idea = "start here";
console.log(idea);
\`\`\`

Your work is saved in this browser. When you're ready, download a \`.md\` file and take it with you.`;

  const editor = document.querySelector("#markdown-input");
  const preview = document.querySelector("#markdown-preview");
  const nameInput = document.querySelector("#document-name");
  const saveStatus = document.querySelector("#save-status");
  const saveDot = document.querySelector("#save-dot");
  const stats = document.querySelector("#document-stats");
  let saveTimer;
  let saveAvailable = true;

  const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);

  function safeLink(rawUrl) {
    const url = rawUrl.replace(/&amp;/g, "&").trim();
    if (!url || /[\u0000-\u001f\u007f]/.test(url)) return null;
    try {
      const parsed = new URL(url, window.location.href);
      if (!["http:", "https:", "mailto:"].includes(parsed.protocol)) return null;
      return escapeHtml(url);
    } catch {
      return null;
    }
  }

  function renderInline(source) {
    const codeSpans = [];
    let text = escapeHtml(source).replace(/`([^`\n]+)`/g, (_, code) => {
      const token = `\u0000CODE${codeSpans.length}\u0000`;
      codeSpans.push(`<code>${code}</code>`);
      return token;
    });

    text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (_, alt) => escapeHtml(alt || "image"));
    text = text.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (match, label, href) => {
      const safeHref = safeLink(href);
      return safeHref ? `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${label}</a>` : label;
    });
    text = text
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/__(.+?)__/g, "<strong>$1</strong>")
      .replace(/~~(.+?)~~/g, "<del>$1</del>")
      .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>")
      .replace(/(^|[^_])_([^_\n]+)_(?!_)/g, "$1<em>$2</em>");
    return text.replace(/\u0000CODE(\d+)\u0000/g, (_, index) => codeSpans[Number(index)]);
  }

  function renderMarkdown(markdown) {
    const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
    const output = [];
    let paragraph = [];
    let listType = "";
    let inCode = false;
    let codeLines = [];

    const flushParagraph = () => {
      if (paragraph.length) {
        output.push(`<p>${paragraph.map((line) => renderInline(line)).join("<br>")}</p>`);
        paragraph = [];
      }
    };
    const closeList = () => {
      if (listType) {
        output.push(`</${listType}>`);
        listType = "";
      }
    };
    const isBlank = (line) => !line.trim();

    for (const line of lines) {
      if (/^\s*```/.test(line)) {
        if (inCode) {
          output.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
          codeLines = [];
          inCode = false;
        } else {
          flushParagraph();
          closeList();
          inCode = true;
        }
        continue;
      }
      if (inCode) {
        codeLines.push(line);
        continue;
      }
      if (isBlank(line)) {
        flushParagraph();
        closeList();
        continue;
      }

      const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
      if (heading) {
        flushParagraph();
        closeList();
        const level = heading[1].length;
        output.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
        continue;
      }
      if (/^\s*(?:---+|___+|\*\*\*+)\s*$/.test(line)) {
        flushParagraph();
        closeList();
        output.push("<hr>");
        continue;
      }
      const quote = line.match(/^\s*>\s?(.*)$/);
      if (quote) {
        flushParagraph();
        closeList();
        output.push(`<blockquote><p>${renderInline(quote[1])}</p></blockquote>`);
        continue;
      }

      const listItem = line.match(/^\s*([-+*]|\d+[.)])\s+(.*)$/);
      if (listItem) {
        flushParagraph();
        const desiredType = /^\d/.test(listItem[1]) ? "ol" : "ul";
        if (listType !== desiredType) {
          closeList();
          output.push(`<${desiredType}>`);
          listType = desiredType;
        }
        const task = listItem[2].match(/^\[([ xX])\]\s+(.*)$/);
        if (task) {
          const checked = task[1].toLowerCase() === "x" ? " checked" : "";
          output.push(`<li class="task-item"><input type="checkbox" disabled${checked}>${renderInline(task[2])}</li>`);
        } else {
          output.push(`<li>${renderInline(listItem[2])}</li>`);
        }
        continue;
      }
      closeList();
      paragraph.push(line);
    }
    if (inCode) output.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
    flushParagraph();
    closeList();
    return output.join("");
  }

  function updateDocument() {
    preview.innerHTML = renderMarkdown(editor.value);
    const words = editor.value.trim() ? editor.value.trim().split(/\s+/).length : 0;
    stats.textContent = `${words} ${words === 1 ? "word" : "words"} · ${editor.value.length} characters`;
  }

  function setSaveState(message, state = "saved") {
    saveStatus.textContent = message;
    saveDot.classList.toggle("is-saving", state === "saving");
    saveDot.classList.toggle("is-error", state === "error");
  }

  function persistDocument() {
    if (!saveAvailable) return;
    setSaveState("Saving…", "saving");
    clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: nameInput.value, content: editor.value }));
        setSaveState("Saved on this device");
      } catch {
        saveAvailable = false;
        setSaveState("Could not save locally", "error");
      }
    }, 250);
  }

  function syncDocument() {
    updateDocument();
    persistDocument();
  }

  function restoreDocument() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return false;
      const documentData = JSON.parse(saved);
      if (typeof documentData.content !== "string" || typeof documentData.name !== "string") return false;
      editor.value = documentData.content;
      nameInput.value = documentData.name.slice(0, 80) || "Untitled";
      return true;
    } catch {
      saveAvailable = false;
      setSaveState("Local storage unavailable", "error");
      return false;
    }
  }

  function insertAroundSelection(before, after = before, placeholder = "text") {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = editor.value.slice(start, end) || placeholder;
    editor.setRangeText(`${before}${selected}${after}`, start, end, "select");
    editor.focus();
    syncDocument();
  }

  function prefixLines(prefix) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const lineStart = editor.value.lastIndexOf("\n", start - 1) + 1;
    const nextNewline = editor.value.indexOf("\n", end);
    const lineEnd = nextNewline === -1 ? editor.value.length : nextNewline;
    const selectedLines = editor.value.slice(lineStart, lineEnd).split("\n");
    editor.setRangeText(selectedLines.map((line) => `${prefix}${line}`).join("\n"), lineStart, lineEnd, "select");
    editor.focus();
    syncDocument();
  }

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      if (action === "bold") insertAroundSelection("**", "**", "bold text");
      else if (action === "italic") insertAroundSelection("*", "*", "italic text");
      else if (action === "code") insertAroundSelection("`", "`", "code");
      else if (action === "link") insertAroundSelection("[", "](https://example.com)", "link text");
      else if (action === "heading") prefixLines("## ");
      else if (action === "quote") prefixLines("> ");
      else if (action === "ul") prefixLines("- ");
      else if (action === "ol") prefixLines("1. ");
    });
  });

  editor.addEventListener("input", syncDocument);
  nameInput.addEventListener("input", persistDocument);

  document.querySelector("#sample-button").addEventListener("click", () => {
    if (editor.value.trim() && !window.confirm("Replace the current document with the example?")) return;
    editor.value = SAMPLE;
    nameInput.value = "A little space to think";
    syncDocument();
    editor.focus();
  });

  document.querySelector("#copy-button").addEventListener("click", async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard access is unavailable in this browser.");
      await navigator.clipboard.writeText(editor.value);
      setSaveState("Markdown copied");
      window.setTimeout(() => setSaveState("Saved on this device"), 1800);
    } catch {
      setSaveState("Could not copy — check clipboard permissions", "error");
    }
  });

  document.querySelector("#download-button").addEventListener("click", () => {
    const safeName = nameInput.value.trim().replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-").replace(/[. ]+$/g, "") || "Untitled";
    const blob = new Blob([editor.value], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeName}.md`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setSaveState("Markdown downloaded");
    window.setTimeout(() => setSaveState("Saved on this device"), 1800);
  });

  window.addEventListener("keydown", (event) => {
    const modifier = event.ctrlKey || event.metaKey;
    if (!modifier) return;
    if (event.key.toLowerCase() === "s") {
      event.preventDefault();
      persistDocument();
    } else if (event.key.toLowerCase() === "b" && document.activeElement === editor) {
      event.preventDefault();
      insertAroundSelection("**", "**", "bold text");
    } else if (event.key.toLowerCase() === "i" && document.activeElement === editor) {
      event.preventDefault();
      insertAroundSelection("*", "*", "italic text");
    }
  });

  if (!restoreDocument()) editor.value = SAMPLE;
  updateDocument();

  const bedantaSub = document.getElementById("bedanta-sub");
  if (bedantaSub) {
    const texts = [
      "Really Good Video Gamer",
      "Electrical Engineering Student",
      "Building Weird Internet Things"
    ];
    let textIndex = 0;
    window.setInterval(() => {
      textIndex = (textIndex + 1) % texts.length;
      bedantaSub.textContent = texts[textIndex];
      bedantaSub.classList.remove("text-change");
      void bedantaSub.offsetWidth;
      bedantaSub.classList.add("text-change");
    }, 2600);
  }
})();
