import { PDFDocument, rgb } from "pdf-lib";
import fs from "node:fs";
import path from "node:path";

const COURSE_NAME = "Costura do Zero ao Profissional";
const FONTS_DIR = path.resolve("src/lib/certificate/fonts");

// A4 landscape
const PAGE_W = 841.89;
const PAGE_H = 595.28;
const MARGIN = 57;
const GOLD_BORDER = 3;
const CONTENT_PAD = 4;

const GOLD = rgb(0.788, 0.659, 0.298);
const DEEP_BROWN = rgb(0.239, 0.18, 0.118);
const WARM_GRAY = rgb(0.42, 0.353, 0.29);
const MUTED_GOLD = rgb(0.549, 0.471, 0.333);
const CREAM = rgb(0.961, 0.941, 0.91);
const WHITE_BG = rgb(0.98, 0.969, 0.941);
const DOT_COLOR = rgb(0.549, 0.471, 0.333);

function loadFont(filename: string): Uint8Array {
  return fs.readFileSync(path.join(FONTS_DIR, filename));
}

function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDate(date: Date): string {
  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
}

function centerX(pageW: number, textWidth: number): number {
  return (pageW - textWidth) / 2;
}

export async function generateCertificatePdf(
  studentName: string,
  completionDate: Date,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();

  const regularBytes = loadFont("HankenGrotesk-Regular.ttf");
  const semiBoldBytes = loadFont("HankenGrotesk-SemiBold.ttf");
  const boldBytes = loadFont("HankenGrotesk-Bold.ttf");

  const regular = await doc.embedFont(regularBytes);
  const semiBold = await doc.embedFont(semiBoldBytes);
  const bold = await doc.embedFont(boldBytes);

  const page = doc.addPage([PAGE_W, PAGE_H]);

  // Background
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: CREAM });

  // Dot pattern
  for (let x = 0; x < PAGE_W; x += 18) {
    for (let y = 0; y < PAGE_H; y += 18) {
      page.drawCircle({ x, y, size: 0.5, color: DOT_COLOR, opacity: 0.15 });
    }
  }

  // Gold border
  page.drawRectangle({
    x: MARGIN,
    y: MARGIN,
    width: PAGE_W - 2 * MARGIN,
    height: PAGE_H - 2 * MARGIN,
    color: GOLD,
  });

  // Cream padding
  const padX = MARGIN + GOLD_BORDER;
  const padY = MARGIN + GOLD_BORDER;
  const padW = PAGE_W - 2 * (MARGIN + GOLD_BORDER);
  const padH = PAGE_H - 2 * (MARGIN + GOLD_BORDER);
  page.drawRectangle({ x: padX, y: padY, width: padW, height: padH, color: CREAM });

  // White content area
  const cx = padX + CONTENT_PAD;
  const cy = padY + CONTENT_PAD;
  const cw = padW - 2 * CONTENT_PAD;
  const ch = padH - 2 * CONTENT_PAD;
  page.drawRectangle({ x: cx, y: cy, width: cw, height: ch, color: WHITE_BG });

  // Content center
  const center = PAGE_W / 2;

  // Course header
  let text = COURSE_NAME;
  let size = 14;
  let w = semiBold.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: centerX(PAGE_W, w),
    y: 430,
    size,
    font: semiBold,
    color: DEEP_BROWN,
  });

  // "CERTIFICADO"
  text = "CERTIFICADO";
  size = 28;
  w = bold.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: centerX(PAGE_W, w),
    y: 380,
    size,
    font: bold,
    color: DEEP_BROWN,
  });

  // Gold line 1
  const lineW = cw * 0.5;
  const lineCenter = center;
  page.drawRectangle({
    x: lineCenter - lineW / 2,
    y: 345,
    width: lineW,
    height: 1.5,
    color: GOLD,
  });

  // Student name
  text = studentName;
  size = 20;
  w = bold.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: centerX(PAGE_W, w),
    y: 300,
    size,
    font: bold,
    color: DEEP_BROWN,
  });

  // Description
  text = "completou todos os requisitos do curso";
  size = 11;
  w = regular.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: centerX(PAGE_W, w),
    y: 270,
    size,
    font: regular,
    color: WARM_GRAY,
  });

  // Gold line 2
  page.drawRectangle({
    x: lineCenter - lineW / 2,
    y: 235,
    width: lineW,
    height: 1.5,
    color: GOLD,
  });

  // Date
  text = `Data de conclusão: ${formatDate(completionDate)}`;
  size = 10;
  w = regular.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: centerX(PAGE_W, w),
    y: 205,
    size,
    font: regular,
    color: MUTED_GOLD,
  });

  // Signature lines
  const sigY = 130;
  const sigW = 140;
  const sigGap = 60;
  const sigCenter = center;

  // "Professora"
  page.drawRectangle({
    x: sigCenter - sigGap / 2 - sigW,
    y: sigY + 18,
    width: sigW,
    height: 0.5,
    color: DEEP_BROWN,
  });
  text = "Professora";
  size = 8;
  w = regular.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: sigCenter - sigGap / 2 - sigW / 2 - w / 2,
    y: sigY + 5,
    size,
    font: regular,
    color: WARM_GRAY,
  });

  // "Direção"
  page.drawRectangle({
    x: sigCenter + sigGap / 2,
    y: sigY + 18,
    width: sigW,
    height: 0.5,
    color: DEEP_BROWN,
  });
  text = "Direção";
  size = 8;
  w = regular.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: sigCenter + sigGap / 2 + sigW / 2 - w / 2,
    y: sigY + 5,
    size,
    font: regular,
    color: WARM_GRAY,
  });

  return doc.save();
}

export function buildCertificateFilename(studentName: string): string {
  const sanitized = sanitizeName(studentName);
  return `certificado-costura-do-zero-ao-profissional-${sanitized}.pdf`;
}
