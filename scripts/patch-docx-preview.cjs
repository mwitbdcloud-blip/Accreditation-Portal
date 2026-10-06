const fs = require('fs');
const path = require('path');

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 1. Add case "wsp" to parseGraphic
  if (!code.includes('case "wsp":')) {
    code = code.replace(
      'case "pic":\n                    return this.parsePicture(n);',
      'case "pic":\n                    return this.parsePicture(n);\n                case "wsp":\n                    return this.parseWordprocessingShape(n);'
    );
    code = code.replace(
      'case "pic":return this.parsePicture(n);',
      'case "pic":return this.parsePicture(n);case "wsp":return this.parseWordprocessingShape(n);'
    );
    changed = true;
  }

  // 2. Add parseWordprocessingShape method after parseGraphic
  if (!code.includes('parseWordprocessingShape(elem)')) {
    const methodStr = `
    parseWordprocessingShape(elem) {
        var txbx = globalXmlParser.element(elem, "txbx");
        if (!txbx) return null;
        var txbxContent = globalXmlParser.element(txbx, "txbxContent");
        if (!txbxContent) return null;
        return {
            type: DomType.Drawing,
            children: this.parseBodyElements(txbxContent),
            cssStyle: {
                display: 'block',
                position: 'relative',
                width: '100%',
                height: 'auto'
            }
        };
    }
`;
    code = code.replace(
      'parsePicture(elem) {',
      methodStr + '    parsePicture(elem) {'
    );
    changed = true;
  }

  // 3. Keep width and height in wrapNone rather than collapsing to 0px
  if (code.includes('result.cssStyle["width"] = "0px";')) {
    code = code.replace(
      'result.cssStyle["width"] = "0px";\n            result.cssStyle["height"] = "0px";',
      '// preserved extent dimensions\n            result.cssStyle["min-width"] = result.cssStyle["width"] || "120px";'
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, code, 'utf8');
    console.log('Successfully patched:', filePath);
  } else {
    console.log('Already patched:', filePath);
  }
}

const mjsPath = path.join(__dirname, '../node_modules/docx-preview/dist/docx-preview.mjs');
const jsPath = path.join(__dirname, '../node_modules/docx-preview/dist/docx-preview.js');

patchFile(mjsPath);
patchFile(jsPath);
