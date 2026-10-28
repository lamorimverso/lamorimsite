import {readFile,writeFile,readdir} from 'node:fs/promises';
import {resolve,dirname,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

// Atualiza dependências antes de calcular o hash do consumidor. Não há bundle
// nem dependência de runtime: o próprio conteúdo identifica cada versão.
export async function versionRunnerAssets(root,{check=false}={}){
 root=resolve(root);
 const generated=new Map(),visiting=new Set();
 const hash=body=>createHash('sha256').update(body).digest('hex').slice(0,12);
 async function resource(file){
  if(generated.has(file))return generated.get(file);
  if(visiting.has(file))throw Error('Dependência circular: '+file);
  if(!file.startsWith(root+sep))throw Error('Recurso fora do jogo: '+file);
  visiting.add(file);
  const original=await readFile(file);let body=original;
  if(['.mjs','.js'].includes(extname(file))){
   const source=original.toString('utf8');
   const expression=/((?:from\s*|import\s*)["'])(\.\.?\/[^"'?]+)(?:\?[^"']*)?(["'])/g;
   let updated='',last=0;
   for(const match of source.matchAll(expression)){
    const dependency=await resource(resolve(dirname(file),match[2]));
    updated+=source.slice(last,match.index)+match[1]+match[2]+'?v='+dependency.hash+match[3];
    last=match.index+match[0].length;
   }
   body=Buffer.from(updated+source.slice(last));
  }
  const result={original,body,hash:hash(body)};generated.set(file,result);visiting.delete(file);return result;
 }
 for(const file of (await readdir(root)).sort())if(['.mjs','.js','.css'].includes(extname(file)))await resource(resolve(root,file));
 const htmlPath=resolve(root,'index.html'),original=await readFile(htmlPath),source=original.toString('utf8');
 const attributes=/\b(src|href|data-runner)=(["'])([^"']+)\2/g;
 let html='',last=0;
 for(const match of source.matchAll(attributes)){
  const target=match[3].split('?')[0];
  if(!/^(?:\.\/)?[\w./-]+\.(?:mjs|js|css|webp|png)$/.test(target))continue;
  const dependency=await resource(resolve(root,target));
  html+=source.slice(last,match.index)+match[1]+'='+match[2]+target+'?v='+dependency.hash+match[2];
  last=match.index+match[0].length;
 }
 html+=source.slice(last);generated.set(htmlPath,{original,body:Buffer.from(html)});
 const changed=[...generated].filter(([,entry])=>!entry.original.equals(entry.body));
 if(!check)for(const [file,entry] of changed)await writeFile(file,entry.body);
 return changed.map(([file])=>file.slice(root.length+1));
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2),rootIndex=args.indexOf('--root');
 const root=rootIndex<0?fileURLToPath(new URL('../tanahoraflavio/',import.meta.url)):args[rootIndex+1];
 try{
  if(!root)throw Error('--root requer um diretório');
  const check=args.includes('--check'),changed=await versionRunnerAssets(root,{check});
  if(check&&changed.length){console.error('Versões desatualizadas: '+changed.join(', '));process.exitCode=1;}
  else console.log(check?'Versões verificadas.':`Versões atualizadas: ${changed.length} arquivo(s).`);
 }catch(error){console.error(error.message);process.exitCode=1;}
}
