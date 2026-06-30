// utils/receiptPdf.js
// Generates a printable PDF receipt using pdfkit.
// Returns a Buffer so callers can either stream it to the response
// or save it elsewhere.

import PDFDocument from "pdfkit";

const fmt = (n) =>
  `NGN ${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : "-";

const PINK = "#f056f0";
const DARK = "#1f2937";
const GRAY = "#6b7280";

/**
 * Builds a PDF receipt buffer.
 * @param {Object} receipt - populated Receipt document (student, feeStatement, issuedBy)
 * @returns {Promise<Buffer>}
 */
export const buildReceiptPdf = (receipt) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const student = receipt.student || {};
      const cashier = receipt.issuedBy?.name || "System (Automated)";

      // ── Header ──────────────────────────────────────────────
      doc
        .fillColor(DARK)
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("Royal Gem Schools", 50, 50);

      doc
        .fillColor(GRAY)
        .fontSize(9)
        .font("Helvetica")
        .text("Nurturing to Flourish", 50, 74);

      doc
        .fillColor(PINK)
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("PAYMENT RECEIPT", 400, 50, { width: 145, align: "right" });

      doc
        .fillColor(DARK)
        .fontSize(13)
        .font("Helvetica-Bold")
        .text(receipt.receiptNumber, 400, 66, { width: 145, align: "right" });

      doc
        .fillColor(GRAY)
        .fontSize(9)
        .font("Helvetica")
        .text(fmtDate(receipt.issuedAt), 400, 84, { width: 145, align: "right" });

      // Divider
      doc.moveTo(50, 110).lineTo(545, 110).strokeColor("#e5e7eb").stroke();

      // ── Student info ────────────────────────────────────────
      let y = 130;
      const col1 = 50, col2 = 300;

      const row = (label, value, x) => {
        doc.fillColor(GRAY).fontSize(8).font("Helvetica").text(label.toUpperCase(), x, y);
        doc.fillColor(DARK).fontSize(11).font("Helvetica-Bold").text(value || "-", x, y + 12);
      };

      row("Student Name", `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim(), col1);
      row("Registration Number", student.regNumber, col2);
      y += 38;
      row("Class", receipt.classLevel, col1);
      row("Session", receipt.session, col2);
      y += 38;
      row("Term", receipt.term, col1);
      row("Status", receipt.status === "issued" ? "Issued" : "Void", col2);

      y += 50;
      doc.moveTo(50, y).lineTo(545, y).strokeColor("#e5e7eb").stroke();
      y += 20;

      // ── Payment details table ───────────────────────────────
      doc.fillColor(DARK).fontSize(12).font("Helvetica-Bold").text("Payment Details", 50, y);
      y += 25;

      // Table header
      doc.rect(50, y, 495, 25).fill("#f9fafb");
      doc.fillColor(GRAY).fontSize(9).font("Helvetica-Bold");
      doc.text("DESCRIPTION", 60, y + 8);
      doc.text("METHOD", 280, y + 8);
      doc.text("REFERENCE", 380, y + 8);
      doc.text("AMOUNT", 480, y + 8, { width: 60, align: "right" });
      y += 25;

      // Table row
      doc.rect(50, y, 495, 30).strokeColor("#e5e7eb").stroke();
      doc.fillColor(DARK).fontSize(9).font("Helvetica");
      doc.text(receipt.description || "School fee payment", 60, y + 10, { width: 210 });
      doc.text(
        receipt.paymentMethod
          ?.replace("_", " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()) || "-",
        280, y + 10, { width: 90 }
      );
      doc.fontSize(8).text(receipt.paymentReference || "-", 380, y + 11, { width: 95 });
      doc.fontSize(10).font("Helvetica-Bold").text(fmt(receipt.amount), 480, y + 10, { width: 60, align: "right" });
      y += 50;

      // ── Total ───────────────────────────────────────────────
      doc.rect(330, y, 215, 40).fill(PINK);
      doc.fillColor("#ffffff").fontSize(10).font("Helvetica").text("AMOUNT PAID", 345, y + 8);
      doc.fontSize(16).font("Helvetica-Bold").text(fmt(receipt.amount), 345, y + 20);
      y += 70;

      // ── Cashier / Gateway ───────────────────────────────────
      doc.fillColor(GRAY).fontSize(8).font("Helvetica").text("PROCESSED BY", 50, y);
      doc.fillColor(DARK).fontSize(10).font("Helvetica-Bold").text(
        receipt.paymentGateway === "paystack" ? "Paystack (Online Payment)" : cashier,
        50, y + 12
      );

      // ── Footer ──────────────────────────────────────────────
      const footerY = 740;
      doc.moveTo(50, footerY).lineTo(545, footerY).strokeColor("#e5e7eb").stroke();
      doc
        .fillColor(GRAY)
        .fontSize(8)
        .font("Helvetica")
        .text(
          "This is a computer-generated receipt and does not require a signature.",
          50, footerY + 10, { width: 495, align: "center" }
        );
      doc.text(
        `Generated on ${fmtDate(new Date())} - Royal Gem Schools`,
        50, footerY + 24, { width: 495, align: "center" }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

export default { buildReceiptPdf };