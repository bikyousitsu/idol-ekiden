import test from 'node:test';import assert from 'node:assert/strict';
import {EVENT_STORAGE_KEY,readEventSelection,saveEventSelection} from '../lib/event-selection.mjs';
const memory=()=>{const items=new Map();return {getItem:key=>items.get(key)||null,setItem:(key,v)=>items.set(key,v)};};
test('本番の選択を次の初期化で復元し、練習・リハーサルへの明示変更も保持',()=>{
 const storage=memory();assert.equal(readEventSelection(storage),'practice');
 for(const value of ['production','rehearsal','practice']){assert(saveEventSelection(storage,value));assert.equal(readEventSelection(storage),value);}
});
test('不正な保存値を台帳URLに使わず、無効な書込で本番の選択を上書きしない',()=>{
 const storage=memory();saveEventSelection(storage,'production');assert(!saveEventSelection(storage,'other'));assert.equal(readEventSelection(storage),'production');storage.setItem(EVENT_STORAGE_KEY,'../../other');assert.equal(readEventSelection(storage),'practice');
});
test('端末保存が利用できないときも画面初期化を失敗させない',()=>{
 const unavailable={getItem(){throw Error('disabled');},setItem(){throw Error('disabled');}};assert.equal(readEventSelection(unavailable),'practice');assert.equal(saveEventSelection(unavailable,'production'),false);
});
