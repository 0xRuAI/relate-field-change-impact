const { Database } = require('@relate/relate');
const assert=require('node:assert/strict');
const conn=Database.open(':memory:').connect();
const seed="CREATE (f:Asset {id:'fee'}), (a:Asset {id:'daily'}), (b:Asset {id:'risk'}), (r:Asset {id:'report'}), (u:Asset {id:'unrelated'}), (f)-[:FEEDS]->(a), (f)-[:FEEDS]->(b), (a)-[:FEEDS]->(r), (b)-[:FEEDS]->(r), (r)-[:FEEDS]->(f)";
conn.query(seed);
const q='MATCH p=(a:Asset {id:$id})-[:FEEDS*1..8]->(b:Asset) RETURN b.id AS asset,[n IN nodes(p) | n.id] AS path';
function impacts(id) {
 const grouped=new Map();
 for(const row of conn.query(q,{id}).rows){
   const path=Array.from(row.path);
   if(new Set(path).size!==path.length)continue;
   const bucket=grouped.get(row.asset)||new Map();
   bucket.set(JSON.stringify(path),path);
   grouped.set(row.asset,bucket);
 }
 return [...grouped].sort(([a],[b])=>a.localeCompare(b)).map(([asset,paths])=>({asset, paths:[...paths.values()].sort((a,b)=>a.length-b.length||JSON.stringify(a).localeCompare(JSON.stringify(b)))}));
}
const res=impacts('fee');
assert.deepEqual(res.map(x=>x.asset),['daily','report','risk']);
assert.deepEqual(res.find(x=>x.asset==='report').paths,[['fee','daily','report'],['fee','risk','report']]);
assert(!res.some(x=>x.asset==='fee'));
assert(res.every(x=>x.paths.every(p=>new Set(p).size===p.length)));
assert.deepEqual(impacts('unrelated'),[]);
console.log('5 multi-path/cycle assertions passed on Relate');
console.log(JSON.stringify(res));
