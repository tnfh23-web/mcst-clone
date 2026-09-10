from pathlib import Path
from html.parser import HTMLParser
import re, sys
root=Path(__file__).resolve().parents[1]
errors=[]; refs=set()
class Audit(HTMLParser):
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='a' and a.get('href')!='#': errors.append('Navigation must use #: '+str(a))
  for key in ('src','href'):
   if key=='href' and tag not in ('link',): continue
   if a.get(key): refs.add((root/'index.html',a[key]))
Audit().feed((root/'index.html').read_text(encoding='utf-8-sig'))
for css in (root/'css').glob('*.css'):
 for value in re.findall(r'url\(\s*["\']?([^)"\']+)',css.read_text(encoding='utf-8-sig')):
  refs.add((css,value.strip()))
for file,value in refs:
 if value.startswith(('data:','#')):continue
 if value.startswith(('http:','https:','//','/')):errors.append('Non-local asset: '+value);continue
 target=(file.parent/value.split('?')[0].split('#')[0]).resolve()
 if not target.is_relative_to(root) or not target.is_file():errors.append('Missing asset: '+str(target))
for file in (root/'js').glob('script.js'):
 if re.search(r'\b(localStorage|sessionStorage|fetch|XMLHttpRequest)\b|document\.cookie',file.read_text(encoding='utf-8-sig')):
  errors.append('Unexpected persistent storage or network API')
if errors:print('\n'.join(errors));sys.exit(1)
print(f'PASS: {len(refs)} local asset references; placeholder links; no external data or storage APIs.')

