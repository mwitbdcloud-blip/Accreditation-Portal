import html2canvas from 'html2canvas-pro';

/**
 * Accurately converts OKLCH color to sRGB string (rgb(...) or rgba(...)).
 * Implements standard CSS Color Level 4 conversion algorithm.
 */
export function oklchToRgb(
  lInput: number,
  cInput: number,
  hInput: number,
  aInput: number = 1
): string {
  const l = Math.max(0, Math.min(1, lInput));
  const c = Math.max(0, cInput);
  const h = isNaN(hInput) ? 0 : hInput;
  const a = Math.max(0, Math.min(1, aInput));

  const hRad = (h * Math.PI) / 180;
  const a_ = c * Math.cos(hRad);
  const b_ = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * a_ + 0.2158037573 * b_;
  const m_ = l - 0.1055613458 * a_ - 0.0638541728 * b_;
  const s_ = l - 0.0894841775 * a_ - 1.2914855480 * b_;

  const L = l_ ** 3;
  const M = m_ ** 3;
  const S = s_ ** 3;

  const rLin = +4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S;
  const gLin = -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S;
  const bLin = -0.0041960863 * L - 0.7034186147 * M + 1.7076147010 * S;

  const gamma = (x: number): number => {
    const cl = Math.max(0, Math.min(1, x));
    return cl <= 0.0031308 ? 12.92 * cl : 1.055 * Math.pow(cl, 1.0 / 2.4) - 0.055;
  };

  const R = Math.round(gamma(rLin) * 255);
  const G = Math.round(gamma(gLin) * 255);
  const B = Math.round(gamma(bLin) * 255);

  if (a < 1) {
    return `rgba(${R}, ${G}, ${B}, ${parseFloat(a.toFixed(3))})`;
  }
  return `rgb(${R}, ${G}, ${B})`;
}

/**
 * Accurately converts OKLAB color to sRGB string.
 */
export function oklabToRgb(
  lInput: number,
  aInput: number,
  bInput: number,
  alphaInput: number = 1
): string {
  const l = Math.max(0, Math.min(1, lInput));
  const a_ = aInput;
  const b_ = bInput;
  const alpha = Math.max(0, Math.min(1, alphaInput));

  const l_ = l + 0.3963377774 * a_ + 0.2158037573 * b_;
  const m_ = l - 0.1055613458 * a_ - 0.0638541728 * b_;
  const s_ = l - 0.0894841775 * a_ - 1.2914855480 * b_;

  const L = l_ ** 3;
  const M = m_ ** 3;
  const S = s_ ** 3;

  const rLin = +4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S;
  const gLin = -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S;
  const bLin = -0.0041960863 * L - 0.7034186147 * M + 1.7076147010 * S;

  const gamma = (x: number): number => {
    const cl = Math.max(0, Math.min(1, x));
    return cl <= 0.0031308 ? 12.92 * cl : 1.055 * Math.pow(cl, 1.0 / 2.4) - 0.055;
  };

  const R = Math.round(gamma(rLin) * 255);
  const G = Math.round(gamma(gLin) * 255);
  const B = Math.round(gamma(bLin) * 255);

  if (alpha < 1) {
    return `rgba(${R}, ${G}, ${B}, ${parseFloat(alpha.toFixed(3))})`;
  }
  return `rgb(${R}, ${G}, ${B})`;
}

/**
 * Parses any oklch(...) expression and outputs standard rgb(...) or rgba(...).
 */
export function parseAndConvertOklch(str: string): string {
  // If browser canvas 2d context is available, use native conversion first
  if (typeof document !== 'undefined') {
    try {
      const c = document.createElement('canvas');
      c.width = 1;
      c.height = 1;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.fillStyle = str;
        const res = ctx.fillStyle;
        if (res && !res.includes('oklch') && (res.startsWith('#') || res.startsWith('rgb'))) {
          return res;
        }
      }
    } catch {
      // Fallback to math parser
    }
  }

  const inner = str.trim().replace(/^oklch\(/i, '').replace(/\)$/i, '').trim();
  if (!inner) return 'rgb(0, 0, 0)';

  let partsStr = inner;
  let alphaVal = 1;

  if (inner.includes('/')) {
    const [colorPart, alphaPart] = inner.split('/');
    partsStr = colorPart.trim();
    const aTrim = alphaPart.trim();
    alphaVal = aTrim.endsWith('%') ? parseFloat(aTrim) / 100 : parseFloat(aTrim);
  }

  const tokens = partsStr.split(/[\s,]+/).filter(Boolean);
  if (tokens.length < 3) return 'rgb(0, 0, 0)';

  let l = 0;
  if (tokens[0].endsWith('%')) {
    l = parseFloat(tokens[0]) / 100;
  } else if (tokens[0] !== 'none') {
    l = parseFloat(tokens[0]);
  }

  let c = 0;
  if (tokens[1].endsWith('%')) {
    c = (parseFloat(tokens[1]) / 100) * 0.4;
  } else if (tokens[1] !== 'none') {
    c = parseFloat(tokens[1]);
  }

  let h = 0;
  if (tokens[2] !== 'none') {
    h = parseFloat(tokens[2].replace(/deg$/i, ''));
  }

  return oklchToRgb(l, c, h, isNaN(alphaVal) ? 1 : alphaVal);
}

/**
 * Parses any oklab(...) expression and outputs standard rgb(...) or rgba(...).
 */
export function parseAndConvertOklab(str: string): string {
  const inner = str.trim().replace(/^oklab\(/i, '').replace(/\)$/i, '').trim();
  if (!inner) return 'rgb(0, 0, 0)';

  let partsStr = inner;
  let alphaVal = 1;

  if (inner.includes('/')) {
    const [colorPart, alphaPart] = inner.split('/');
    partsStr = colorPart.trim();
    const aTrim = alphaPart.trim();
    alphaVal = aTrim.endsWith('%') ? parseFloat(aTrim) / 100 : parseFloat(aTrim);
  }

  const tokens = partsStr.split(/[\s,]+/).filter(Boolean);
  if (tokens.length < 3) return 'rgb(0, 0, 0)';

  let l = 0;
  if (tokens[0].endsWith('%')) {
    l = parseFloat(tokens[0]) / 100;
  } else if (tokens[0] !== 'none') {
    l = parseFloat(tokens[0]);
  }

  const a_ = tokens[1] !== 'none' ? parseFloat(tokens[1]) : 0;
  const b_ = tokens[2] !== 'none' ? parseFloat(tokens[2]) : 0;

  return oklabToRgb(l, a_, b_, isNaN(alphaVal) ? 1 : alphaVal);
}

/**
 * Replaces all occurrences of modern unsupported color functions (oklch, oklab)
 * in CSS text with standard RGB/RGBA strings.
 */
export function sanitizeCssColors(cssText: string): string {
  if (!cssText) return cssText;
  let result = cssText;

  if (result.includes('oklch')) {
    result = result.replace(/oklch\([^)]+\)/gi, (match) => {
      try {
        return parseAndConvertOklch(match);
      } catch {
        return 'rgb(30, 58, 138)';
      }
    });
  }

  if (result.includes('oklab')) {
    result = result.replace(/oklab\([^)]+\)/gi, (match) => {
      try {
        return parseAndConvertOklab(match);
      } catch {
        return 'rgb(30, 58, 138)';
      }
    });
  }

  return result;
}

/**
 * Sanitizes all stylesheets and inline styles in a cloned document before html2canvas
 * inspects them, preventing the "Attempting to parse an unsupported color function 'oklch'" error.
 */
export function sanitizeClonedDocument(clonedDoc: Document, targetElement?: HTMLElement): void {
  // 1. Sanitize all <style> tags in cloned document
  const styleTags = Array.from(clonedDoc.querySelectorAll('style'));
  for (const styleTag of styleTags) {
    if (styleTag.textContent && (styleTag.textContent.includes('oklch') || styleTag.textContent.includes('oklab'))) {
      styleTag.textContent = sanitizeCssColors(styleTag.textContent);
    }
  }

  // 2. Sanitize all elements with inline style attributes containing oklch
  const elementsWithStyle = Array.from(
    clonedDoc.querySelectorAll<HTMLElement>('[style*="oklch"], [style*="oklab"]')
  );
  for (const el of elementsWithStyle) {
    if (el.style && el.style.cssText) {
      el.style.cssText = sanitizeCssColors(el.style.cssText);
    }
  }

  // 3. If targetElement is provided, make sure its background and ancestors are clean
  if (targetElement) {
    // Ensure clean background
    if (!targetElement.style.backgroundColor || targetElement.style.backgroundColor === 'transparent') {
      targetElement.style.backgroundColor = '#ffffff';
    }
  }
}

/**
 * A safe drop-in replacement for html2canvas that automatically strips out and converts
 * unsupported modern color functions like `oklch` from Tailwind v4 or modern CSS.
 */
export async function safeHtml2Canvas(element: HTMLElement, options: any = {}) {
  const originalOnClone = options.onclone;

  const safeOptions = {
    ...options,
    onclone: (clonedDoc: Document, clonedEl: HTMLElement) => {
      // Sanitize cloned document before html2canvas starts parsing CSS
      sanitizeClonedDocument(clonedDoc, clonedEl);

      // Call original onclone if provided
      if (typeof originalOnClone === 'function') {
        originalOnClone(clonedDoc, clonedEl);
      }
    },
  };

  return await html2canvas(element, safeOptions);
}
