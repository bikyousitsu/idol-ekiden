import fs from 'node:fs';
import {teamItinerary} from '../apps/dashboard/lib/team-itinerary.mjs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const r = JSON.parse(fs.readFileSync(path.join(root, 'data/rules.json'), 'utf8'));
const min = s => Number(s.slice(0, 2)) * 60 + Number(s.slice(3));
const clock = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const venueIds = r.venues.map(v => v.id);
const tourFansPerPoint = r.final.fanPerPoint;
assert.equal(r.routes.length, 6);
assert.equal(r.final.maxima.reduce((a,b)=>a+b), 60);
for (const route of r.routes) {
  assert.equal(route.length, 6);
  assert.deepEqual(route.filter(v=>v!=='FREE').sort(), [...venueIds].sort());
}
for (let slot=0;slot<6;slot++) {
  const active=r.routes.map(route=>route[slot]).filter(v=>v!=='FREE');
  assert.equal(new Set(active).size, active.length, `会場競合: ${slot}`);
}

const scenarios = [
  { id:'G1', name:'堅実な広報', missionIds:['relay','sponsor','fanclub','collab'], buys:{ad:3,specialAd:1,costume:1,lesson:1,fanGoods:1,decoration:1}, scandal:'cover', sns:4, tour:72, final:36 },
  { id:'G2', name:'全部使って話題化', missionIds:['relay','sponsor','fanclub','collab'], buys:{ad:5,specialAd:1,costume:2,lesson:1,fanGoods:2,decoration:2}, scandal:'none', sns:4, tour:72, final:48 },
  { id:'G3', name:'演技準備を優先', missionIds:['relay','sponsor','fanclub','collab'], buys:{ad:1,costume:2,lesson:1,fanGoods:2,decoration:2}, scandal:'none',goodwill:true, sns:4, tour:72, final:52 },
  { id:'G4', name:'広告なし・演技優先', missionIds:['relay','sponsor','fanclub','collab'], buys:{costume:2,lesson:1,fanGoods:3,decoration:2}, scandal:'none', sns:4, tour:72, final:56 },
  { id:'G5', name:'資金温存・任意労働少', missionIds:['relay','sponsor','fanclub'], buys:{}, scandal:'none', sns:0, tour:72, final:30 },
  { id:'G6', name:'スポンサーなし・衣装優先', missionIds:['relay','collab'], buys:{ad:3,specialAd:1,costume:1,fanGoods:1,decoration:1}, scandal:'none', sns:4, tour:72, final:44 }
];

function evaluate(s) {
  let gb = r.teams.find(t=>t.id===s.id).initialGb;
  let fans = s.tour*tourFansPerPoint;
  const done = s.missionIds.map(id=>r.missions.find(m=>m.id===id));
  assert.ok(done.every(Boolean));
  assert.equal(done.length,new Set(s.missionIds).size);
  for(const m of done) { gb+=m.gb; fans+=m.fans; }
  const snsBonus=Math.min(s.sns,r.sns.maxBonusPostsPerTeam)*r.sns.fansPerAcceptedPost;
  fans+=Math.min(snsBonus,r.caps.extraSnsFansMax);
  const effects={none:0,cover:0,ignored:r.scandal.ignoredFans};
  if(s.scandal==='cover') gb-=r.scandal.coverGb;
  fans+=effects[s.scandal]+(s.goodwill?r.goodwill.fans:0);
  let buyCost=0,adFans=0;
  // 数量・最終収支の検証。収入が来る前に全部買えるという検証ではない。
  for(const [id,n] of Object.entries(s.buys)) {
    const p=r.products.find(p=>p.id===id);
    assert.ok(p); assert.ok(Number.isInteger(n)&&n>=0&&n<=p.max);
    buyCost+=p.price*n; adFans+=p.fans*n;
  }
  fans+=adFans;
  const sponsorIncome=s.missionIds.includes('sponsor')?r.income.sponsorGb:0;
  const clubIncome=s.missionIds.includes('fanclub')?Math.min(Math.floor(Math.max(0,fans)/100000)*r.income.fanclubGbPer100k,r.income.fanclubCapGb):0;
  gb+=sponsorIncome+clubIncome-buyCost;
  assert.ok(gb>=0,`${s.id}最終収支が不足`);
  assert.ok(s.tour<=100&&s.final<=60);
  return { ...s, gb, preFinalFans:fans, fans:fans+s.final*tourFansPerPoint, buyCost, adFans, income:sponsorIncome+clubIncome };
}
const outcomes=scenarios.map(evaluate);
const rows=[...outcomes].sort((a,b)=>b.fans-a.fans);
const maxMissionGb=r.missions.filter(m=>!m.legacy).reduce((sum,m)=>sum+m.gb*m.max,0);
const maxIncome=r.income.sponsorGb+r.income.fanclubCapGb;
const maxProductCost=r.products.reduce((sum,p)=>sum+p.price*p.max,0);
const maxAdFans=r.products.reduce((sum,p)=>sum+p.fans*p.max,0);
const moneyCap=r.teams[0].initialGb+maxMissionGb+maxIncome;
assert.equal(maxAdFans,160000);

// 歩行時間は実測値ではない。仮定を動かして差を見るための例。
const assumedReturnMinutes={A:20,B:15,C:10,D:5};
const start=min(r.times.tourStart),show=min(r.times.showStart),deadline=min(r.times.tradeDeadline);
const routes=r.routes.map((route,i)=>{
  const visits=teamItinerary(`G${i+1}`,r.times),last=5;
  const end=start+last*15+5;
  const lastVenue=visits[last].kind==='labor'?'合同ロケ':route[last];
  const back=end+(assumedReturnMinutes[lastVenue]??10);
  const first=route.findIndex(v=>v!=='FREE');
  return { id:`G${i+1}`, route:visits.map(v=>v.kind==='labor'?v.title:v.venue), lastVenue, end:clock(end), returnExample:clock(back), buyMinutes:Math.max(0,deadline-back), finalPrepMinutes:Math.max(0,show-Math.max(back,min('17:00'))), northToSouth:route.some((v,j)=>v==='D'&&route.slice(j+1).includes('A')), firstSlot:clock(start+first*15) };
});
const ledgerGap=[];
for(let slot=0;slot<6;slot++){
  const stageFans=18*tourFansPerPoint;
  const total=r.routes.map(route=>route.slice(0,slot+1).filter(v=>v!=='FREE').length*stageFans);
  ledgerGap.push({ time:clock(start+slot*15+5), values:total, gap:Math.max(...total)-Math.min(...total) });
}
const equalTours=r.routes.map(route=>route.filter(v=>v!=='FREE').length*18*tourFansPerPoint);
assert.equal(new Set(equalTours).size,1);
const report={version:r.version,kind:'仮想収支と仮定歩行時間の確認。実機/実測の保証ではない',outcomes:rows,routes,ledgerGap,maxMissionGb,maxIncome,maxProductCost,moneyCap,maxAdFans};
fs.mkdirSync(path.join(root,'docs/production'),{recursive:true});
fs.writeFileSync(path.join(root,'docs/production/simulation-results.json'),JSON.stringify(report,null,2)+'\n');
const md=`# ゲームバランス・ルート検討（試運転）

正本：\`data/rules.json\`（${r.version}）。\`node scripts/simulate.mjs\` で再生成できます。ここでの戦略別の採点は人が仮に与えた値で、衣装購入やレッスンが点数を上げる効果を実証したものではありません。実測・実機試験とは別です。

## 6チームの仮想進行

全組のツアーを同じ72/100点に揃え、労働・支出・スキャンダル・仮の最終演技点を変えた比較。17:00までに全労働と広告が成立した最終収支の計算です。各購入時点の残高検証ではなく、全チームが実際にこの量をこなせる保証もありません。

| 順位 | チーム・戦略 | 武道館仮点 | 17:00までのファン | 最終ファン | 購入費 | 最終GB |
|---|---|---:|---:|---:|---:|---:|
${rows.map((s,i)=>`| ${i+1} | ${s.id} ${s.name} | ${s.final} | ${s.preFinalFans.toLocaleString('ja-JP')} | ${s.fans.toLocaleString('ja-JP')} | ${s.buyCost} | ${s.gb} |`).join('\n')}

16:30時点では各実施済み会場を18点と仮定するとG1/G2/G5/G6が同率首位、G3/G4が同率最下位。その抽選でG1・G3を選んだ一例として、G1だけ口止め200GB、G3だけ神対応成功＋5万人。他の組へスキャンダル増減を与えません。抽選・徒歩・訪問成立の実証ではありません。SNSはG5のみ0件、他は4件。詳細のミッション・購入数量は \`simulation-results.json\`。

## 金額の釣り合い

- 初期600＋全労働${maxMissionGb}＋定期入金最大${maxIncome}＝最大${moneyCap}GB。全商品を上限まで買うと${maxProductCost}GB、もみ消し200GBを加えても残り${moneyCap-maxProductCost-r.scandal.coverGb}GB。差がマイナスなら全商品と口止め料の両方は賄えません。これは全労働完遂時の上限で、通常は使い道を選ぶ必要があります。
- 宣伝の直接加算は最大${maxAdFans/10000}万人＝ステージ${maxAdFans/tourFansPerPoint}点分。ツアーは100点、武道館60点。GBだけでステージ全体を覆す規模ではありません。
- この試算には旧制度の購入が含まれます。スペシャル宣伝は2026-10-12に廃止。現行制度の比較には使いません。
- 謝罪動画の仮範囲は−10万〜＋3万人で、最大差は13点分。口止め200GBと同額で通常宣伝4万人を買えますが、動画対応には減点リスクがあります。現行方式は口止めなら記事0本、動画なら本部の直接評価で2記事。残高と対応時間を考えて選ぶ設計です。
- スポンサーとFCは17:00に1回のみ。早い組の毎分入金・複利はありません。全ツアー採点が揃ってからFCを精算すれば、会場順の違いによる源泉ファン数の差を小さくできます。

## 移動と準備時間の差

**仮の徒歩分：A→共用棟20分、B→15分、C→10分、D→5分、合同ロケ→10分。地図・徒歩実測に基づく値ではありません。** 北→南の長距離区間は別途実測します。数値を動かすための入力例として扱ってください。

| 組 | ルート | 最後の活動終了 | 帰還の仮例 | 購入締切まで | 17:00以降の本部準備分 | 北→南移動 |
|---|---|---|---|---:|---:|---|
${routes.map(s=>`| ${s.id} | ${s.route.join('→')} | ${s.end} (${s.lastVenue}) | ${s.returnExample} | ${s.buyMinutes}分 | ${s.finalPrepMinutes}分 | ${s.northToSouth?'あり':'なし'} |`).join('\n')}

枠の会場競合は0、全組A〜D各1回・労働バトル1回・合同ロケ1回。両労働は2組同時集合です。全組の最後の活動終了は16:50の仮案ですが、帰還地点により準備時間は異なります。G4は最後が南のA。15分枠の実施5分・移動10分に収まるか、特にG5 B→D、G6 A→Cを実測します。

採点のタイミングでも途中順位はずれます。全組が各会場18点でも、途中のファン差は最大${Math.max(...ledgerGap.map(x=>x.gap))/10000}万人。速報には『受験済み会場数』を添え、16:30の順位イベントはこの差を含む速報で対象を一度固定する現ルールです。直前に受信した採点を反映し、処理の遅れだけで対象が変わらないよう確認します。17:00に全会場が揃うと差は0になります。

## 現案のまま実施するための調整候補

1. **労働バトル・合同ロケは予定どおり2組同時集合**。動画リレーは遅延時の代替候補で、通常の合同ロケは共演とします。
2. **衣装は各ツアー会場で披露前に購入・着用**。G6が本部へ戻らないと衣装を買えない状態を避けます。会場在庫・30秒受渡し・入力の分担をリハで確認。実物をビジュアル採点し、自動加点はしません。
3. **レッスンは同じ資料を同じ時刻に配る**。演目の申告は遠隔で可。早帰り組だけ長い対面指導を得る形にしません。
4. **早帰りを追加報酬に換算しない**。帰還地点による移動差の補正を優先。SNS・労働には全組共通の上限があるので無制限稼ぎになりません。
5. 各枠10分の移動が成立しない場合、労働を黙って省略せず会場位置か時間枠を再調整します。

## ルート変更が必要な場合の代替

- 全組A→B→C→D、各組の出発を5分ずらし、各組のステージ開始は15分間隔（実施5分＋歩行10分）にする代替案。Aは15:30〜16:00、Bは15:45〜16:15、Cは16:00〜16:30、Dは16:15〜16:45。1会場1組の条件を維持し、最後の会場を全組Dへ揃えられます。**会場スタッフは5分ごとに6組を連続受付**するため、採点・送信・道具復元を含めて5分でできるか実演が必須です。現在のルートには未採用。
- 上の案もA→B等の徒歩が10分以内であることが条件。全チームの最初と最後の待機・任意労働を同じだけ確保し、スポンサー提出締切を揃える必要があります。単に移動時間を短く書くだけでは成立しません。
- 徒歩実測後、移動を含めると成立しない場合は会場を北側へ寄せる／ツアー開始を前倒す／最終会場を帰還しやすい場所へ差替えることを相談します。開催許可のない場所へ勝手に移しません。

## 計算チェック結果

実行時に6ルート×6枠、各会場の重複、A〜D各1回、武道館60点上限、購入上限、全戦略の非負収支を検証。結果は \`simulation-results.json\` へ保存します。ネットワーク配信・本番同時入力・徒歩・司会交代の実地検証は未実施です。
`;
fs.writeFileSync(path.join(root,'docs/production/balance-review.md'),md);
process.stdout.write(JSON.stringify({checks:'PASS',scenarios:rows.map(s=>({team:s.id,fans:s.fans,gb:s.gb})),routeConflicts:0, moneyCap, maxAdFans, output:'docs/production/balance-review.md'},null,2)+'\n');
