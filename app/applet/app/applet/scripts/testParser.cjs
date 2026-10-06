const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

async function parseDocxToStructuredPages(buffer, tagMap) {
  const zip = await JSZip.loadAsync(buffer);
  const docXml = await zip.file('word/document.xml').async('text');

  const pRegex = /<w:p[\s>](.*?)<\/w:p>/gs;
  const pages = [[]];
  let curPage = 0;

  let match;
  while ((match = pRegex.exec(docXml)) !== null) {
    const pXml = match[1];
    if (pXml.includes('lastRenderedPageBreak') || pXml.includes('w:type="page"')) {
      curPage++;
      pages[curPage] = [];
    }

    const jcMatch = pXml.match(/<w:jc\s+w:val="([^"]+)"/);
    const align = jcMatch ? jcMatch[1] : 'left';

    const isBold = /<w:b(\/|>|\s)/.test(pXml) && !/<w:b\s+w:val="(0|false|none)"\/>/.test(pXml);
    const szMatch = pXml.match(/<w:sz\s+w:val="(\d+)"/);
    const sz = szMatch ? parseInt(szMatch[1]) / 2 : 10;

    const tRegex = /<w:t(?:\s+[^>]*)?>(.*?)<\/w:t>/gs;
    let tMatch;
    let text = '';
    while ((tMatch = tRegex.exec(pXml)) !== null) {
      text += tMatch[1];
    }

    if (pXml.includes('insert_image') || /\{\{\s*insert_image/.test(pXml)) {
      const imgM = pXml.match(/\{\{\s*insert_image\s+([^}\s]+)/);
      if (imgM) text += `{{insert_image ${imgM[1]}}}`;
    }

    text = text.trim();
    if (text) {
      text = text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");

      // Replace tags
      for (const [tag, val] of Object.entries(tagMap)) {
        if (text.includes(tag)) {
          text = text.split(tag).join(val);
        }
      }

      pages[curPage].push({
        text,
        align,
        isBold,
        sz,
        isImage: text.includes('{{insert_image'),
      });
    }
  }
  return pages;
}

async function testAll() {
  const baseDir = path.resolve(__dirname, '../../public/templates');
  const files = [
    'Marketing Associate.docx',
    'Senior Marketing Associate.docx',
    'Marketing Manager.docx',
    'Marketing Director.docx',
    'Marketing Partner (Standard).docx',
  ];

  const tagMap = {
    '{{firstname}}': 'Elena',
    '{{middlename}}': 'Patricia',
    '{{surname}}': 'Reyes',
    '{{address}}': 'Unit 28B One Eastwood Avenue, Eastwood City, Bagumbayan, Quezon City',
    '{{tin}}': '198-442-780-000',
    '{{age}}': '38',
    '{{citizenship}}': 'Filipino',
  };

  for (const f of files) {
    const fullP = path.join(baseDir, f);
    if (!fs.existsSync(fullP)) {
      console.log('File does not exist:', fullP);
      continue;
    }
    const buf = fs.readFileSync(fullP);
    const pages = await parseDocxToStructuredPages(buf, tagMap);
    console.log(`\n==========================================\nFILE: ${f} -> Extracted ${pages.length} Pages`);
    pages.forEach((p, idx) => {
      console.log(`  Page ${idx + 1} (${p.length} items): "${(p[0]?.text || '').slice(0, 60)}"`);
    });
  }
}

testAll();
