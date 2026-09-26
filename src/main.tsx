import {createRoot} from 'react-dom/client';
import {useEffect,useState} from 'react';
import {App} from './app/App';
import {loadBundle} from './app/data';
import type {DataBundle} from './app/types';
import './style.css';

function Bootstrap(){const [bundle,setBundle]=useState<DataBundle|null>(null);const [error,setError]=useState('');useEffect(()=>{loadBundle().then(setBundle).catch(e=>setError(e instanceof Error?e.message:String(e)))},[]);if(error)return <main className="boot"><h1>Site data unavailable</h1><p>{error}</p><code>npm run compile</code></main>;if(!bundle)return <main className="boot"><p>Loading compiled graph…</p></main>;return <App bundle={bundle}/>}
createRoot(document.getElementById('root')!).render(<Bootstrap/>);
