import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Install-free in Codex runtime; elsewhere set ARTIFACT_TOOL_PATH or install @oai/artifact-tool.
const runtime = process.env.ARTIFACT_TOOL_PATH || 'C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
process.env.RUNTIME_NODE_MODULES ??= 'C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { Presentation, PresentationFile } = await import(pathToFileURL(runtime).href);
const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, '..');
const repo = path.resolve(out, '..');
const workspace = path.resolve(repo, '../..');
const privateDir = path.join(workspace, 'work/presentations/build');
const rules = JSON.parse(await fs.readFile(path.join(repo, 'data/rules.json'), 'utf8'));
const FONT = 'Noto Sans JP';
const NAVY = '#14243F', PINK = '#CF275D', GRAY = '#526078';
const participants = [
 { title:'327アイドル駅伝', cover:true, lead:'一年目がアイドル、上の年目が古参ファン', detail:'参加者説明資料\n15:00 開始　17:30 武道館ライブ\n試運転版：GBの金額・報酬・価格は仮案', notes:'今日は皆さんのチームがアイドルグループになります。一年目はアイドル、上の年目はデビュー前から応援している古参ファンです。一緒に北大構内を回って、最後は寮の共用棟でライブをします。金額と報酬は試運転の仮案です。正式な当日ルールは開始前に運営から案内します。' },
 { title:'チーム全員でアイドルを育て、最後のファン数で競う', table:[['役割','チームで行うこと'],['一年目のアイドル','番組に出演し、衣装と演技で魅力を伝える'],['上の年目の古参ファン','GBを稼ぎ、撮影や応援で推しを支える'],['チーム全員','全員で移動し、出演や購入を相談する']], comment:'勝利条件\nライブ後のファン数が最多の組が優勝\nGBはイベント内で使う通貨\n古参ファンは所属チームを支える', notes:'勝敗を決めるのは最後のファン数です。お金を一番多く残したチームが勝つわけではありません。古参ファンの皆さんが稼ぎ、アイドルの皆さんが表現することで、一緒にグループを育てます。ファン数はゲーム上の人気を表す数値で、参加者が別のチームへ推し変する仕組みではありません。' },
 { title:'15時に始まり、17時20分に共用棟へ集まる', timeline:[['15:00','記者会見・ルール説明'],['15:30〜17:00','指定順のツアーと自由枠'],['17:00','収入を一括清算／仮案'],['17:10','武道館の演目を申告'],['17:20','全員集合・購入締切'],['17:30','武道館ライブ開演']], notes:'一番大事なのは17時20分の集合です。ツアーは15時30分から17時までで、各チームの行動表を配ります。演目の候補は17時に公開し、17時10分までに決めてLINEで知らせてください。ツアーは15分枠で、実施5分と移動10分を見込んでいますが、歩行実測で調整する仮案です。余裕のないときは任意ミッションを省いてください。' },
 { title:'ツアーは各会場25点で、衣装も見た目の評価に入る', table:[['会場','番組の内容','満点'],...rules.venues.map(v=>[`${v.id} ${v.name}`,v.theme,'25点'])], comment:'ファン数への換算\n1点につき1万人\n4会場で最大100点\n各会場の見た目は10点\n購入数では自動加点しない', notes:'クラーク像前がお笑い、博物館前がクイズ、工学部噴水前がスポーツ、18条ステージがダンスです。各会場25点で、そのうちビジュアルが10点です。衣装やおもしろコスプレをうまく使えますが、たくさん買えば自動的に点が付く仕組みではありません。実物の工夫と表現を評価します。1点はファン1万人に換算します。' },
 { title:'初期600 GBを、宣伝・衣装・レッスンに使える', table:[['購入するもの','価格／仮案','上限'],...rules.products.map(p=>[p.name,`${p.price} GB`,`${p.max}回`])], comment:'購入の意味\n通常の宣伝はファン2万人\nスペシャル宣伝は6万人\n衣装・装飾・レッスンは実演を助ける\n支払い前に残高を確認する', notes:'GBはイベント内のお金です。実際の現金を使うものではありません。最初に600GBを持ち、宣伝や衣装素材、武道館レッスン、推し活グッズ、装飾に使えます。宣伝以外はファンが自動で増えません。衣装や練習がステージの評価につながります。金額と回数は試運転の仮案です。' },
 { title:'自由枠の仕事でGBを稼ぎ、ライブの準備に回せる', table:[['仕事','報酬／仮案','回数'],['古参ファン営業①〜③','各200 GB','各1回'],['スポンサーCM','300 GB＋ファン2万人','1回'],['ファンクラブ開設','100 GB','1回'],['合同ロケ・動画リレー','300 GB＋ファン3万人','1回']], comment:'自由枠の使い方\n次の会場への移動を先に確保する\n撮影係・応援係・会計係を相談する\n仕事の結果は運営が確認する\n継続収入は17時に清算／仮案', notes:'自由枠には短い仕事を用意します。古参ファン営業は三つの別のお題で各一回。スポンサーCMは指定の言葉を使った短い動画です。ファンクラブを開くと17時の清算時にファン数に応じた追加収入も入ります。次の会場へ遅れないことを優先し、余裕のある仕事を選んでください。' },
 { title:'スキャンダルは全チーム1回\n16時45分までに対応を選ぶ', table:[['対応','すること','結果／仮案'],['もみ消す','200 GBを払う','減少なし'],['釈明する','指定語で30秒会見を撮る','成立で2万人増'],['話題に乗る','15秒の疑惑CMを撮る','成立で3万人増\n失敗で3万人減']], comment:'芸能ニュースの予定\n16:00 掲載予告\n16:45 対応締切\n16:50 結果記事\n未対応は3万人減／仮案\n架空の疑惑を運営が用意する', notes:'全チームに一度、週刊ケイテキから架空の疑惑が届きます。実際の個人情報や本物のうわさは使いません。対応はもみ消し、釈明、話題に乗るの三択です。16時45分までにチームLINEで申告し、必要な動画を送ってください。動画の成立条件は予告と一緒に示します。支払いと動画対応を二重に行う必要はありません。' },
 { title:'合同ロケは両チームが得をする共同CMにする', columns:[['アイドルが出演する','各グループが短く自己紹介する','相手グループの魅力を紹介する','最後に共同の決め台詞を言う'],['古参ファンが番組を作る','撮影・進行・応援を分担する','集合が難しければ動画リレーにする','運営が両組に同じ報酬を付ける']], notes:'合同ロケはライバルを負かす対決ではなく、共同CMを作る仕事です。アイドルが自己紹介と相手の紹介をし、古参ファンが撮影や進行を担当します。時間割と距離の都合で一緒に撮れないときは、別々に15秒ずつ撮る動画リレーで成立します。一般のSNSへの投稿は必須にせず、イベントのLINE内で提出します。' },
 { title:'武道館の60点が、最後のファン数を大きく動かす', table:[['武道館の評価項目','満点'],...rules.final.criteria.map((c,i)=>[c,`${rules.final.maxima[i]}点`])], comment:'ライブのルール\n1グループ3分の演目\n同じ演目を複数組が選べる\n審査員3人の平均／仮案\n1点につきファン1万人\n上位から出演順を選ぶ', notes:'武道館はツアーの25点を追加せず、この五項目だけで60点です。演目は一組三分。同じ演目を複数のチームが選んでもかまいません。ツアーまでの順位に応じて出演順を選びます。審査員三人の平均を使う案です。古参ファンの応援とカラー装飾も点になります。全員が表現する時間を作ってください。' },
 { title:'全チームのファン数・順位・GBを同じ画面で見られる', columns:[['公開ダッシュボードで確認する','ファン数と暫定順位を見る','全チームのGB残高を見る','最新ニュースと次の締切を見る'],['食い違いは運営へ伝える','チーム名・出来事・時刻をLINEで送る','申請の受付と反映完了を区別する','運営の訂正後に公開値を再確認する']], notes:'公開ダッシュボードでは全チームのGBも見えます。各会場や仕事の結果は運営が確認してから反映します。LINEに送った直後は未反映の場合があります。おかしいと思ったら、チーム名、出来事、時刻をチームLINEで教えてください。画面の数値を参加者が自分で変更することはありません。' },
 { title:'移動と集合を守り、出演のしかたはチームで選べる', columns:[['行動中に守ること','チーム全員で行動し、徒歩で移動する','通行を妨げず、会場担当の指示を守る','撮影は参加者と運営を中心に行う'],['難しいときに相談すること','体調・苦手な演目は運営へ早めに伝える','無理な動きや食べ物の強要は行わない','遅れたら本部に次の行先を確認する']], notes:'一年目が目立つことと、全員が無理をすることは別です。出演のしかたはチーム内で相談し、体調や苦手なことは運営へ伝えてください。アクロバットや組体操、熱い食べ物を使う演目は、運営が条件を決めて許可したものだけにします。移動は徒歩。体調不良や遅れは本部へ連絡してください。' },
 { title:'327アイドル駅伝', end:true, lead:'問い合わせはチームLINEから運営へ', detail:'集合場所：恵迪寮 共用棟「武道館」\n集合 17:20　開演 17:30', notes:'配布するチーム行動表を確認して出発してください。チーム名、グループカラー、撮影係、連絡係を決めます。質問はチームLINEへお願いします。17時20分に全員で共用棟へ戻ってきてください。' }
];
const routeRows = rules.routes.map((route,i)=>[`G${i+1}`,...route.map(x=>x==='FREE'?'自由':x)]);
const staff = [
 { title:'327アイドル駅伝 運営説明', cover:true, lead:'出演を盛り上げ、同じ条件で記録する。', detail:'運営事前打ち合わせ用\n配置・15分枠・GBの金額は仮案\n最新の共通ルールを開始前に全員で確認', notes:'運営説明を始めます。参加者に見せる値は共通ルールからそろえます。今日は各担当の実施と本部への報告、スキャンダル、ニュース、最後のライブを確認します。個人配置と15分枠、金額は仮案です。歩行実測と事前の通し練習で調整し、開始前に当日版を一つに決めます。' },
 { title:'会場・仕事・本部・ライブの担当が連携して進行する', table:[['確認する範囲','詳しい説明'],['配置と時間割','P.3〜5'],['会場採点と仕事の受付','P.6〜9'],['清算・スキャンダル・合同ロケ','P.10〜12'],['ニュースと入力訂正','P.13〜14'],['武道館の進行と採点','P.15']], notes:'資料はこの流れで確認します。会場の採点、仕事の成立判定、本部での入力と公開は分担します。迷った判断は森本へ集めます。自由イベントが忙しいときも、ツアー予約と17時20分の集合を優先します。' },
 { title:'本部2人・会場4人・巡回3人でツアーを支える', table:[['担当／仮案','メンバー','主な仕事'],['本部','森本／小峰','全体・質問対応／台帳・物販・本部イベント'],['ツアー会場','たけ／佐伯／ぷし／やり','A／B／C／Dを各1人で説明・採点'],['巡回・仕事','アレックス／侍／アツコン','撮影・営業・合同ロケ'],['開会司会','ボンボ／グッドマン','記者会見・司会芸'],['武道館司会','シャネル／スーダン','ライブ・司会芸']], notes:'名前はユーザーが示したメンバーです。会場の個人配置は仮案で、参加可能時間の確認が必要です。森本は全体のオペレーションと質問対応、小峰は本部イベントと台帳・物販を担当します。6チームに同行マネージャーを常時付ける想定ではありません。開会司会が終了してから武道館司会が入る交代案で、同時稼働を最大11人にします。名簿全体は13人なので、同時人数と参加実人数を混同しないでください。' },
 { title:'ツアー終了後の30分で清算・演目申告・集合を済ませる', timeline:[['14:30／仮','機材・会場・入力の最終確認'],['15:00〜15:10／仮','記者会見・説明'],['15:10〜15:30／仮','初回会場へ移動'],['15:30〜17:00／仮','15分枠×6回でツアーを受け入れる'],['17:00／17:10／17:20','清算／演目締切／全員集合・取引締切'],['17:30〜18:00／仮','ライブ・集計・受賞']], notes:'15時開始、17時30分開演が確定です。それ以外の区切りと18時終了は仮案です。ツアーの最終枠は16時45分から17時で、内容は冒頭5分まで。遠い会場にいるチームの帰路は必ず実測します。自由枠は移動と準備も含む時間で、追加仕事を必須にしません。' },
 { title:'6枠で各チームが全会場を1回ずつ回る', table:[['組','15:30','15:45','16:00','16:15','16:30','16:45'],...routeRows], small:true, notes:'Aはクラーク像前、Bは博物館前、Cは工学部噴水前、Dは18条ステージです。各列で同じ会場が二重に登場せず、各チームは四会場を一度ずつ回ります。DからAへの長い移動の途中には二つの自由枠を置きました。各枠の最初の5分を会場の実施時間とし、残りは移動です。会場間10分が実際に成立するか、17時20分までに共用棟へ戻れるかを事前に歩いて検証してください。' },
 { title:'会場担当は5分で説明・実施・採点・報告まで進める', timeline:[['0:00〜0:30','チーム名を確認し、お題と評価項目を説明する'],['0:30〜3:30','アイドルの実演と古参ファンの応援を進める'],['3:30〜4:30','4項目を採点し、合計を読み上げる'],['4:30〜5:00','チーム・会場・各点数を本部へ報告する']], notes:'五分枠の進め方です。会場担当は合計点だけでなく、各項目の値も送ってください。長い説明で演技の時間を消さないよう、同じお題を一組分練習してから本番へ入ります。点数は紙にも残します。遅れてきたチームを無断で次の予約に重ねず、本部へ相談します。時間が足りない会場は事前に内容を短く調整します。' },
 { title:'ツアー採点は各25点で、4項目を別々に記録する', table:[['会場','5点ずつの項目','10点の項目'],['A お笑い','おもしろさ／瞬発力／古参ファンの盛り上げ','ビジュアル'],['B クイズ','かしこさ／面白回答／古参ファン能力','ビジュアル'],['C スポーツ','8の字跳び／握力チャレンジ／番組中の面白さ','ビジュアル'],['D ダンス','リズム感／ファンの熱量／やりきり具合','ビジュアル']], notes:'各会場は5点、5点、5点、10点で合計25点です。最大値と最低値を先に説明します。採点は購入した衣装の数ではなく実物と表現を見ます。身体能力の課題を行えない場合の代替お題を用意し、同じ満点で評価します。全体公開は本部が入力し、1点あたり1万人を加算します。' },
 { title:'物販は残高と購入回数を確認してから渡す', table:[['商品','価格／仮案','チーム上限'],...rules.products.map(p=>[p.name,`${p.price} GB`,`${p.max}回`])], notes:'物販はまずチームを確認し、公開残高と購入回数を見ます。購入申請と受け渡しは一件の取引として記録してください。GBの減算前に品物を渡すと、後から二重処理しやすくなります。通常の宣伝はファン2万人、スペシャル宣伝は6万人で、後者には提出物確認を必要とします。衣装と装飾は自動加点しません。すべて17時20分で締めます。' },
 { title:'仕事は成立条件を先に示し、重複報酬を防ぐ', table:[['仕事','報酬／仮案','記録するもの'],['営業①〜③','各200 GB／各1回','お題番号と成立'],['スポンサーCM','300 GB＋2万人／1回','動画と指定語'],['ファンクラブ開設','100 GB／1回','登録の受付'],['合同ロケ','300 GB＋3万人／各組1回','相手組と動画']], notes:'仕事の難しさをその場の気分で変えず、お題と成立条件を事前に示します。成立したらチーム、仕事名、受付時刻、確認担当を送ります。営業は①②③で各一回。合同ロケは相手のチームIDも残します。ツアーの時間に食い込む追加仕事は誘わず、間に合わない場合は動画リレーや未実施を選べます。' },
 { title:'継続収入は17時に1回まとめて清算する', table:[['収入／仮案','対象','追加GB'],['スポンサー継続','スポンサーCMを成立済み','200 GB'],['ファンクラブ継続','ファンクラブを開設済み','ファン10万人ごと50 GB'],['ファンクラブの上限','開設済みの各チーム','最大300 GB']], comment:'清算の手順\n17:00時点のファン数を固定する\n未反映の成立申請を確認する\n各チームへ清算額を伝える\n同じチームへの清算は1回だけ', notes:'初期の案には定期収入がありましたが、今回の試運転では17時の一回清算にまとめます。スポンサーは成立済みなら200GB追加。ファンクラブは17時時点のファン数を10万人単位で切り捨て、単位数に50GBを掛け、上限300GBです。17時直前の未反映処理を解消してから基準値を固定します。時間を過ぎていることだけを理由に報酬を勝手に消さず、受付時刻を見て判断します。' },
 { title:'スキャンダルの条件をそろえ、各組1件だけ処理する', table:[['対応','成立条件','結果／仮案'],['もみ消し','残高200 GB以上で支払い','200 GB減／ファン増減なし'],['釈明','指定語入り30秒会見','成立2万人増／失敗3万人減'],['話題化','疑惑を題材に15秒CM','成立3万人増／失敗3万人減'],['未対応','16:45までに申告なし','3万人減']], comment:'16:00に予告する\n16:45に対応を締める\n16:50に結果を公開する\n架空の疑惑を各組1件配る\n追加の口止め料は請求しない', notes:'スキャンダルは全チーム一回です。題材は違っても価格、動画時間、結果は同じにします。成立条件は指定語を含む、時間内、疑惑を扱うなど確認可能な条件にし、面白さだけで失敗としないでください。対応を一つ確定したら別の対応を二重登録しません。もみ消した記事は実際に秘密を暴くのではなく、掲載見送りという架空の短いニュースにします。' },
 { title:'合同ロケで会えない組は動画リレーにする', columns:[['巡回担当が調整する','同じ自由時間と近い場所の組を組み合わせる','各組が自己紹介と相手紹介を撮る','終了後は次の予約会場へ案内する'],['本部が両組を確認する','難しい組には15秒ずつの動画リレーを案内する','両組の提出を確認し、各組1回で登録する','余裕がない組への参加は強制しない']], notes:'時間割上は同じ自由枠でも現場が離れていることがあります。ペアは例としてG1とG2、G3とG4、G5とG6ですが、当日の動線に応じて本部が確定します。全組に同じ動画リレーの代替を示してください。相手の提出待ちで次の会場へ遅れないよう、各組が提出した後は別行動へ戻れます。グループ同士を合流させるために予約を崩しません。' },
 { title:'確定した結果から記事を作り、運営が確認して掲載する', columns:[['記事を準備する','テンプレートに組名・出来事・結果を入れる','写真と動画は本人の掲載範囲を確認する','ゲーム内の架空ニュースだと分かる表現にする'],['本部が公開する','数値を記録済みの結果と照合する','運営が承認後、ダッシュボードへ掲載する','同じ本文を全体LINEへ手動投稿する']], notes:'ニュースは入力が確定してから書きます。AIを使う場合も、運営が数値と内容を確認します。未確定の採点を記事で先に発表しないでください。掲載先はイベントのダッシュボードとLINEで、外部SNSへの投稿は別途本人の意向を確認します。個人の秘密や本物の疑惑は記事に使いません。' },
 { title:'誤入力は履歴を残して取り消し、正しい値を登録する', columns:[['登録する前に確認する','チームと出来事の種類を確認する','会場・購入回数・締切を確認する','採点は項目別の原票と照合する'],['通信や入力が止まったら切り替える','紙にチーム・時刻・点数・GBを記録する','同時更新は再確認し、控えと照合する','訂正は理由と担当を残し、旧記録を黙って消さない']], notes:'公開値はイベントの台帳から計算します。運営側の入力は本部端末を基本とし、配信は手動です。同時に編集したときは最新の台帳を再確認し、処理を重ねないでください。公開環境と端末間の同期は本番前に通し試験を行います。紙の原票を持ち、通信が止まったら記録を続けます。復旧後は二重登録を防いで照合します。' },
 { title:'武道館は演目3分と転換1分で進める', table:[['評価項目','満点'],...rules.final.criteria.map((c,i)=>[c,`${rules.final.maxima[i]}点`])], comment:'開演までの準備\n17:10までに演目を集める\n17:20に出演順と音源を確認する\n17:30から6組が出演する\n審査員3人の平均／仮案\n最後に結果確認と受賞を行う', notes:'六組の三分で18分、各組の転換1分を六回で6分、合計24分を目安にします。17時30分までに紹介を終え、残りの六分を集計中の司会芸と受賞に使う18時終演の仮案です。採点は五項目だけで60点。各審査員の五項目合計を平均し、最後に一度だけ小数1位へ丸め、1点1万人で加算する案です。すべての提出が入ったことを確認してから順位を確定します。同点時の決め方はルール確定時に参加者へ説明します。' },
 { title:'327アイドル駅伝 運営本部', end:true, lead:'全体の判断・チーム質問対応：森本', detail:'運営連絡は担当用LINEへ\n参加者連絡はチームLINEへ\n開演 17:30　共用棟「武道館」', notes:'各担当は自分の説明と原票を確認してください。物品、徒歩時間、司会の交代、雨天代替、採点の通し練習、音源、入力端末、通信断用の紙台帳は開始前に確認します。未確定の担当や価格を当日までに一つのルールへそろえましょう。' }
];

function textbox(slide, name, value, x, y, w, h, size=27, color=NAVY, bold=false) {
 const shape=slide.shapes.add({geometry:'textbox',name,position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 shape.text=value;
 shape.text.style={typeface:FONT,fontSize:size,bold,color,verticalAlignment:'middle'};
 return shape;
}
function table(slide, rows, withComment, small=false) {
 const width=withComment?730:1136;
 const count=rows[0].length;
 const weights=rows[0][0]==='対応'?[.28,.39,.33]:count===2?[.55,.45]:count===3?[.39,.37,.24]:count===7?[.11,.1483,.1483,.1483,.1483,.1483,.1483]:Array(count).fill(1/count);
 const tab=slide.tables.add({rows:rows.length,columns:count,left:72,top:184,width,height:440,columnWidths:weights.map(v=>v*width),values:rows});
 tab.styleOptions={headerRow:false,bandedRows:false,firstColumn:false};
 const noBorder={fill:'none',width:0};
 tab.cells.block({row:0,column:0,rowCount:rows.length,columnCount:count}).borders={top:noBorder,bottom:noBorder,left:noBorder,right:noBorder,insideVertical:noBorder,insideHorizontal:{fill:'#CCCCCC',width:1}};
 tab.cells.block({row:0,column:0,rowCount:1,columnCount:count}).borders={bottom:{fill:NAVY,width:1.8}};
 for(let r=0;r<rows.length;r++) for(let c=0;c<count;c++) {
   const cell=tab.getCell(r,c);
   cell.fill='none';
   cell.text.style={typeface:FONT,fontSize:r===0?(small?25:28):(small?25:24),color:NAVY,bold:r===0||c===0};
 }
 return tab;
}
function htmlEscape(value){return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');}
function htmlDeck(deck,title) {
 const slides=deck.map((s,i)=>{
   let body=s.table?`<table><thead><tr>${s.table[0].map(v=>`<th>${htmlEscape(v)}</th>`).join('')}</tr></thead><tbody>${s.table.slice(1).map(r=>`<tr>${r.map(v=>`<td>${htmlEscape(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>${s.comment?`<div class="comment">${s.comment.split('\n').map((v,j)=>j===0?`<h2>${htmlEscape(v)}</h2>`:`<p>${htmlEscape(v)}</p>`).join('')}</div>`:''}`:
    s.timeline?`<div class="timeline">${s.timeline.map(([t,v])=>`<div><strong>${htmlEscape(t)}</strong><p>${htmlEscape(v)}</p></div>`).join('')}</div>`:
    s.columns?`<div class="columns">${s.columns.map(col=>`<div><h2>${htmlEscape(col[0])}</h2>${col.slice(1).map(v=>`<p>${htmlEscape(v)}</p>`).join('')}</div>`).join('')}</div>`:
    `<div class="cover-body"><h2>${htmlEscape(s.lead)}</h2><p>${htmlEscape(s.detail).replaceAll('\n','<br>')}</p></div>`;
   return `<section class="slide ${s.cover||s.end?'dark':''}" data-slide="${i+1}"><h1>${htmlEscape(s.title).replaceAll('\n','<br>')}</h1><main class="${s.comment?'split':''}">${body}</main>${s.cover||s.end?'':`<footer>${i+1} / ${deck.length}</footer>`}</section>`;
 }).join('\n');
 return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${htmlEscape(title)}</title><style>
 *{box-sizing:border-box}body{margin:0;background:#edf0f5;color:${NAVY};font-family:'Noto Sans JP','Yu Gothic',sans-serif}.slide{width:1280px;height:720px;margin:24px auto;padding:64px 72px;position:relative;background:white;page-break-after:always;overflow:hidden}h1{font-size:42px;line-height:1.35;margin:0;height:92px;font-weight:700}main{height:440px;margin-top:28px;display:flex;align-items:stretch}.split{gap:56px}.split table{width:730px}.comment{width:350px}h2{font-size:29px;line-height:1.4;margin:0 0 34px;font-weight:700}p{font-size:27px;line-height:1.5;margin:0 0 30px}table{width:100%;height:440px;border-collapse:collapse;table-layout:fixed}th{font-size:28px;font-weight:700;text-align:left;background:none;border-bottom:1.8px solid ${NAVY};padding:10px 12px;line-height:1.35}td{font-size:24px;line-height:1.5;padding:10px 12px;border-bottom:1px solid #ccc;vertical-align:middle}td:first-child{font-weight:700}tr:last-child td{border-bottom:0}.columns{display:grid;grid-template-columns:1fr 1fr;gap:64px;width:100%}.timeline{width:100%;display:flex;flex-direction:column;justify-content:space-around}.timeline>div{display:flex;align-items:center;gap:56px}.timeline strong{font-size:29px;color:${PINK};width:300px;flex:none}.timeline p{margin:0;flex:1;font-size:29px}.cover-body{align-self:center}.cover-body h2{font-size:36px;font-weight:500}.cover-body p{font-size:29px;line-height:1.9}.dark{background:${NAVY};color:#fff}.dark h1{font-size:62px;height:100px}.dark h2{color:#f6a4bf}footer{position:absolute;bottom:34px;right:72px;font-size:17px;color:${GRAY}}@page{size:338.67mm 190.5mm;margin:0}@media print{body{background:white}.slide{margin:0;width:338.67mm;height:190.5mm}}@media screen and (max-width:1280px){body{width:1280px;zoom:calc(100vw / 1280px)}}
 </style></head><body>${slides}</body></html>`;
}

async function build(deck, stem) {
 const pres=Presentation.create({slideSize:{width:1280,height:720}});
 const frames=path.join(privateDir,stem);await fs.mkdir(frames,{recursive:true});
 for(let i=0;i<deck.length;i++){
  const d=deck[i],slide=pres.slides.add();
  slide.background.fill=d.cover||d.end?NAVY:'#FFFFFF';
  textbox(slide,'slide-title',d.title,72,64,1136,100,d.cover||d.end?62:42,d.cover||d.end?'#FFFFFF':NAVY,true);
  if(d.cover||d.end){textbox(slide,'cover-lead',d.lead,72,263,1136,85,36,'#F6A4BF');textbox(slide,'cover-detail',d.detail,72,392,1136,186,29,'#FFFFFF');}
  else if(d.table){table(slide,d.table,!!d.comment,d.small);if(d.comment){const c=d.comment.split('\n');textbox(slide,'comment-heading',c[0],858,184,350,63,28,NAVY,true);c.slice(1).forEach((v,j)=>textbox(slide,`comment-${j}`,v,858,267+j*70,350,65,25));}}
  else if(d.columns){d.columns.forEach((col,c)=>{const x=72+c*600;textbox(slide,`column-${c}`,col[0],x,200,536,68,29,NAVY,true);col.slice(1).forEach((v,j)=>textbox(slide,`column-${c}-row-${j}`,v,x,308+j*98,536,75,28));});}
  else if(d.timeline){const step=440/d.timeline.length;d.timeline.forEach(([t,v],j)=>{textbox(slide,`time-${j}`,t,72,184+j*step,326,step-4,29,PINK,true);textbox(slide,`event-${j}`,v,436,184+j*step,772,step-4,29);});}
  if(!d.cover&&!d.end)textbox(slide,'page-number',`${i+1} / ${deck.length}`,1090,660,118,27,17,GRAY);
  slide.speakerNotes.text=d.notes+'\n\n出典：企画議事録と共通ルール '+rules.version+'。デザイン参考：https://github.com/carnot-tech/consulting-pptx-skill/blob/main/references/slide-rules.md';
 }
 const candidate=path.join(frames,'candidate.pptx');
 await(await PresentationFile.exportPptx(pres)).save(candidate);
 for(let i=0;i<pres.slides.items.length;i++){
  const slide=pres.slides.items[i];
  const png=await pres.export({slide,format:'png',scale:1});
  await fs.writeFile(path.join(frames,`${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await png.arrayBuffer()));
  const layout=await slide.export({format:'layout'});await fs.writeFile(path.join(frames,`${String(i+1).padStart(2,'0')}.layout.json`),await layout.text());
 }
 // PNG previews also form the PDF fallback, avoiding a runtime PDF standard-font dependency.
 const skill='C:/Users/user/.codex/plugins/cache/openai-primary-runtime/presentations/26.1007.11041/skills/presentations';
 const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href);
 const tableOwners=deck.flatMap((d,i)=>d.table?[i+1]:[]);
 await finalizePresentation({workspaceDir:workspace,candidatePath:candidate,finalPath:path.join(out,`${stem}.pptx`),pythonExecutable:'C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit',...tableOwners.flatMap(i=>['--require-native-table-slide',String(i)])],explicitTotalSlideCount:deck.length,requiredNativeTableOwnerSlides:tableOwners,requiredNativeChartOwnerSlides:[],fontPolicy:{basis:'design',families:[FONT]},verifyArtifactToolImport:true,receiptPath:path.join(frames,'validation-'+Date.now()+'.json')});
 await fs.writeFile(path.join(out,`${stem}.html`),htmlDeck(deck,deck[0].title));
 await fs.writeFile(path.join(out,`${stem}-script.md`),`# ${deck[0].title} 説明台本\n\n版：${rules.version}\n\n`+deck.map((d,i)=>`## ${i+1}. ${d.title}\n\n${d.notes}\n`).join('\n'));
 await fs.writeFile(path.join(frames,'storyline.json'),JSON.stringify(deck,null,2));
 console.log(stem+' completed '+deck.length+' slides');
}
await fs.mkdir(privateDir,{recursive:true});
await build(participants,'participants');
await build(staff,'staff');
