// Build-time validation only. The website itself is HTML, CSS and browser JavaScript.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { dirname, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(p,'utf8').replace(/^\uFEFF/,'');
const errors=[], refs=new Map();
const add=(file,value)=>refs.set(file+'\0'+value,{file,value});
const html=read(resolve(root,'index.html')).replace(/<!--[\s\S]*?-->/g,'');
for(const m of html.matchAll(/<([a-z][\w-]*)\b([^>]*?)>/gi)){
 const tag=m[1].toLowerCase(),attrs=Object.fromEntries([...m[2].matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(a=>[a[1].toLowerCase(),a[2]??a[3]]));
 if(tag==='a'&&attrs.href!=='#')errors.push('Navigation must use #: '+m[0]);
 if(attrs.src)add(resolve(root,'index.html'),attrs.src);
 if(tag==='link'&&attrs.href)add(resolve(root,'index.html'),attrs.href);
}
for(const name of readdirSync(resolve(root,'css')).filter(n=>n.endsWith('.css'))){
 const file=resolve(root,'css',name);
 for(const m of read(file).matchAll(/url\(\s*["']?([^)"']+)/g))add(file,m[1].trim());
}
for(const {file,value} of refs.values()){
 if(/^(data:|#)/.test(value))continue;
 if(/^(https?:|\/)/.test(value)){errors.push('Non-local asset: '+value);continue;}
 const target=resolve(dirname(file),value.split(/[?#]/)[0]),rel=relative(root,target);
 if(rel.startsWith('..')||isAbsolute(rel)||!existsSync(target)||!statSync(target).isFile())errors.push('Missing asset: '+target);
}
if(/\b(localStorage|sessionStorage|fetch|XMLHttpRequest)\b|document\.cookie/.test(read(resolve(root,'js/script.js'))))errors.push('Unexpected storage or network API');
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log('PASS: '+refs.size+' local asset references; placeholder links; no external data or storage APIs.');

