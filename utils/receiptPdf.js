// utils/receiptPdf.js
// Generates a printable PDF receipt using pdfkit, styled to match the
// official Royal Gem Mathematical School receipt template.
// Returns a Buffer so callers can either stream it to the response
// or save it elsewhere.

import PDFDocument from "pdfkit";

// ── Brand colors (sampled from the official receipt template) ────
const PURPLE_DARK  = "#8e2a7d"; // header / footer band
const PINK_LIGHT   = "#fce4f3"; // content area background
const PINK_ACCENT  = "#f056f0"; // labels, accents
const TEXT_DARK    = "#1a1a1a";
const GRAY         = "#6b7280";
const WHITE        = "#ffffff";
const BORDER       = "#e5b8dc";

const PAGE_W = 595.28; // A4 width in points
const MARGIN = 0;      // we draw the header full-bleed ourselves

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : "-";

// ── Number → words, for the "sum of" line ─────────────────────────
const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function threeDigitsToWords(n) {
  let str = "";
  if (n >= 100) {
    str += `${ONES[Math.floor(n / 100)]} Hundred`;
    n %= 100;
    if (n) str += " and ";
  }
  if (n >= 20) {
    str += TENS[Math.floor(n / 10)];
    if (n % 10) str += `-${ONES[n % 10]}`;
  } else if (n > 0) {
    str += ONES[n];
  }
  return str;
}

function numberToWords(num) {
  if (num === 0) return "Zero";
  const units = ["", "Thousand", "Million", "Billion", "Trillion"];
  let parts = [];
  let unitIndex = 0;
  let n = Math.floor(num);

  while (n > 0) {
    const chunk = n % 1000;
    if (chunk) {
      const chunkWords = threeDigitsToWords(chunk) + (units[unitIndex] ? ` ${units[unitIndex]}` : "");
      parts.unshift(chunkWords);
    }
    n = Math.floor(n / 1000);
    unitIndex++;
  }

  return parts.join(", ");
}

function amountInWords(amount) {
  const naira = Math.floor(amount);
  const kobo  = Math.round((amount - naira) * 100);

  let result = `${numberToWords(naira)} Naira`;
  if (kobo > 0) {
    result += `, ${numberToWords(kobo)} Kobo`;
  }
  return `${result} Only.`;
}

const nairaFmt = (n) =>
  `N${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

/**
 * Builds a PDF receipt buffer styled after the official Royal Gem
 * receipt template.
 * @param {Object} receipt - populated Receipt document (student, feeStatement, issuedBy)
 * @returns {Promise<Buffer>}
 */
export const buildReceiptPdf = (receipt) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 0 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const student  = receipt.student || {};
      const cashier  = receipt.issuedBy?.name || "System (Automated)";
      const isOnline = receipt.paymentGateway === "paystack";

      const studentName = `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim() || "-";
      // "Received from" is the payer (usually a parent/guardian). Adjust the
      // field names below if your Receipt/Student schema stores this
      // differently (e.g. receipt.payerName, student.parentName).
      const payerName =
        receipt.payerName || student.parentName || studentName;

      const paymentFor =
        receipt.description ||
        `${studentName} ${receipt.term || ""} ${receipt.session || ""} School Fees`.replace(/\s+/g, " ").trim();

      // ═══════════════════════════════════════════════════════
      // HEADER BAND
      // ═══════════════════════════════════════════════════════
      const headerH = 130;
      doc.rect(0, 0, PAGE_W, headerH).fill(PURPLE_DARK);

      // Logo badge (circle with monogram — swap for doc.image() if you
      // have the actual crest as a PNG/JPG file)
      doc.circle(75, 62, 38).lineWidth(2).stroke(WHITE);
      doc.circle(75, 62, 32).lineWidth(1).stroke(WHITE);
      doc
        .fillColor(WHITE)
        .font("Helvetica-Bold")
        .fontSize(20)
        .text("RG", 75 - 20, 62 - 12, { width: 40, align: "center" });
      doc
        .fontSize(6)
        .font("Helvetica")
        .text("NURTURING TO FLOURISH", 75 - 55, 62 + 18, { width: 110, align: "center" });

      // Tagline (top right)
      doc
        .fillColor(WHITE)
        .fontSize(8)
        .font("Helvetica")
        .text(
          "Sales And Distribution of Educational Materials, After School Lesson, Tutorial for External Exams, Mathematics Improvement Services, On-the-job Training for Teachers",
          330, 22, { width: 220, align: "left", lineGap: 1 }
        );

      // School name + receipt number
      doc
        .fillColor(WHITE)
        .font("Helvetica-Bold")
        .fontSize(19)
        .text("ROYAL GEM MATHEMATICAL", 30, 90);
      doc
        .fontSize(19)
        .text(`SCHOOL RECEIPT No: ${receipt.receiptNumber || "-"}`, 30, 112);

      // ═══════════════════════════════════════════════════════
      // ADDRESS STRIP
      // ═══════════════════════════════════════════════════════
      const stripH = 34;
      doc.rect(0, headerH, PAGE_W, stripH).fill(WHITE);
      doc
        .fillColor(TEXT_DARK)
        .fontSize(8)
        .font("Helvetica")
        .text(
          "15, Royal Gem Avenue, Ayonnusi Estate, Off Sagamu Road, Ikorodu, Lagos State. " +
          "Annex: 6 Main Street, Suncity Estate, Galadimawa, Abuja",
          30, headerH + 8, { width: 535 }
        );
      doc
        .font("Helvetica-Bold")
        .text("Tel: ", 30, headerH + 20, { continued: true })
        .font("Helvetica")
        .text("07037199498, 08034091055.  ", { continued: true })
        .font("Helvetica-Bold")
        .text("E-mail: ", { continued: true })
        .fillColor(PINK_ACCENT)
        .font("Helvetica")
        .text("school.royalgem@gmail.com");

      // ═══════════════════════════════════════════════════════
      // CONTENT AREA (light pink background)
      // ═══════════════════════════════════════════════════════
      const contentY = headerH + stripH;
      const contentH = 430;
      doc.rect(0, contentY, PAGE_W, contentH).fill(PINK_LIGHT);

      let y = contentY + 30;

      // "OFFICIAL RECEIPT" tag + date
      doc.rect(30, y, 160, 26).fill(PURPLE_DARK);
      doc
        .fillColor(WHITE)
        .font("Helvetica-Bold")
        .fontSize(11)
        .text("OFFICIAL RECEIPT", 30, y + 8, { width: 160, align: "center" });

      doc
        .fillColor(TEXT_DARK)
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(`Date: ${fmtDate(receipt.issuedAt)}`, 350, y + 8, { width: 215, align: "right" });

      y += 55;

      const labeledLine = (label, value) => {
        doc
          .fillColor(PINK_ACCENT)
          .font("Helvetica-Bold")
          .fontSize(11)
          .text(`${label}; `, 30, y, { continued: true })
          .fillColor(TEXT_DARK)
          .font("Helvetica-Bold")
          .text(value, { width: 500 });
        y = doc.y + 14;
      };

      labeledLine("Received from", payerName);
      labeledLine("The sum of", amountInWords(receipt.amount));
      labeledLine("Being payment for", paymentFor);

      y += 10;

      // Amount box
      doc.rect(30, y, 220, 55).lineWidth(2).stroke(PURPLE_DARK);
      doc
        .fillColor(TEXT_DARK)
        .font("Helvetica-Bold")
        .fontSize(24)
        .text(nairaFmt(receipt.amount), 30, y + 16, { width: 220, align: "center" });

      // Signature block
      doc
        .fillColor(PINK_ACCENT)
        .font("Helvetica-Oblique")
        .fontSize(13)
        .text("For:", 400, y + 10, { continued: true })
        .font("Helvetica-BoldOblique")
        .text(" Royal Gem");
      doc
        .fillColor(GRAY)
        .font("Helvetica")
        .fontSize(8)
        .text(
          isOnline ? "Paystack (Online Payment)" : `Processed by: ${cashier}`,
          400, y + 40, { width: 150, align: "left" }
        );

      y += 90;

      // Extra details (kept from the original system version — reference,
      // method, status — shown as a compact line so nothing functional
      // is lost while matching the template's clean look)
      doc
        .fillColor(GRAY)
        .font("Helvetica")
        .fontSize(8)
        .text(
          `Payment Method: ${(receipt.paymentMethod || "-").replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}` +
          (receipt.paymentReference ? `   |   Reference: ${receipt.paymentReference}` : "") +
          `   |   Status: ${receipt.status === "issued" ? "Issued" : "Void"}`,
          30, y, { width: 535 }
        );

      // Decorative 3-segment bar
      const barY = contentY + contentH - 34;
      const segW = 535 / 3;
      doc.rect(30, barY, segW, 10).fill(PURPLE_DARK);
      doc.rect(30 + segW, barY, segW, 10).fill("#f6cbe8");
      doc.rect(30 + segW * 2, barY, segW, 10).fill(PURPLE_DARK);

      // ═══════════════════════════════════════════════════════
      // FOOTER BAND
      // ═══════════════════════════════════════════════════════
      const footerY = contentY + contentH;
      const footerH = 60;
      doc.rect(0, footerY, PAGE_W, footerH).fill(PURPLE_DARK);

      const colY = footerY + 14;
      doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(8);
      doc.text("ADDRESSES", 30, colY);
      doc.text("TELEPHONE", 230, colY);
      doc.text("EMAILS", 400, colY);

      doc.font("Helvetica").fontSize(7.5);
      doc.text("6, Main Street, Suncity Estate,\nGaladimawa, Abuja", 30, colY + 12, { width: 190 });
      doc.text("+2348034091055,\n+2347037199498", 230, colY + 12, { width: 150 });
      doc.text("school.royalgem@gmail.com", 400, colY + 12, { width: 160 });

      // ── Auto-generated notice (below the branded template, on a
      // fresh section so it never crowds the design above) ──────
      doc
        .fillColor(GRAY)
        .fontSize(7)
        .font("Helvetica")
        .text(
          `This is a computer-generated receipt and does not require a signature.  Generated on ${fmtDate(new Date())}.`,
          30, footerY + footerH + 12, { width: 535, align: "center" }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

export default { buildReceiptPdf };