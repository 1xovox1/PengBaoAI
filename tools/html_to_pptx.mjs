import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { load } from "cheerio";
import pptxgen from "pptxgenjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getArg(name) {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}

function readUtf8(p) {
  return fs.readFileSync(p, { encoding: "utf8" });
}

function extractSlides(html) {
  const $ = load(html);
  const sections = $("section.slide").toArray();
  if (!sections.length) {
    throw new Error("No slides found. HTML must include <section class='slide'> blocks.");
  }

  return sections.map((el) => {
    const $el = $(el);
    const title = $el.find("h2, h1").first().text().trim() || "Untitled";

    const bullets = [];
    $el.find("ul").each((_, ul) => {
      $(ul)
        .children("li")
        .each((__, li) => {
          const t = $(li).text().replace(/\s+/g, " ").trim();
          if (t) bullets.push(t);
        });
    });

    const speaker = $el.find(".speaker").first().text().replace(/\s+/g, " ").trim() || "";
    return { title, bullets, speaker };
  });
}

function buildPptx(slides, outPath) {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE"; // 13.33 x 7.5

  // Minimal, clean style
  const FONT = "Microsoft YaHei";
  const COLOR_TITLE = "111827"; // gray-900
  const COLOR_TEXT = "111827";
  const COLOR_MUTED = "4B5563"; // gray-600
  const COLOR_ACCENT = "2563EB"; // blue-600

  slides.forEach((s, idx) => {
    const slide = pptx.addSlide();
    slide.background = { color: "FFFFFF" };

    // Title
    slide.addText(s.title, {
      x: 0.6,
      y: 0.4,
      w: 12.2,
      h: 0.6,
      fontFace: FONT,
      fontSize: idx === 0 ? 36 : 28,
      bold: true,
      color: COLOR_TITLE,
    });

    // Accent line under title
    slide.addShape(pptx.ShapeType.line, {
      x: 0.6,
      y: 1.1,
      w: 12.2,
      h: 0,
      line: { color: COLOR_ACCENT, width: 2 },
    });

    // Bullets
    const bodyY = idx === 0 ? 1.5 : 1.45;
    const bulletText = (s.bullets?.length ? s.bullets : ["（此页无要点）"]).map((b) => `• ${b}`).join("\n");
    slide.addText(bulletText, {
      x: 0.8,
      y: bodyY,
      w: 12.0,
      h: 5.2,
      fontFace: FONT,
      fontSize: 18,
      color: COLOR_TEXT,
      valign: "top",
      lineSpacingMultiple: 1.2,
    });

    // Speaker notes (optional) at bottom small
    if (s.speaker) {
      slide.addText(`讲法：${s.speaker}`, {
        x: 0.8,
        y: 6.85,
        w: 12.0,
        h: 0.5,
        fontFace: FONT,
        fontSize: 12,
        color: COLOR_MUTED,
      });
    }
  });

  pptx.writeFile({ fileName: outPath });
}

function main() {
  const htmlArg = getArg("--html");
  const outArg = getArg("--out");
  if (!htmlArg || !outArg) {
    console.error("Usage: node html_to_pptx.mjs --html <file.html> --out <file.pptx>");
    process.exit(2);
  }

  const htmlPath = path.resolve(process.cwd(), htmlArg);
  const outPath = path.resolve(process.cwd(), outArg);

  const html = readUtf8(htmlPath);
  const slides = extractSlides(html);
  buildPptx(slides, outPath);
  console.log(`OK: wrote ${outPath}`);
}

main();

