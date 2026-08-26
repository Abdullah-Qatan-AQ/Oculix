from pathlib import Path

page = Path('/home/ubuntu/Oculix-v9-enhanced/src/app/page.tsx')
text = page.read_text()
text = text.replace('src="/oculix-icon.svg"', 'src="/oculix-icon.png"')
# Replace only the legacy inline brand SVG in the header. The surrounding header,
# layout and all interactive features remain unchanged.
start = text.find('          <svg viewBox="0 0 650 500" className="oculix-header-legacy')
if start != -1:
    end = text.find('          </svg>', start)
    if end == -1:
        raise SystemExit('legacy SVG closing tag not found')
    end += len('          </svg>')
    replacement = '          <img className="oculix-header-mark-secondary" src="/oculix-icon.png" alt="" aria-hidden="true" />'
    text = text[:start] + replacement + text[end:]
page.write_text(text)

layout = Path('/home/ubuntu/Oculix-v9-enhanced/src/app/layout.tsx')
text = layout.read_text().replace('href="/favicon.ico"', 'href="/favicon.ico"')
text = text.replace('type="image/png" sizes="32x32" href="/favicon-32x32.png"', 'type="image/png" sizes="32x32" href="/favicon-32x32.png"')
layout.write_text(text)
