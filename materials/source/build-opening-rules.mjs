import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

// Run with the provided Artifact Tool runtime. Keep draft renders outside the public repository.
const modules=process.env.RUNTIME_NODE_MODULES;
if(!modules)throw Error('Set RUNTIME_NODE_MODULES to the provided runtime node_modules directory');
const {Presentation,PresentationFile}=await import(pathToFileURL(path.join(modules,'@oai/artifact-tool/dist/artifact_tool.mjs')).href);
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const out=path.join(repo,'materials');
const workspace=path.resolve(repo,'../..');
const buildBase=path.resolve(process.env.OPENING_BUILD_DIR||path.join(workspace,'work/show-slides'));
const assetDir=path.join(out,'assets');
const backdrop=await fs.readFile(path.join(assetDir,'stage-background-v1.png'));
const rules=JSON.parse(await fs.readFile(path.join(repo,'data/rules.json'),'utf8'));
const FONT='Noto Sans JP',NAVY='#10172A',PINK='#FF5C98',GRAY='#B7C4DE',WHITE='#FFFFFF';
const W=1280,H=720;
const url='https://idol-ekiden-control.coolmyna3.chatgpt.site/#routes';
const slides=[];
const tx=(text,x,y,w,h,size=30,color=WHITE,bold=false)=>({type:'text',text,x,y,w,h,size,color,bold});
const tb=(rows,widths,x=72,y=206,w=1136,h=418,size=27)=>({type:'table',rows,widths,x,y,w,h,size});
const add=(title,items,notes,options={})=>slides.push({title,items,notes,...options});
const cols=(left,right)=>[
 tx(left[0],72,212,536,64,36,WHITE,true),...left.slice(1).map((s,i)=>tx(s,72,306+i*91,536,79,30)),
 tx(right[0],672,212,536,64,36,WHITE,true),...right.slice(1).map((s,i)=>tx(s,672,306+i*91,536,79,30))
];
add('327 アイドル駅伝',[
 tx('デビュー記者会見',72,237,1136,85,56,'#F6A4BF',true),
 tx('開会式・ルール説明',72,366,1136,68,36,WHITE),
 tx('14:30 集合　／　15:00ごろ 出発　／　17:30 武道館',72,474,1136,68,32,WHITE),
 tx('試運転版：金額・報酬・一部の時間は仮案',72,590,1136,36,22,'#F6A4BF')
], 'ボンボ：ようこそ、327アイドル駅伝のデビュー記者会見へ！\nグッドマン：今日、皆さんのチームはアイドルグループになります。北大構内をツアーして、最後は寮の共用棟「武道館」でライブです。まずルールを説明します。\n運営メモ：本文2〜11を説明し、12で出発準備。13〜17は質問が出たときの補足。金額は試運転案なので、確定後に差し替える。', {dark:true,cover:true});
add('一年目がアイドル、古参ファンがグループを支える',cols(
 ['一年目：アイドル','ツアーのステージに出演する','衣装や演技で魅力を伝える','最初の会場に着くまでに\nグループ名と挨拶を考える'],
 ['上の年目：古参ファン','労働や応援でアイドルを支える','撮影や衣装の準備を手伝う','チーム全員で一緒に移動する']
), 'ボンボ：一年目はアイドル、上の年目はデビュー前から応援している古参ファンです。\nグッドマン：アイドルだけで頑張る企画ではありません。撮影、応援、労働、衣装の準備を分担して、全員でグループを育ててください。移動も一緒です。\nボンボ：グループならではの挨拶も考えてください。最後のライブで自分たちらしさを出しましょう。');
add('最後にファン数が最も多いグループが優勝する',[
 tx('ファン数',72,209,530,68,38,WHITE,true),tx('初期0人／ゲーム上の人気',72,309,530,61,30),
 tx('1点 ＝ 1万人',72,405,530,85,48,PINK,true),tx('活動・宣伝でファン数が増減する',72,535,530,79,30),
 tx('GB：ゲーム内のお金',672,209,536,68,38,WHITE,true),tx('初期 600 GB／仮案',672,309,536,78,42,PINK,true),
 tx('労働で稼ぎ、衣装や宣伝に使う',672,423,536,70,30),tx('残ったGBはファン数に換算しない',672,535,536,79,30)
], 'グッドマン：優勝は、武道館ライブまで終わった最後のファン数で決まります。ファン数はゲーム上の人気です。古参ファンが別のチームに推し変する仕組みではありません。\nボンボ：ステージの1点がファン1万人になります。GBはゲーム内のお金で、実際の現金は使いません。残高を増やすだけでなく、衣装や宣伝に使ってグループを育ててください。初期600GBと価格は仮案です。');
add('17:20に共用棟の「武道館」へ全員集合する',[
 tb([['時刻','チームが行うこと'],['15:00ごろ／予定','寮を出発し、最初の会場へ移動する'],['15:30〜17:00','全国ツアー4会場＋労働2か所'],['16:30ごろ','途中の順位に応じたイベント'],['17:00ごろ／予定','ファン数上位から武道館のお題を選ぶ'],['17:20／予定','共用棟の「武道館」へ集合・購入を終える'],['17:30','武道館ライブが開演する']],[.29,.71],72,200,1136,434,29)
], 'ボンボ：ツアーは15時30分からの予定です。途中16時30分ごろに順位イベントがあります。\nグッドマン：17時ごろから、お題選択の連絡がチームLINEに来ます。17時20分には全員で共用棟に戻ってください。そこで漫才、披露方法の説明、現在の順位確認があり、17時30分に最初のパフォーマンスが始まります。\n運営メモ：15時開始・17時30分開演が基本時刻。ほかは予定。開始を変更した場合は、この固定スライドと付録の行動表も変更する。ダッシュボードの時刻変更はスライドに自動反映されない。');
add('全国ツアーは、チームの予定に沿って4会場を巡る',[
 tb([['会場','ステージ'],['A クラーク像前','お笑い'],['B 博物館前','クイズ'],['C 工学部噴水前','スポーツ'],['D 18条ステージ','ダンス']],[.66,.34],72,206,708,418,30),
 tx('参加者ページの行動表を確認',840,206,368,72,31,WHITE,true),tx('指定時刻に集合する\n会場は1チームずつ使う',840,317,368,83,29),
 tx('各会場25点満点\nうちビジュアル10点',840,422,368,102,30),tx('4会場で最大100点',840,547,368,76,30)
], 'グッドマン：Aがお笑い、Bがクイズ、Cがスポーツ、Dがダンスです。回る順番はチームごとに違います。参加者ページの自分のグループを見て移動してください。\nボンボ：Aはモノボケ。Bはアイドルと古参ファン1人が回答するクイズ番組。Cは8の字跳びと15キロぴったりを目指す握力測定。DはILLIT「It’s me」のサビを2回聞いて、3回目で踊る案です。現地でスタッフが説明します。各会場は25点満点で、うち10点がビジュアルです。\n運営メモ：演目の実施条件と音源は最終確認が必要。衣装購入を含む5分実施・10分移動は徒歩実測前の仮案。遅れたら本部へ連絡し、自己判断で別枠に入らない。');
add('労働バトルと合同ロケは、2チームで参加する',[
 ...cols(['労働バトル｜中央食堂前','アイドルと古参ファンが\n台車リレーで協力する案','古参ファン全員が走る設定\n機材・実施方法は確認中','成立で各チーム200 GB／仮案'],
 ['合同ロケ｜医学部噴水前','相手グループと共同CMを作る','指定の時刻に2チームで集合する','完成で各組300 GB＋3万人／仮案'])
], 'ボンボ：ツアーの途中に、労働バトルと合同ロケがあります。どちらも2チームが同じ時刻に集合します。\nグッドマン：労働バトルは中央食堂前で、アイドルを載せ、古参ファン全員が走って押す台車リレーの案です。ただし、使用台車が人の乗車・走行に対応するか未確認なので、実施方法は確定していません。確認前に人を載せて走らせないでください。\nボンボ：合同ロケは医学部噴水前です。相手グループと一緒にCMを作ります。現地スタッフの説明を聞いて進めてください。労働の報酬はまだ仮案です。');
add('衣装はツアー会場で、披露前に購入できる',cols(
 ['衣装・コスプレを活かす','必要な衣装は披露前に購入できる','スパンコールや動物の耳などで\n自分たちの見た目を工夫する','着用した衣装も\nビジュアル得点に反映される'],
 ['GBでグループを育てる','衣装素材セット：200 GB／仮案','宣伝：100 GBで＋2万人／仮案','衣装は購入数で自動加点せず\n実物と表現が評価される']
), 'グッドマン：ツアー会場では披露前に衣装を買えます。キラキラした衣装も、おもしろコスプレも使って、自分たちの見た目を工夫してください。\nボンボ：着用したものはビジュアルの評価に入ります。ただし買った数で自動的に点数が付くわけではありません。残高を確認して、何に使うかチームで相談しましょう。詳しい商品表は補足13です。\n運営メモ：現物在庫・どの会場で渡せるか・購入時間を事前確認する。衣装例は調達案で、全品が必ず用意されるとは案内しない。');
add('全体LINEへの投稿は、森本の許可を得てから送る',[
 tb([['担当','投稿するまでの流れ'],['チーム','素材と文章をチームLINEで森本に送る'],['森本','内容を確認し、全体LINEへの投稿を許可する'],['チーム','許可後に全体LINEへ投稿する'],['本部','投稿ごとにGB・ファン数の増減を評価する']],[.19,.81],72,206,1136,320,30),
 tx('投稿回数に制限なし',72,557,480,70,36,PINK,true),tx('評価によってはGB・ファン数が減る',593,557,615,70,30)
], 'ボンボ：空いている時間は、ファンが増えそうな写真や動画を作ってください。投稿回数に制限はありません。\nグッドマン：ただし、全体LINEに送る前に、必ずチームLINEで森本の許可を取ってください。素材と投稿文を一緒に送ると確認しやすくなります。\nボンボ：本部が投稿一つひとつを評価して、GBとファン数の増減を入力します。マイナスの評価もあります。先ほどのグループの挨拶や、衣装の紹介も投稿の題材になります。\n運営メモ：最新メモで従来の15分間隔・会場別1回・最大4回・固定1万人は撤廃。評価基準・GB減点の限度は開始前に本部内で合わせる。無断投稿は運営へ相談し、参加者に架空の自動罰則を案内しない。');
add('16:30ごろ、首位・最下位から各1組にイベント',cols(
 ['首位：スキャンダル','記者が架空の疑惑を取材する','口止め：200 GB／仮案、記事なし\n謝罪：動画を全体LINEへ公開する','動画を本部が評価してファン数が増減\n−10万人〜＋3万人／増加上限は仮案'],
 ['最下位：神対応イベント','ファン役の運営が\nアイドルに声をかける','応対・紹介・決めポーズで\nグループの魅力を伝える','成功すると＋5万人\n同率はそれぞれ抽選で1組']
), 'グッドマン：16時30分ごろ、その時点の首位と最下位の1組にイベントがあります。同率なら、それぞれ1組を抽選します。\nボンボ：首位は架空のスキャンダルです。全体LINEの書き込みから記者が取材し、その後森本が選択肢を案内します。口止め料なら記事は出ません。謝罪動画なら全体LINEへ公開し、本部が完成度を見てファン数の増減を決めます。マイナス10万人まで、プラス側は3万人までの仮案です。\nグッドマン：最下位にはファン役が声をかけます。応対、グループ紹介、決めポーズができれば5万人獲得です。\n運営メモ：本物のうわさや実際の個人情報は使わない。口止め料200GB・締切16:45・結果16:50は仮案。全チームには発生させない。具体的な疑惑の原稿はここで公開せず演出用に保持する。');
add('武道館のお題は、ファン数上位から順番に選ぶ',[
 tb([['案内・条件','チームがすること'],['選択の連絡','森本が残っているお題をチームLINEに送る'],['返信の目安','チームで相談し、1分を目安に返す'],['同じお題の上限','同じお題を選べるのは2グループまで'],['出演の準備','選んだお題とグループの挨拶を練習する']],[.27,.73],72,206,1136,355,30),
 tx('1分は目安で、過ぎても自動失格にはしない',72,589,1136,49,29)
], 'ボンボ：ツアー終了後、ファン数の順位を固定して、上位から武道館のお題を選びます。森本が残っているお題をチームLINEに送ります。\nグッドマン：チームで相談して、1分を目安に返してください。1分を過ぎたら自動失格になるルールではありません。同じお題は2グループまでです。\nボンボ：大喜利、モノボケ、ボディビル、組体操、ダンス、コント、リアクション芸、ラップを候補にしています。詳しくは補足15です。選んだ後はグループの挨拶と一緒に準備してください。\n運営メモ：同率の選択順は抽選の仮案。お題選択順と出演順は別で、出演順は未確定。楽屋6枠の案はLL、とっしー、事務室、共用棟1階後ろ側2区画、正面玄関。後ろ側の区画分け・使用許可・待機動線は確認する。');
add('武道館の得点をファン数に加算し、優勝を決める',[
 tb([['評価する項目','満点'],...rules.final.criteria.map((c,i)=>[c,`${rules.final.maxima[i]}点`])],[.78,.22],72,206,735,418,28),
 tx('3人の審査員の平均点を使う',859,206,349,76,30,WHITE,true),tx('合計60点満点\n1点＝1万人',859,330,349,112,38,PINK,true),
 tx('全6組の終了後に\n最後の順位を発表',859,511,349,104,30)
], 'グッドマン：武道館はこの5項目で60点満点です。3人の審査員の採点を平均し、1点がファン1万人になります。ビジュアルとグループカラーの装飾も評価に入ります。\nボンボ：ファンの皆さんは応援で盛り上げてください。そして、全アイドルが輝くパフォーマンスを目指しましょう。全6組が終わってから得点を反映して、最後の順位を発表します。\n運営メモ：合計ファン数が同じなら武道館の平均点、次に「アイドル全員が輝いているか」の評価で比較し、そこまで同じなら同時優勝。途中の順位とライブ後の順位を混同しない。');
add('移動中にグループ名と挨拶を考え、予定を確認する',[
 tx('参加者ページを開く',72,216,650,76,40,WHITE,true),tx('自分のグループを選んで\n最初の会場・集合時刻を見る',72,328,650,104,34,WHITE),
 tx('ファン数・GB・順位は全チーム公開',72,474,650,91,30,WHITE),tx('名前と挨拶は決まったら森本へ送る',72,584,650,49,30,'#F6A4BF'),
 {type:'qr',x:854,y:234,w:314,h:314},tx('ログイン不要',854,568,314,52,27,WHITE,true),tx('全体LINEのリンクからも開ける',72,639,710,35,22,WHITE)
], 'ボンボ：最後に、このQRコードか全体LINEのリンクから参加者ページを開いてください。\nグッドマン：自分のグループの予定を見て、最初に向かう会場と集合時刻を確認しましょう。ファン数、GB、順位もここで見られます。困ったらチームLINEで森本へ連絡してください。\nボンボ：それでは、チームでグループの挨拶を考えて、出発の準備をしましょう！\n運営メモ：QRは参加者ページのみ。事前に森本が全体LINEへURLを手動送信し、集合先を確認する。13〜17は補足なので、通常の説明はここで終える。', {dark:true});
add('補足｜購入品の価格と効果は現在の仮案',[
 tb([['購入するもの','価格／仮案','効果','各組の上限'],...rules.products.map(p=>[p.name,`${p.price} GB`,p.fans?`＋${p.fans/10000}万人`:({costume:'衣装の素材を受け取る',lesson:'演目の練習支援を受ける',fanGoods:'応援用の道具を受け取る',decoration:'装飾用の素材を受け取る'})[p.id],`${p.max}回`])],[.32,.19,.32,.17],72,206,1136,418,27)
], '運営用の補足：金額・回数・現物の提供方法は試運転案。宣伝以外はファン数を直接加算しない。現在の在庫と受付方法を本部で決めてから案内する。補足13は質問が出たときに表示する。');
add('補足｜ツアーは各会場25点で、ビジュアルが10点',[
 tb([['会場','各5点の評価項目','10点の評価項目'],...rules.venues.map(v=>[`${v.id} ${v.theme}`,v.criteria.slice(0,2).join('・')+'\n'+v.criteria[2],v.criteria[3]])],[.19,.58,.23],72,206,1136,426,27)
], '運営用の補足：会場の4項目をそれぞれ採点し、合計25点。購入数で自動加点しない。最新の実演メモは、Aがモノボケ道具3つほど、Bが実際のアイドルや北海道の豆知識、Cが8の字跳びで毎回ポーズと握力15kgぴったり、Dがサビ2回を聞いて3回目で実演。設問・成立条件・採点の目安は会場担当が最終確認する。');
add('補足：武道館で披露する演目の候補',[
 tb([['お題','現在の演目案'],['大喜利','「こんなアイドルは嫌だ」など／3分'],['モノボケ','金鍋・ギター・ゲームコントローラーなど／3分'],['ボディビル','リンキンパークの曲で筋トレとポージング／3分'],['組体操','提示された形や自由な形を披露する／3分'],['ダンス','「倍々FIGHT!」1番を踊る'],['ショートコント・コント','連続のショートコントかコントを披露する／3分'],['リアクション芸','観客に視覚的に伝わる演出／3分'],['ラップ','司会のシャネルとラップバトル／3分']],[.29,.71],72,196,1136,448,25)
], '運営用の補足：最新のユーザーメモに基づく演目案。大喜利のもう一つのお題は「このアイドルグループ、そろそろ解散するな。なぜ？」。モノボケの追加候補は空気入れ、筋トレの重り、アイロン。ボディビルの具体的音源・ポーズ名と写真、組体操の形、ダンスの振付動画、リアクション芸のギミック、ラップのビートは未確定。\nリアクション芸として出た加熱食品・激辛食品・口に器具をくわえたまま打撃を受ける案は確定した実施ルールにせず、当日用の方法を別途検討する。組体操も形と実施条件を決める。\nダンスは1番の実尺が未確認で、3分と断定しない。全演目が同じお題2組まで。初期カタログの「お題3問」「3道具固定」「司会の8小節」などは今回のメモで確定した条件として案内しない。');
const routeRows=rules.teams.map((t,i)=>[t.id,...rules.routes[i].map((v,slot)=>{
 const visit=rules.laborVisits.find(x=>x.slot===slot&&x.teamIds.includes(t.id));
 if(!visit)return v;
 return `${visit.pointId==='L1'?'労働バトル':'合同ロケ'}\n${visit.teamIds.find(x=>x!==t.id)}と集合`;
})]);
for(let group=0;group<2;group++)add(`補足：G${group*3+1}〜G${group*3+3}の集合時刻と行き先`,[
 tb([['組','15:30','15:45','16:00','16:15','16:30','16:45'],...routeRows.slice(group*3,group*3+3)],[.076,...Array(6).fill(.154)],72,205,1136,351,24),
 tx('A クラーク像前　B 博物館前　C 工学部噴水前　D 18条ステージ',72,579,1136,42,23)
], '運営用の補足：全組が四会場と二つの労働へ一度ずつ行く案。各時間列の会場は1組ずつ、各労働は2組ずつ。時刻は15時開始の基本予定。5分実施・10分移動は実測前で、長距離区間と共用棟への帰路を確認してから確定する。最新の行動表は参加者ページを優先する。');


const budokan=[
 {title:'武道館スペシャルライブ',dark:true,cover:true,items:[tx('MAJOR DEBUT',72,237,750,90,72,'#FF91B8',true),tx('メジャーデビューをつかむ、最後のステージ',72,383,750,92,36,WHITE,true),tx('17:30 開演　／　6グループが出演',72,534,800,70,32,WHITE)],notes:'シャネル・スーダンの漫才中はこの表紙を表示。漫才を終えてから次へ。BGMを司会の声が聞こえる音量へ下げる。'},
 {title:'いまのファン数ランキングを確認する',rankSlide:true,items:[tx('現在順位を参加者ページで表示',72,213,760,76,42,WHITE,true),tx('ここまでのファン数を確認し、\n武道館ライブでの逆転を目指す',72,353,715,116,34),tx('武道館で得たファン数を、最後に加算する',72,530,750,78,27),{type:'qr',rank:true,x:887,y:265,w:268,h:268},tx('参加者ページの順位へ',854,553,340,51,25,WHITE)],notes:'シャネル：まずは現在の順位を確認しましょう。\nオペレーター：公開済みの budokan-rules-v3.html を使い、順位は自動で読み込む。2枚目で必要なら「順位更新」を押す。順位・ファン数・取得時刻を表示する。取得に失敗したときは前回の表示を消してエラーを示す。参加者ページへ切り替えて確認する。PPTX/PDFには順位データを焼き込まない。\nスーダン：ここまでの首位にも、追い上げるグループにも、まだ最後のステージがあります。'},
 {title:'アイドルは演目を披露し、古参ファンは応援する',items:cols(['アイドル','挨拶から始めて\n選んだ演目を披露する','挨拶も含めて3分\nダンスは指定曲1番を踊る','全アイドルが見えるように\n披露する'],['古参ファン','声や推し活グッズで応援する','グループカラーの装飾を見せる','出入りと転換は司会の案内に従う']),notes:'シャネル：グループの挨拶から始めて、選んだ演目を披露してください。ダンス以外は挨拶も含めて3分です。ダンスは指定曲の1番を踊ります。全員が輝く姿を見せましょう。\nスーダン：古参ファンも応援で盛り上げてください。グループカラーの装飾も評価に入ります。出入りと転換は司会の合図に従ってください。\n運営メモ：演目に使う音源、実尺、道具、入退場の動線を開演前に確認。ダンスが3分だとは断定しない。'},
 {title:'武道館は5項目60点、3人の平均点で評価する',items:slides[10].items.map(a=>a.text==='3人の審査員の平均点を使う'?{...a,text:'各審査員が60点で採点\n3人の平均点を使う',size:28,h:100}:a.text==='全6組の終了後に\n最後の順位を発表'?{...a,y:490}:a),notes:'シャネル：武道館はこの5項目です。各審査員が60点満点で採点して、3人の平均点を使います。\nスーダン：衣装とグループカラーの装飾、面白さ、古参ファンの盛り上がり、そしてアイドル全員が輝いているかを見ます。'},
 {title:'最後にファン数が最も多い組がメジャーデビュー',items:[tx('1点 ＝ 1万人',72,209,540,98,56,PINK,true),tx('武道館で最大60万人を加算',72,351,540,85,35,WHITE,true),tx('最終ファン数＝現在のファン数\n＋武道館の平均点×1万人',72,478,560,129,28),tx('同じファン数になった場合',672,210,536,76,33,WHITE,true),tx('武道館の平均点で比較する',672,324,536,70,30),tx('さらに同点なら\n「全員が輝いているか」で比較する',672,426,536,102,29),tx('そこまで同じなら\n共同受賞・共同メジャーデビュー',672,551,536,84,28)],notes:'スーダン：1点がファン1万人。武道館では最大60万人を獲得できます。全6組が終わってから一括で反映し、最後のファン数でメジャーデビューが決まります。\nシャネル：同じファン数なら武道館の平均点、さらに同点なら「アイドル全員が輝いているか」の評価で決め、そこまで同じなら共同受賞・共同メジャーデビューです。'},
 {title:'さあ、ステージへ。',dark:true,items:[tx('SHOW TIME',72,225,760,119,84,'#FF91B8',true),tx('六つのグループ、それぞれの色で輝こう。',72,393,760,105,39,WHITE,true),tx('最初のグループを、拍手で迎えよう',72,550,760,70,30,WHITE)],notes:'シャネル・スーダン：それでは、最初のグループを紹介します！\nオペレーター：出演順は別途確定した進行表を優先する。司会の紹介に合わせて演目のBGMを再生する。お題を選んだ順と出演順を混同しない。'}
];
function presentationScript(stem){return `
let current=0;const slides=[...document.querySelectorAll('.slide')];
function fit(){document.documentElement.style.setProperty('--slide-fit',Math.min(innerWidth/1280,innerHeight/720));}fit();addEventListener('resize',fit);
function show(n){current=Math.max(0,Math.min(slides.length-1,n));slides.forEach((s,i)=>s.classList.toggle('active',i===current));}
document.getElementById('present').onclick=()=>{document.body.classList.toggle('presenting');show(current);};
document.getElementById('prev').onclick=()=>show(current-1);document.getElementById('next').onclick=()=>show(current+1);
document.getElementById('full').onclick=()=>{document.body.classList.add('presenting');show(current);document.documentElement.requestFullscreen?.();};
addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();document.body.classList.add('presenting');show(current+1);}if(e.key==='ArrowLeft'){e.preventDefault();show(current-1);}if(e.key==='Home')show(0);if(e.key==='End')show(slides.length-1);if(e.key.toLowerCase()==='f')document.getElementById('full').click();});
${stem.includes('budokan')?`
let rankSerial=0;async function refreshRanks(){const serial=++rankSerial;let panel=document.querySelector('.live-ranking');if(!panel){panel=document.createElement('div');panel.className='live-ranking';slides[1].append(panel);}panel.replaceChildren();const status=document.createElement('p');status.textContent='本番の順位を取得中';panel.append(status);
try{const response=await fetch('/api/event?event=production',{cache:'no-store'});if(!response.ok)throw Error('接続を確認してください');const data=await response.json();if(serial!==rankSerial)return;if(!Array.isArray(data.teams)||data.teams.length!==6)throw Error('本番の6チームを確認できません');const table=document.createElement('table');table.innerHTML='<thead><tr><th>順位</th><th>グループ</th><th>ファン数</th><th>GB</th></tr></thead>';const body=document.createElement('tbody');for(const t of data.teams){const row=document.createElement('tr');for(const value of [t.rank+'位',t.name,Number(t.totalFans).toLocaleString('ja-JP')+'人',Number(t.gb).toLocaleString('ja-JP')+' GB']){const cell=document.createElement('td');cell.textContent=value;row.append(cell);}body.append(row);}table.append(body);panel.replaceChildren(table);const stamp=document.createElement('p');stamp.textContent=(data.phase==='preparing'?'イベント開始前':'現在の順位')+'／取得 '+new Date().toLocaleTimeString('ja-JP')+'／イベント時刻 '+data.clock;panel.append(stamp);}catch(error){if(serial!==rankSerial)return;status.textContent='順位を取得できません。参加者ページで確認してください。';const link=document.createElement('a');link.href='https://idol-ekiden-control.coolmyna3.chatgpt.site/#ranking';link.textContent='参加者ページの順位を開く';link.style.color='#ff91b8';status.append(document.createElement('br'),link);}}
document.getElementById('rank-refresh').onclick=refreshRanks;refreshRanks();setInterval(()=>{if(document.body.classList.contains('presenting')&&current===1)refreshRanks();},15000);
` : ''}`;}
async function buildDeck(slides,stem){
const build=path.join(buildBase,stem);await fs.mkdir(build,{recursive:true});
const qr=await fs.readFile(path.join(assetDir,'participant-qr.png'));
const rankQr=await fs.readFile(path.join(assetDir,'ranking-qr.png'));
const pres=Presentation.create({slideSize:{width:W,height:H}});
const layouts=[];
function text(slide,name,item){const s=slide.shapes.add({geometry:'textbox',name,position:{left:item.x,top:item.y,width:item.w,height:item.h},fill:'none',line:{fill:'none',width:0}});s.text=item.text;s.text.style={typeface:FONT,fontSize:item.size,bold:item.bold,color:item.color,verticalAlignment:'middle'};}
for(let i=0;i<slides.length;i++){
 const d=slides[i],s=pres.slides.add();s.background.fill=NAVY;
 if(d.dark)s.images.add({blob:backdrop.buffer.slice(backdrop.byteOffset,backdrop.byteOffset+backdrop.byteLength),contentType:'image/png',alt:'ピンクとシアンの照明がある空のライブステージ',fit:'cover',position:{left:0,top:0,width:W,height:H}});
 text(s,'slide-title',tx(d.title,72,52,1136,118,d.cover?62:42,WHITE,true));
 for(let j=0;j<d.items.length;j++){
  const a=d.items[j];
  if(a.type==='text')text(s,`body-${j}`,a);
  else if(a.type==='qr'){const pic=a.rank?rankQr:qr;s.images.add({blob:pic.buffer.slice(pic.byteOffset,pic.byteOffset+pic.byteLength),contentType:'image/png',alt:'参加者ページへのQRコード',fit:'contain',position:{left:a.x,top:a.y,width:a.w,height:a.h}});}
  else{
   const t=s.tables.add({rows:a.rows.length,columns:a.rows[0].length,left:a.x,top:a.y,width:a.w,height:a.h,columnWidths:a.widths.map(v=>v*a.w),values:a.rows});
   t.styleOptions={headerRow:false,bandedRows:false,firstColumn:false};
   const none={fill:'none',width:0};
   t.cells.block({row:0,column:0,rowCount:a.rows.length,columnCount:a.rows[0].length}).borders={top:none,bottom:none,left:none,right:none,insideVertical:none,insideHorizontal:{fill:'#48536B',width:1}};
   t.cells.block({row:0,column:0,rowCount:1,columnCount:a.rows[0].length}).borders={bottom:{fill:'#C8D3E9',width:1.8}};
   for(let r=0;r<a.rows.length;r++)for(let c=0;c<a.rows[0].length;c++){const cell=t.getCell(r,c);cell.fill='none';cell.text.style={typeface:FONT,fontSize:r===0?a.size+3:a.size,bold:r===0||c===0,color:WHITE};}
  }
 }
 if(!d.dark)text(s,'page-number',tx(`${i+1} / ${slides.length}`,1100,663,108,26,18,GRAY));
 s.speakerNotes.text=d.notes+'\n\n出典：data/rules.json、docs/production/opening-latest-memo.md。';
 const img=await pres.export({slide:s,format:'png',scale:1.5});await fs.writeFile(path.join(build,`${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await img.arrayBuffer()));
 const l=await s.export({format:'layout'});await fs.writeFile(path.join(build,`${String(i+1).padStart(2,'0')}.layout.json`),await l.text());
}
await(await PresentationFile.exportPptx(pres)).save(path.join(build,'candidate.pptx'));
await fs.writeFile(path.join(build,'storyline.json'),JSON.stringify(slides,null,2));
const esc=v=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const pos=a=>`left:${a.x}px;top:${a.y}px;width:${a.w}px;height:${a.h}px;`;
const body=slides.map((s,i)=>`<section class="slide${s.dark?' dark':''}"><h1 style="font-size:${s.cover?62:42}px">${esc(s.title)}</h1>${s.dark?`<img class="stage-background" alt="照明のあるライブステージ" src="data:image/png;base64,${backdrop.toString('base64')}">`:""}${s.items.map(a=>a.type==='text'?`<div class="text" style="${pos(a)}font-size:${a.size}px;color:${a.color};font-weight:${a.bold?700:400}">${esc(a.text)}</div>`:a.type==='qr'?`<a href="${a.rank?url.replace('#routes','#ranking'):url}"><img alt="参加者ページへのQRコード" style="${pos(a)}" src="data:image/png;base64,${(a.rank?rankQr:qr).toString('base64')}"></a>`:`<table style="${pos(a)}font-size:${a.size}px"><colgroup>${a.widths.map(v=>`<col style="width:${v*100}%">`).join('')}</colgroup><thead><tr>${a.rows[0].map(v=>`<th style="font-size:${a.size+3}px">${esc(v)}</th>`).join('')}</tr></thead><tbody>${a.rows.slice(1).map(r=>`<tr>${r.map(v=>`<td>${esc(v).replaceAll('\n','<br>')}</td>`).join('')}</tr>`).join('')}</tbody></table>`).join('')}${s.dark?'':`<footer>${i+1} / ${slides.length}</footer>`}</section>`).join('\n');
await fs.writeFile(path.join(out,stem+'.html'),`<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>327アイドル駅伝 ${stem.includes('budokan')?'武道館ライブ':'開会式'}</title><style>*{box-sizing:border-box}body{margin:0;background:#edf0f5;color:${WHITE};font-family:'Noto Sans JP','Yu Gothic',sans-serif}.slide{position:relative;width:1280px;height:720px;background:${NAVY};margin:24px auto;overflow:hidden;page-break-after:always}.dark{background:${NAVY};color:#fff}.stage-background{position:absolute;inset:0;width:1280px;height:720px;object-fit:cover}.slide-controls{position:fixed;right:16px;bottom:12px;z-index:9;display:flex;gap:8px;opacity:.2}.slide-controls:hover{opacity:1}.slide-controls button{background:#10172a;color:white;border:1px solid #63718e;padding:8px 12px;font:16px sans-serif}.presenting .slide{margin:0;position:fixed;left:0;top:0;display:none;transform-origin:0 0;transform:scale(var(--slide-fit))}.presenting .slide.active{display:block}.presenting{background:#050914!important;zoom:1!important}.live-ranking{position:absolute;left:72px;top:202px;width:1136px;height:437px;background:${NAVY};z-index:2}.live-ranking table{position:static;width:100%;height:375px;font-size:29px}.live-ranking th{font-size:32px}.live-ranking p{font-size:23px;margin:18px 12px 0}.live-ranking td:first-child{color:${PINK};font-size:34px}h1{z-index:1;position:absolute;left:72px;top:52px;width:1136px;height:118px;margin:0;display:flex;align-items:center;line-height:1.25;font-weight:700}.text{z-index:1;position:absolute;display:flex;align-items:center;white-space:pre-line;line-height:1.4}img,table{position:absolute}table,footer,img:not(.stage-background){z-index:1}table{border-collapse:collapse;table-layout:fixed}th,td{text-align:left;padding:8px 12px;line-height:1.35;vertical-align:middle}th{font-weight:700;border-bottom:1.8px solid #c8d3e9;background:none}td{border-bottom:1px solid #48536b}td:first-child{font-weight:700}tr:last-child td{border-bottom:0}footer{position:absolute;left:1100px;top:663px;width:108px;height:26px;font-size:18px;color:${GRAY}}@page{size:338.67mm 190.5mm;margin:0}@media print{.slide-controls{display:none}body{background:#fff}.slide{margin:0;width:338.67mm;height:190.5mm}}@media screen and (max-width:1280px){body{width:1280px;zoom:calc(100vw / 1280px)}}</style></head><body>${body}<div class="slide-controls"><button id="present">発表モード</button><button id="prev">前へ</button><button id="next">次へ</button><button id="full">全画面</button>${stem.includes("budokan")?'<button id="rank-refresh">順位更新</button>':""}</div><script>${presentationScript(stem)}</script></body></html>`);
await fs.writeFile(path.join(out,stem+'-script.md'),'# 開会式のルール説明・司会台本\n\n司会向け。本文1〜12で約6分。13〜17は質問用の補足。読み上げ用の短い台本は opening-ceremony-runbook.md を使用する。\n\nこの版は最新の演目・SNS再検討メモを反映。価格、労働報酬、移動枠、機材・ギミックは未確定。開始時刻を変更する場合は固定時刻を更新する。\n\n'+slides.map((s,i)=>`## ${i+1}. ${s.title}\n\n${s.notes}\n`).join('\n')+'\n## 当日用に確定する項目\n\n- GB価格・労働報酬、SNS評価基準と減点の限度。\n- 台車の型番と乗車・走行の許容条件、距離と乗り替わり方。\n- 5分実施・10分移動と、17:20に戻る行程の実測。\n- BGM、音源の尺、振付資料、演目道具と実施条件。\n- 楽屋6区画の使用可否と出演順。\n\nデザイン参考：[slide-rules.md](https://github.com/carnot-tech/consulting-pptx-skill/blob/main/references/slide-rules.md)。\n');
console.log(`Draft ready: ${slides.length} slides; ${build}`);

}
const opening=[
{...slides[0],items:[tx('デビュー記者会見',72,287,800,80,42,'#FF91B8',true)],notes:'ボンボ：ようこそ、327アイドル駅伝へ！\nグッドマン：今日ここから、六つのアイドルグループが誕生します。\n運営：社長映像の終了後に表紙を表示。開始時間・価格・細かなルールは表紙に記載しない。'},
{...slides[1],notes:'ボンボ：一年目はアイドル。上の年目はデビュー前から応援している古参ファンです。\nグッドマン：チーム全員で一緒に動き、応援や撮影、準備を分担してグループを支えてください。'},
{title:'一番ファンの多いグループが、メジャーデビュー',items:[tx('全国ツアーで、新しいファンを獲得する',72,238,1136,92,43,WHITE,true),tx('最後は共用棟の「武道館」でライブ',72,380,1136,86,39),tx('ライブ終了時のファン数で優勝が決まる',72,529,1136,88,39,PINK,true)],notes:'グッドマン：全国ツアーを回り、昔からのファンの力も借りて、新しいファンを増やしてください。\nボンボ：最後は共用棟の武道館ライブ。一番ファンが多いグループだけが、メジャーデビューをつかみます。詳しい採点は参加者サイトとライブ前の説明で確認できます。'},
{title:'全国ツアーは、北大構内の4会場を巡る',items:[tb([['会場','場所'],['A','クラーク像前'],['B','博物館前'],['C','工学部噴水前'],['D','18条ステージ']],[.15,.85],72,206,1136,418,34)],notes:'ボンボ：全国ツアーは、クラーク像前、博物館前、工学部噴水前、18条ステージの4会場です。\nグッドマン：会場で何をするかは、到着してからのお楽しみ。回る順番はグループごとに違うので、参加者サイトの予定を見て移動してください。'},
{title:'GBを稼いで、衣装や武道館の装飾に使おう',items:[tx('GBは、ゲーム内のお金',72,230,1136,89,48,PINK,true),tx('活動の中で稼いで、グループを育てる',72,366,1136,83,38),tx('ツアーで着る衣装を買う\n武道館ライブの装飾を買う',72,500,1136,119,37,WHITE,true)],notes:'グッドマン：GBは、活動の中で稼げるゲーム内のお金です。\nボンボ：ツアーで着る衣装や、最後の武道館ライブの装飾を買えます。チームで相談して、どう使うか考えてください。詳しい行動や商品は、あとでチームLINEと参加者サイトで案内します。'},
{...slides[11],notes:'ボンボ：出発して最初の会場に着くまでに、グループ名とアイドルらしい挨拶を考えてください。決まったら、チームLINEで森本に送ってください。\nグッドマン：予定と取れる行動は参加者サイトにあります。各チームLINEにもリンクを送ります。自分たちのグループを選んで、最初の会場と集合時刻を確認しましょう。\nボンボ：それでは、メジャーデビューを目指して出発です！'}
];
function anonymize(d){
 const name=v=>v.replaceAll('名前と挨拶は決まったら森本へ送る','名前と挨拶をマネージャーへ送る').replaceAll('森本','マネージャー').replaceAll('ボンボ','司会①').replaceAll('グッドマン','司会②').replaceAll('シャネル','司会①').replaceAll('スーダン','司会②');
 return {...d,title:name(d.title),notes:name(d.notes),items:d.items.map(a=>a.type==='text'?{...a,text:name(a.text)}:a.type==='table'?{...a,rows:a.rows.map(row=>row.map(name))}:a)};
}
await buildDeck(opening.map(anonymize),"opening-rules-v4");
await buildDeck(budokan.map(anonymize),"budokan-rules-v3");
