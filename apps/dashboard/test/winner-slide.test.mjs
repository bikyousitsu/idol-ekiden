import test from 'node:test';import assert from 'node:assert/strict';import {winnerResult} from '../public/winner-slide.mjs';
const final=()=>({phase:'announced',teams:Array.from({length:6},(_,i)=>({name:'出演'+i,rank:i+1,totalFans:1000000-i*1000,final:{total:50}}))});
test('発表段階より前の途中首位は優勝として表示しない',()=>{for(const phase of ['preparing','tour','closed','live'])assert.equal(winnerResult({...final(),phase}),null);});
test('確定順位を採用し、同ファン数だけでは共同受賞にしない',()=>{const d=final();d.teams[1].totalFans=d.teams[0].totalFans;assert.deepEqual(winnerResult(d),{names:['出演0'],fans:1000000,joint:false});});
test('順位1が複数なら全員の名前で共同受賞',()=>{const d=final();Object.assign(d.teams[1],{rank:1,totalFans:1000000});assert.deepEqual(winnerResult(d),{names:['出演0','出演1'],fans:1000000,joint:true});});
test('6組の最終採点または優勝順位が欠けた結果は表示しない',()=>{const d=final();d.teams[2].final=null;assert.throws(()=>winnerResult(d),/不完全/);assert.throws(()=>winnerResult({...final(),teams:[]}),/全6組/);const bad=final();bad.teams[0].rank=2;assert.throws(()=>winnerResult(bad),/優勝/);});
