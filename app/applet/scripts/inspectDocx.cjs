const fs = require('fs');
const JSZip = require('jszip');

async function parseDocx(file) {
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
  
  console.log('==========================================');
  console.log(file, 'TOTAL PAGES:', page);
  for (let i = 1; i <= page; i++) {
    console.log(`\n=== PAGE ${i} (${(pages[i] || []).length} paragraphs) ===`);
    console.log((pages[i] || []).slice(0, 10).join('\n'));
  }
}

async function run() {
  await parseDocx('public/templates/Marketing Associate.docx');
}
run();
