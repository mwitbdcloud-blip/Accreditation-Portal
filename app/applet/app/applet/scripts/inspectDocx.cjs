const fs = require('fs');
const JSZip = require('jszip');

async function dumpDocx(file) {
  const buf = fs.readFileSync(file);
  const zip = await JSZip.loadAsync(buf);
  const docXml = await zip.file('word/document.xml').async('text');
  
  const pRegex = /<w:p[\s>](.*?)<\/w:p>/gs;
  let pMatch;
  let page = 1;
  const pages = { 1: [] };
  
  while ((pMatch = pRegex.exec(docXml)) !== null) {
    const pContent = pMatch[1];
    if (pContent.includes('lastRenderedPageBreak') || pContent.includes('w:type="page"')) {
      page++;
      pages[page] = [];
    }
    const tRegex = /<w:t(?:\s+[^>]*)?>(.*?)<\/w:t>/gs;
    let tMatch;
    let pText = '';
    while ((tMatch = tRegex.exec(pContent)) !== null) {
      pText += tMatch[1];
    }
    if (pContent.includes('insert_image') || /\{\{\s*insert_image/.test(pContent)) {
      const imgM = pContent.match(/\{\{\s*insert_image\s+[^}]+\}\}/);
      if (imgM) pText += ' ' + imgM[0];
    }
    pText = pText.trim();
    if (pText) {
      pText = pText
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
      pages[page].push(pText);
    }
  }
  
  let out = `\n==========================================\nFILE: ${file} (TOTAL PAGES: ${page})\n`;
  for (let i = 1; i <= page; i++) {
    out += `\n--- PAGE ${i} (${(pages[i] || []).length} paragraphs) ---\n`;
    out += (pages[i] || []).join('\n') + '\n';
  }
  return out;
}

async function run() {
  const path = require('path');
  const baseDir = path.resolve(__dirname, '../../public/templates');
  const files = [
    path.join(baseDir, 'Marketing Associate.docx'),
    path.join(baseDir, 'Senior Marketing Associate.docx'),
    path.join(baseDir, 'Marketing Manager.docx'),
    path.join(baseDir, 'Marketing Director.docx'),
    path.join(baseDir, 'Marketing Partner (Standard).docx'),
  ];
  let allOut = '';
  for (const f of files) {
    console.log('Processing:', f);
    allOut += await dumpDocx(f);
  }
  const outPath = path.resolve(__dirname, '../../all_templates_dump.txt');
  fs.writeFileSync(outPath, allOut);
  console.log('Successfully wrote dump to:', outPath);
}
run();
