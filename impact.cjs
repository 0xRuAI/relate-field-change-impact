const { Database } = require('@relate/relate');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const conn = Database.open(':memory:').connect();
const [seed] = readFileSync(join(__dirname,'lineage.cypher'),'utf8').split(';');
conn.query(seed);
const q='MATCH p=(a:Asset {id:$id})-[:FEEDS*1..8]->(b:Asset) RETURN b.id AS asset,b.kind AS kind,length(p) AS hops,[n IN nodes(p) | n.id] AS path ORDER BY hops,asset';
function impact(id) {
 if(!conn.query('MATCH (a:Asset {id:$id}) RETURN a.id AS id',{id}).rows.length) throw Error('Unknown asset');
 return conn.query(q,{id}).rows.map(x=>({asset:x.asset,kind:x.kind,hops:Number(x.hops),path:Array.from(x.path)}));
}
if(process.argv[2]==='--test'){
 const x=impact('trades.fee');
 assert.deepEqual(x.map(a=>[a.asset,a.hops]),[['daily_pnl',1],['fee_alert',1],['weekly_summary',2]]);
 assert.deepEqual(x[2].path,['trades.fee','daily_pnl','weekly_summary']);
 assert(!x.some(a=>a.asset==='market_coverage'));
 assert.deepEqual(impact('market_coverage'),[]);
 assert.throws(()=>impact("unknown' OR true"),/Unknown asset/);
 console.log('5 assertions passed on Relate');
} else { console.log(JSON.stringify(impact(process.argv[2]||'trades.fee'),null,2)); }
