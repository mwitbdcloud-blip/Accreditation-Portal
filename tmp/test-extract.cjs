const fs = require('fs');
const JSZip = require('jszip');

async function extractPages(filePath) {
  const data = fs.readFileSync(filePath);
  const zip = await JSZip.loadAsync(data);
  const docXml = await zip.file('word/document.xml').async('text');
  
  const pRegex = /<w:p[\s>].*?<\/w:p>/gs;
  const pMatches = docXml.match(pRegex) || [];
  
  const pages = [];
  let curLines = [];
  
  for (const p of pMatches) {
    if (p.includes('lastRenderedPageBreak') || p.includes('<w:br w:type="page"/>')) {
      if (curLines.length > 0) {
        pages.push(curLines);
        curLines = [];
      }
    }
    
    // Extract text from w:t
    const tMatches = [...p.matchAll(/<w:t[^>]*>(.*?)<\/w:t>/gs)].map(m => m[1]).join('');
    
    if (tMatches.trim()) {
      curLines.push(tMatches);
    }
  }
  if (curLines.length > 0) {
    pages.push(curLines);
  }
  
  console.log(filePath + ' -> Extracted ' + pages.length + ' pages');
  pages.forEach((page, idx) => {
    console.log(`Page ${idx+1} (${page.length} lines): "${(page[0] || '').slice(0, 70)}"`);
  });
}

async function main() {
  await extractPages('public/templates/Marketing Associate.docx');
  await extractPages('public/templates/Senior Marketing Associate.docx');
  await extractPages('public/templates/Marketing Manager.docx');
  await extractPages('public/templates/Marketing Director.docx');
  await extractPages('public/templates/Marketing Partner (Standard).docx');
}
main();
