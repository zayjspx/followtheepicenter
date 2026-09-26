// Strict local GitHub Pages approximation: nothing is served outside the chosen prefix.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve('dist'),prefix='/rc-preview/';
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
http.createServer((req,res)=>{
 let url;try{url=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400).end();return}
 if(url===prefix.slice(0,-1)){res.writeHead(301,{Location:prefix}).end();return}
 if(!url.startsWith(prefix)){res.writeHead(404).end();return}
 const file=path.resolve(root,url.slice(prefix.length)||'index.html');
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data)});
}).listen(4173,'127.0.0.1',()=>console.log('Serving production dist at http://127.0.0.1:4173'+prefix));
