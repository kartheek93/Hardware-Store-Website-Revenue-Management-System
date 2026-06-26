import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { STORE, formatCurrency, billNumber, formatDate } from '@/lib/utils'

/**
 * Generate (and optionally auto-download) a printable invoice PDF.
 *
 * @param {object}   bill      bills row
 * @param {object[]} items     bill_items rows
 * @param {object}   customer  { name, phone, address }
 * @param {object}   opts      { autoSave?: boolean }
 * @returns {jsPDF}  the document (so callers can .output('bloburl') for preview)
 */
export function generateBillPDF(bill, items, customer, opts = {}) {
  const { autoSave = true } = opts
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const M = 40 // margin
  const ORANGE = [216, 90, 48]
  const DARK = [31, 30, 28]
  const GRAY = [107, 106, 101]

  // ── Header band ──
  doc.setFillColor(...ORANGE)
  doc.rect(0, 0, pageWidth, 8, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...DARK)
  doc.text(STORE.name, M, 56)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...GRAY)
  doc.text(STORE.address, M, 72)
  doc.text(`Phone: ${STORE.phone}`, M, 85)
  doc.text(`GSTIN: ${STORE.gst}`, M, 98)

  // INVOICE label (right)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(...ORANGE)
  doc.text('INVOICE', pageWidth - M, 56, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...DARK)
  doc.text(billNumber(bill.id), pageWidth - M, 74, { align: 'right' })
  doc.setTextColor(...GRAY)
  doc.text(formatDate(bill.created_at), pageWidth - M, 88, { align: 'right' })

  // ── Bill-to ──
  let y = 128
  doc.setDrawColor(231, 229, 224)
  doc.line(M, y - 14, pageWidth - M, y - 14)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...GRAY)
  doc.text('BILL TO', M, y)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...DARK)
  doc.text(customer?.name || 'Walk-in customer', M, y + 16)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...GRAY)
  if (customer?.phone) doc.text(`Phone: ${customer.phone}`, M, y + 30)
  if (customer?.address) {
    const lines = doc.splitTextToSize(customer.address, 240)
    doc.text(lines, M, y + 43)
  }

  // Payment status (right)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...GRAY)
  doc.text('STATUS', pageWidth - M, y, { align: 'right' })
  doc.setFontSize(12)
  doc.setTextColor(
    bill.payment_status === 'Paid' ? 46 : 183,
    bill.payment_status === 'Paid' ? 125 : 121,
    bill.payment_status === 'Paid' ? 82 : 31
  )
  doc.text(String(bill.payment_status || 'Outstanding'), pageWidth - M, y + 16, { align: 'right' })

  // ── Items table ──
  autoTable(doc, {
    startY: y + 70,
    head: [['#', 'Product', 'Qty', 'Unit Price', 'Total']],
    body: items.map((it, i) => [
      i + 1,
      it.product_name,
      it.quantity,
      formatCurrency(it.unit_price),
      formatCurrency(it.line_total),
    ]),
    theme: 'striped',
    headStyles: { fillColor: DARK, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: DARK },
    alternateRowStyles: { fillColor: [250, 250, 248] },
    columnStyles: {
      0: { cellWidth: 28, halign: 'center' },
      2: { halign: 'center', cellWidth: 50 },
      3: { halign: 'right', cellWidth: 90 },
      4: { halign: 'right', cellWidth: 90 },
    },
    margin: { left: M, right: M },
  })

  // ── Totals ──
  const afterTable = doc.lastAutoTable.finalY + 18
  const labelX = pageWidth - M - 170
  const valueX = pageWidth - M
  let ty = afterTable

  const row = (label, value, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(bold ? 12 : 10)
    doc.setTextColor(...(bold ? DARK : GRAY))
    doc.text(label, labelX, ty)
    doc.setTextColor(...DARK)
    doc.text(value, valueX, ty, { align: 'right' })
    ty += bold ? 22 : 18
  }

  row('Subtotal', formatCurrency(bill.subtotal))
  row(`GST (${Number(bill.gst_rate)}%)`, formatCurrency(bill.gst_amount))

  doc.setDrawColor(231, 229, 224)
  doc.line(labelX, ty - 8, valueX, ty - 8)
  row('Grand Total', formatCurrency(bill.total_amount), true)

  // ── Footer ──
  const pageHeight = doc.internal.pageSize.getHeight()
  doc.setDrawColor(231, 229, 224)
  doc.line(M, pageHeight - 70, pageWidth - M, pageHeight - 70)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...ORANGE)
  doc.text('Thank you for your business', pageWidth / 2, pageHeight - 48, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...GRAY)
  doc.text(
    'This is a computer-generated invoice.',
    pageWidth / 2,
    pageHeight - 34,
    { align: 'center' }
  )

  if (autoSave) doc.save(`${billNumber(bill.id)}.pdf`)
  return doc
}
