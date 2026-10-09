/**
 * Xprinter & Thermal POS Printer Utility
 * Supports Xprinter 80mm (XP-N160II, XP-80C, XP-Q800) and 58mm (XP-58, XP-58IIH)
 * as well as standard office printers.
 */

export type PrinterPreset = 'xprinter-80mm' | 'xprinter-58mm' | 'a4';

export interface PrinterConfig {
  id: PrinterPreset;
  name: string;
  paperWidth: string; // e.g. "80mm" or "58mm"
  printableWidth: string; // e.g. "72mm" for 80mm roll, "48mm" for 58mm roll
  description: string;
  recommendedDpi: number;
}

export const PRINTER_PRESETS: Record<PrinterPreset, PrinterConfig> = {
  'xprinter-80mm': {
    id: 'xprinter-80mm',
    name: 'Xprinter 80mm (Standard POS)',
    paperWidth: '80mm',
    printableWidth: '72mm',
    description: 'Xprinter XP-N160II, XP-80C, XP-Q800, Epson TM-T20/T88 (72mm print area)',
    recommendedDpi: 203
  },
  'xprinter-58mm': {
    id: 'xprinter-58mm',
    name: 'Xprinter 58mm (Mini POS)',
    paperWidth: '58mm',
    printableWidth: '48mm',
    description: 'Xprinter XP-58IIH, XP-58, Portable Bluetooth receipt printers (48mm print area)',
    recommendedDpi: 203
  },
  'a4': {
    id: 'a4',
    name: 'A4 Standard Invoice / Statement',
    paperWidth: '210mm',
    printableWidth: '190mm',
    description: 'Standard office laser / inkjet printer for itemized statements',
    recommendedDpi: 300
  }
};

/**
 * Executes a clean thermal print of a designated container element.
 * Tries direct window.print() and provides a dedicated isolated iframe fallback
 * to guarantee that Xprinter receives only the receipt with exact roll dimensions.
 */
export function printReceipt(elementId: string, preset: PrinterPreset = 'xprinter-80mm') {
  const el = document.getElementById(elementId);
  if (!el) {
    window.print();
    return;
  }

  // Check if we can print via an isolated iframe to avoid any host page layout interference
  try {
    const existingIframe = document.getElementById('afya-print-iframe');
    if (existingIframe) {
      existingIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'afya-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = preset === 'xprinter-58mm' ? '58mm' : preset === 'xprinter-80mm' ? '80mm' : '210mm';
    iframe.style.height = '1000px';
    iframe.style.border = 'none';

    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    const widthCss =
      preset === 'xprinter-58mm'
        ? 'width: 48mm; max-width: 48mm; margin: 0 auto; font-size: 8pt; line-height: 1.15;'
        : preset === 'xprinter-80mm'
        ? 'width: 72mm; max-width: 72mm; margin: 0 auto; font-size: 9.5pt; line-height: 1.2;'
        : 'width: 100%; max-width: 210mm; margin: 0 auto; font-size: 10pt; line-height: 1.3;';

    const pageRule =
      preset === 'xprinter-58mm'
        ? '@page { size: 58mm auto; margin: 0mm; }'
        : preset === 'xprinter-80mm'
        ? '@page { size: 80mm auto; margin: 0mm; }'
        : '@page { size: A4; margin: 10mm; }';

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Receipt</title>
          <style>
            ${pageRule}
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              margin: 0;
              padding: 2mm;
              font-family: 'Courier New', Courier, monospace, system-ui, -apple-system, sans-serif;
              color: #000000;
              background: #ffffff;
            }
            .print-container {
              ${widthCss}
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            hr, .cut-line {
              border: none;
              border-top: 1px dashed #000000;
              margin: 8px 0;
            }
            .no-print {
              display: none !important;
            }
            img {
              max-width: 100%;
              ${preset !== 'a4' ? 'filter: grayscale(100%) contrast(140%);' : ''}
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${el.innerHTML}
          </div>
          <script>
            window.onload = function() {
              var images = Array.from(document.images);
              var loadPromises = images.map(function(img) {
                if (img.complete) return Promise.resolve();
                return new Promise(function(resolve) {
                  img.onload = resolve;
                  img.onerror = resolve;
                });
              });
              Promise.all(loadPromises).then(function() {
                setTimeout(function() {
                  window.focus();
                  window.print();
                }, 150);
              });
            };
          </script>
        </body>
      </html>
    `);
    doc.close();

    // Remove iframe after 60 seconds
    setTimeout(() => {
      iframe.remove();
    }, 60000);
  } catch (err) {
    console.warn('Iframe printing fallback error, falling back to window.print():', err);
    window.print();
  }
}
