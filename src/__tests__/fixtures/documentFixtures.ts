import JSZip from 'jszip';

/**
 * Creates a valid multi-page binary PDF with selectable text on specified pages.
 */
export function createMockPdf(pages: string[]): Uint8Array {
  const objects: string[] = [];
  const kids: string[] = [];

  const pageCount = pages.length;

  // Font object (object index will be pageCount * 2 + 3)
  const fontObjIndex = pageCount * 2 + 3;

  for (let i = 0; i < pageCount; i++) {
    const pageObjIndex = 3 + i * 2;
    const contentObjIndex = 4 + i * 2;
    kids.push(`${pageObjIndex} 0 R`);

    const pageText = pages[i];
    // Simple ASCII escaping for parentheses
    const safeText = pageText.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    const contentStream = pageText.trim()
      ? `BT /F1 12 Tf 50 720 Td (${safeText}) Tj ET`
      : '';

    // Page object
    objects.push(
      `${pageObjIndex} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontObjIndex} 0 R >> >> /Contents ${contentObjIndex} 0 R >>\nendobj`
    );

    // Contents object
    objects.push(
      `${contentObjIndex} 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj`
    );
  }

  // Catalog (1 0 obj)
  const catalogObj = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`;

  // Pages parent (2 0 obj)
  const pagesParentObj = `2 0 obj\n<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${pageCount} >>\nendobj`;

  // Font obj
  const fontObj = `${fontObjIndex} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`;

  const allObjects = [catalogObj, pagesParentObj, ...objects, fontObj];

  let body = '%PDF-1.4\n';
  const offsets: number[] = [];

  for (const obj of allObjects) {
    offsets.push(body.length);
    body += obj + '\n';
  }

  const xrefOffset = body.length;
  body += `xref\n0 ${allObjects.length + 1}\n0000000000 65535 f \n`;

  for (const offset of offsets) {
    body += String(offset).padStart(10, '0') + ' 00000 n \n';
  }

  body += `trailer\n<< /Size ${allObjects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new TextEncoder().encode(body);
}

/**
 * Creates a valid multi-page PDF where all pages contain NO text streams (simulating scanned/image pages).
 */
export function createBlankPdf(numPages = 2): Uint8Array {
  const emptyPages = new Array(numPages).fill('');
  return createMockPdf(emptyPages);
}

export interface DocxBlockDef {
  type: 'heading' | 'p';
  text: string;
  level?: number;
}

/**
 * Creates a valid binary DOCX (Office Open XML ZIP package) with custom headings and paragraphs.
 */
export async function createMockDocx(blocks: DocxBlockDef[]): Promise<ArrayBuffer> {
  const zip = new JSZip();

  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
  );

  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );

  let paragraphsXml = '';

  for (const block of blocks) {
    if (block.type === 'heading') {
      const headingLevel = block.level || 1;
      paragraphsXml += `
    <w:p>
      <w:pPr><w:pStyle w:val="Heading${headingLevel}"/></w:pPr>
      <w:r><w:t>${escapeXml(block.text)}</w:t></w:r>
    </w:p>`;
    } else {
      paragraphsXml += `
    <w:p>
      <w:r><w:t>${escapeXml(block.text)}</w:t></w:r>
    </w:p>`;
    }
  }

  zip.file(
    'word/document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>${paragraphsXml}
  </w:body>
</w:document>`
  );

  return await zip.generateAsync({ type: 'arraybuffer' });
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
