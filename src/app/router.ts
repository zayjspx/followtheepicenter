import {useEffect,useState} from 'react';
export type Route={path:string; segments:string[]; query:URLSearchParams};
export function parseRoute():Route{
  const raw=location.hash.startsWith('#')?location.hash.slice(1):location.hash;
  const [pathPart='',queryPart='']=raw.split('?');
  const path=pathPart||'/';
  return {path,segments:path.split('/').filter(Boolean),query:new URLSearchParams(queryPart)};
}
export function href(path:string,query?:Record<string,string|number|undefined>){
  const q=new URLSearchParams();
  for(const [k,v] of Object.entries(query??{})) if(v!==undefined) q.set(k,String(v));
  return '#'+path+(q.size?'?'+q.toString():'');
}
export function go(path:string,query?:Record<string,string|number|undefined>){ location.hash=href(path,query).slice(1); }
export function useRoute(){
  const [route,setRoute]=useState(parseRoute());
  useEffect(()=>{const fn=()=>setRoute(parseRoute());addEventListener('hashchange',fn);return()=>removeEventListener('hashchange',fn)},[]);
  return route;
}
