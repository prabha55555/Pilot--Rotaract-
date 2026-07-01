import PDFDocument from 'pdfkit'

/**
 * Downloads an image from a URL and returns a Buffer.
 * @param {string} url Image URL
 * @returns {Promise<Buffer|null>} Image buffer or null
 */
async function fetchImageBuffer(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP error ${res.status}`)
    const arrayBuffer = await res.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (err) {
    console.error(`⚠️ Failed to fetch image from ${url}:`, err.message)
    return null
  }
}

/**
 * Generates an activity report PDF using PDFKit.
 * @param {object} params Report parameters
 * @param {object} params.activity The activity record
 * @param {array} params.files Array of files attached to the activity
 * @param {string} params.approverName The name of the approver
 * @param {string} params.remarks Approval remarks
 * @param {string} params.approvalDate The date of approval
 * @returns {Promise<Buffer>} The generated PDF buffer
 */
export const generateActivityReportPDF = async ({ activity, files = [], approverName, remarks, approvalDate }) => {
  // Asynchronously pre-fetch all image attachments to avoid blocking stream write
  const imageFiles = files.filter(f => ['jpg', 'jpeg', 'png', 'webp'].includes((f.file_type || '').toLowerCase()))
  const fetchedImages = []

  for (const file of imageFiles) {
    const buffer = await fetchImageBuffer(file.file_url)
    if (buffer) {
      fetchedImages.push({ file_name: file.file_name, buffer })
    }
  }

  const pdfFiles = files.filter(f => (f.file_type || '').toLowerCase() === 'pdf')

  // Build the PDF Kit document
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        bufferPages: true // Allows post-pass page numbering
      })

      const buffers = []
      doc.on('data', buffers.push.bind(buffers))
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers)
        resolve(pdfData)
      })
      doc.on('error', (err) => {
        reject(err)
      })

      // Setup brand color palette
      const brandBlue = '#003DA5'
      const darkGray = '#1F2937'
      const lightGray = '#9CA3AF'
      const bgGray = '#F9FAFB'
      const accentBorder = '#E5E7EB'

      // ==========================================
      // PAGE 1: Header and Metadata Section
      // ==========================================

      // Top header color band
      doc.rect(40, 40, 515, 60).fill(brandBlue)

      // Header Titles
      doc.fillColor('#FFFFFF')
        .font('Helvetica-Bold')
        .fontSize(16)
        .text('PILOT - OFFICIAL ACTIVITY REPORT', 55, 52, { characterSpacing: 1 })

      doc.font('Helvetica')
        .fontSize(9)
        .text('ROTARACT DISTRICT 3220 - TRAINERS WORKSHOP', 55, 75, { characterSpacing: 0.5 })

      // Document Metadata Table Grid
      doc.y = 120

      // Draw background panel for metadata
      doc.rect(40, doc.y, 515, 100).fill(bgGray).stroke(accentBorder)

      doc.fillColor(darkGray)
        .font('Helvetica-Bold')
        .fontSize(10)

      // Left Column Metadata
      const startMetaY = doc.y + 15
      let metaY = startMetaY
      doc.text('PROJECT NAME:', 55, metaY).font('Helvetica').text(activity.title || '-', 160, metaY)

      metaY += 20
      doc.font('Helvetica-Bold').text('PARTICIPANT:', 55, metaY).font('Helvetica').text(activity.user?.name || '-', 160, metaY)

      metaY += 20
      doc.font('Helvetica-Bold').text('PILOT ID:', 55, metaY).font('Helvetica').text(activity.user?.pilot_id || '-', 160, metaY)

      metaY += 20
      doc.font('Helvetica-Bold').text('AVENUE:', 55, metaY).font('Helvetica').text(activity.avenue || '-', 160, metaY)

      // Right Column Metadata - align to same startMetaY
      metaY = startMetaY
      doc.font('Helvetica-Bold').text('CATEGORY:', 310, metaY).font('Helvetica').text(activity.category || '-', 420, metaY)

      metaY += 20
      doc.font('Helvetica-Bold').text('HOURS SPENT:', 310, metaY).font('Helvetica').text(activity.hours_conducted ? `${activity.hours_conducted} Hours` : '-', 420, metaY)

      metaY += 20
      doc.font('Helvetica-Bold').text('START DATE:', 310, metaY).font('Helvetica').text(activity.start_date ? new Date(activity.start_date).toLocaleDateString() : '-', 420, metaY)

      metaY += 20
      doc.font('Helvetica-Bold').text('LOCATION:', 310, metaY).font('Helvetica').text(activity.location || '-', 420, metaY)

      // Section 1: Detailed Project Description
      doc.y = 280
      doc.fillColor(brandBlue)
        .font('Helvetica-Bold')
        .fontSize(11)
        .text('PROJECT DESCRIPTION', 40, doc.y)

      doc.moveTo(40, doc.y + 15)
        .lineTo(555, doc.y + 15)
        .strokeColor(accentBorder)
        .lineWidth(1)
        .stroke()

      doc.fillColor(darkGray)
        .font('Helvetica')
        .fontSize(9.5)
        .text(activity.description || 'No description provided.', 40, doc.y + 25, {
          width: 515,
          align: 'justify',
          lineGap: 4
        })

      // Section 2: Minutes of Meeting (MOM) / Event Details
      doc.y = doc.y + 35

      // Ensure we don't overflow the page before drawing MOM
      if (doc.y > doc.page.height - 120) {
        doc.addPage()
        doc.y = 50
      }

      doc.fillColor(brandBlue)
        .font('Helvetica-Bold')
        .fontSize(11)
        .text('MINUTES OF MEETING (MOM) & EVENT DETAILS', 40, doc.y)

      doc.moveTo(40, doc.y + 15)
        .lineTo(555, doc.y + 15)
        .strokeColor(accentBorder)
        .lineWidth(1)
        .stroke()

      doc.fillColor(darkGray)
        .font('Helvetica')
        .fontSize(9.5)
        .text(activity.mom || 'No meeting minutes captured.', 40, doc.y + 25, {
          width: 515,
          align: 'justify',
          lineGap: 4
        })

      // Section 3: Evidence & Attachments
      // Check if we need a page break before Section 3
      if (doc.y > doc.page.height - 150) {
        doc.addPage()
        doc.y = 50
      } else {
        doc.y += 35
      }

      doc.fillColor(brandBlue)
        .font('Helvetica-Bold')
        .fontSize(11)
        .text('PROJECT EVIDENCE & ATTACHMENTS', 40, doc.y)

      doc.moveTo(40, doc.y + 15)
        .lineTo(555, doc.y + 15)
        .strokeColor(accentBorder)
        .lineWidth(1)
        .stroke()

      doc.y = doc.y + 25

      // Photos Grid
      if (fetchedImages.length > 0) {
        doc.fillColor(darkGray)
          .font('Helvetica-Bold')
          .fontSize(9.5)
          .text('Uploaded Images:', 40, doc.y)

        doc.y += 15

        let imageX = 40
        let imageY = doc.y

        for (let i = 0; i < fetchedImages.length; i++) {
          const img = fetchedImages[i]

          // Render image in a nice grid block
          try {
            doc.image(img.buffer, imageX, imageY, { fit: [240, 150] })
            doc.rect(imageX, imageY, 240, 150).stroke(accentBorder)
          } catch (imgErr) {
            console.error(`Failed to draw image ${img.file_name}:`, imgErr.message)
            doc.rect(imageX, imageY, 240, 150).fill('#F3F4F6').stroke(accentBorder)
            doc.fillColor(lightGray)
              .font('Helvetica-Bold')
              .fontSize(8)
              .text('[Image preview unavailable]', imageX + 60, imageY + 70)
          }

          // Move coordinates for next grid item
          if (i % 2 === 0) {
            imageX = 315
          } else {
            imageX = 40
            imageY += 175

            // Check if grid row overflows page
            if (imageY > doc.page.height - 180 && i < fetchedImages.length - 1) {
              doc.addPage()
              imageY = 50
              imageX = 40
            }
          }
        }
        doc.y = imageY + (fetchedImages.length % 2 === 0 ? 0 : 175)
      } else {
        doc.fillColor(lightGray)
          .font('Helvetica-Oblique')
          .fontSize(9.5)
          .text('No photos uploaded for this activity.', 40, doc.y)
        doc.y += 20
      }

      // Supporting PDF files links
      doc.y += 15
      if (pdfFiles.length > 0) {
        doc.fillColor(darkGray)
          .font('Helvetica-Bold')
          .fontSize(9.5)
          .text('Supporting PDF Documents:', 40, doc.y)

        doc.y += 15

        pdfFiles.forEach(pdf => {
          doc.fillColor(brandBlue)
            .font('Helvetica')
            .fontSize(9)
            .text(`• ${pdf.file_name || 'Report Document'} (Click to download)`, 50, doc.y, {
              link: pdf.file_url,
              underline: true
            })
          doc.y += 15
        })
      }

      // Section 4: Evaluation and Approval Sign-off Box
      if (doc.y > doc.page.height - 150) {
        doc.addPage()
        doc.y = 50
      } else {
        doc.y += 30
      }

      doc.fillColor(brandBlue)
        .font('Helvetica-Bold')
        .fontSize(11)
        .text('EVALUATION & APPROVAL SIGN-OFF', 40, doc.y)

      doc.moveTo(40, doc.y + 15)
        .lineTo(555, doc.y + 15)
        .strokeColor(accentBorder)
        .lineWidth(1)
        .stroke()

      const boxY = doc.y + 20
      doc.rect(40, boxY, 515, 80).fill('#ECFDF5').stroke('#10B981') // Green box for approval

      doc.fillColor('#047857')
        .font('Helvetica-Bold')
        .fontSize(10.5)
        .text('STATUS: APPROVED', 60, boxY + 15)

      doc.fillColor(darkGray)
        .font('Helvetica-Bold')
        .fontSize(9)
        .text('APPROVED BY:', 60, boxY + 35)
        .font('Helvetica')
        .text(approverName, 150, boxY + 35)
        .font('Helvetica-Bold')
        .text('DATE:', 330, boxY + 35)
        .font('Helvetica')
        .text(approvalDate ? new Date(approvalDate).toLocaleDateString() : '-', 375, boxY + 35)

      doc.font('Helvetica-Bold')
        .text('REMARKS:', 60, boxY + 52)
        .font('Helvetica')
        .text(remarks || 'Reviewed and approved by evaluation board.', 150, boxY + 52, { width: 380, height: 20 })

      // ==========================================
      // Post Pass: Draw Page Numbers and Footers
      // ==========================================
      const pages = doc.bufferedPageRange()
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i)

        // Temporarily disable bottom margin to prevent auto-page breaks when drawing footers
        const oldBottomMargin = doc.page.margins.bottom
        doc.page.margins.bottom = 0

        // Draw bottom footer
        doc.moveTo(40, doc.page.height - 45)
          .lineTo(555, doc.page.height - 45)
          .strokeColor(accentBorder)
          .lineWidth(0.5)
          .stroke()

        doc.fillColor(lightGray)
          .font('Helvetica')
          .fontSize(7.5)
          .text('PILOT  © ROTARACT DISTRICT 3220', 40, doc.page.height - 35)
          .text(`Page ${i + 1} of ${pages.count}`, 500, doc.page.height - 35)

        // Restore bottom margin
        doc.page.margins.bottom = oldBottomMargin
      }

      // Finish document
      doc.end()
    } catch (err) {
      console.error('❌ PDFKit generation error inside promise:', err)
      reject(err)
    }
  })
}
