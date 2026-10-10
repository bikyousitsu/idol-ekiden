/**
 * 運営が確認・編集してから公開する、架空ニュースの原稿。
 * state は calculate() の戻り値。得点・報酬を決める処理は持たない。
 */
const FICTION = 'この記事とコメントは、アイドル駅伝の演出として作られた架空の内容です。実在の報道・人物評価ではありません。';
const limit = (value, length) => Array.from(String(value ?? '')).slice(0, length).join('');
const money = value => `${value >= 0 ? '+' : ''}${value}GB`;
const fans = value => `${value >= 0 ? '+' : ''}${value / 10000}万人`;

/** 「辛口」は架空の活動へのツッコミ。個人の容姿・属性・噂に向けない。 */
export function commentDraft(style = 'mixed', headline = '', teamName = 'このグループ') {
  const name = limit(teamName || 'このグループ', 40);
  if (String(headline).includes('掲載見送り')) return coverComments();
  const support = [
    ['古参のうちわ係', '応援', `${name}、目立つ場面だけじゃなく移動も準備もみんなでやってほしい。最後まで応援する。`, 42, 3],
    ['サビだけ覚えた人', '応援', '完成度も気になるけど、全員が出てきてやりきるステージを見たい。古参ファンの出番も頼む。', 31, 2],
    ['現場には間に合う予定', '応援', 'こういう企画は照れずに乗った組が強いと思う。武道館で答え合わせしたい。', 27, 4],
    ['うちわは自作派', '応援', '衣装も装飾も、そのグループらしさが出ていたらうれしい。材料の値段だけじゃ決まらない。', 35, 2],
  ];
  const analysis = [
    ['数字を見る古参', '考察', '記事の勢いと順位は別。ファン数・GB・巡った会場数を一緒に見たい。今の順位だけで決めつけるのは早そう。', 38, 5],
    ['ライブ待機中', '考察', '話題をつくる作戦はありだと思う。ただ、最後に何を見せるかまで考えているかは気になる。', 25, 6],
  ];
  const spicy = [
    ['宣伝より本編派', '辛口', `${name}、宣伝の見出しは強いけど、本編が追いつくかはまだ分からない。ステージで見せてほしい。`, 24, 12],
    ['課金には慎重', '辛口', 'GBを使って話題を買うのは作戦として分かる。でも、それだけで人気グループ気分になられると困る。', 19, 16],
    ['前置きは短めで', '辛口', '壮大な予告のあとに普通の自己紹介だったら笑ってしまう。ハードルは自分たちで上げすぎない方がいい。', 22, 11],
  ];
  if (/合同|共演|コラボ/.test(headline)) {
    support[0][2] = `${name}、相手も目立つ共演になったらうれしい。競争しながら協力できるのは良い。`;
    analysis[0][2] = '合同ロケは各組一回なので、組み合わせも作戦になりそう。一方だけが主役になっていないかも見たい。';
    spicy[0][2] = '合同といいつつ自己紹介を二本つなげただけだと寂しい。二組いるからこその場面に期待。';
  } else if (/衣装|ちょんまげ|装飾/.test(headline)) {
    support[0][2] = '動物の耳もキラキラも、全員が着るならグループ感が出そう。古参ファンのうちわも合わせたい。';
    analysis[0][2] = '衣装を買った数と見栄えは別。少ない素材をどう組み合わせるかを見るのも楽しみ。';
    spicy[0][2] = '派手な材料を全部乗せしただけで完成と言われると困る。色かテーマはそろえてほしい。';
  } else if (/釈明|話題化|スキャンダル/.test(headline)) {
    support[0][2] = '架空のお題にどう返すかも演目の一つだと思う。役になりきって切り抜けてほしい。';
    analysis[0][2] = '対応の選択で数字が動くけど、最後は本番まである。ここだけで勝負は決まらなさそう。';
    spicy[0][2] = '話題づくりだけはうまい、で終わらないといいな。次のステージで中身も見せてほしい。';
  } else if (/武道館|デビュー|ライブ/.test(headline)) {
    support[0][2] = `${name}、誰か一人に全部任せず全員の見せ場をつくってほしい。古参ファンも盛り上げよう。`;
    analysis[0][2] = 'ツアーの順位と武道館の出来は同じとは限らない。全組が終わってから結果を見たい。';
    spicy[0][2] = '登場だけやたらかっこよくて本編が小声だと困る。準備の成果をちゃんと届けてほしい。';
  }
  const rows = style === 'supportive'
    ? [support[0], support[1], support[3], analysis[0]]
    : style === 'spicy'
      ? [support[2], spicy[0], analysis[1], spicy[1], spicy[2]]
      : [support[0], analysis[0], spicy[0], support[1], analysis[1]];
  return rows.map(([author, stance, text, agree, disagree], index) => ({
    id: `fiction-comment-${index + 1}`, author, stance,
    text: limit(text, 250), agree, disagree,
  }));
}

function coverComments() {
  return [
    ['見守る古参', '応援', '載せないと決めた内容は追わなくていい。次の活動を見たい。', 43, 3],
    ['資金配分が気になる', '考察', '限られたGBの使い方として選んだんだと思う。本番の準備との兼ね合いが気になる。', 28, 5],
    ['本編待ち', '辛口', 'ニュースが静かになった分、ステージはちゃんと派手にしてほしい。', 22, 12],
    ['話題より歌派', '応援', 'ここで終わりじゃないので。ライブを楽しみにしています。', 31, 2],
  ].map(([author, stance, text, agree, disagree], i) => ({ id: `cover-comment-${i + 1}`, author, stance, text, agree, disagree }));
}

/** 16:50の結果公開時に各グループの記事を独立したURLで公開する素材。 */
export function scandalResultDraft(team, time = '16:50') {
  const name = team?.name || '出演グループ';
  const scandal = team?.scandal;
  if (!scandal?.published) return null;
  const mode = scandal.resolution || 'ignored';
  const delta = fans(scandal.result || 0);
  if (mode === 'cover') return {
    ...article({
      headline: `${name}の記事は掲載見送り　週刊ケイテキ編集部「内容は公表しない」`,
      summary: `${name}について予定していた記事は掲載見送り。元の架空トピックは公表せず、ファン数の変動がないことを伝える。`,
      paragraphs: [
        `週刊ケイテキ編集部は${name}について予定していた記事の掲載を見送った。これはアイドル駅伝のゲーム内手続きによるもの。元のトピックの内容は公表しない。`,
        '運営が確定した結果は、ファン数の変動なし。現在のGB・ファン数・順位は、参加者用ダッシュボードで確認できる。',
        '編集部は、見送った内容を本文やコメント、画像、LINEの紹介文に記載しない。記事の反応を根拠に追加の加点を行うこともない。',
      ], category: 'スキャンダル', illustration: 'scandal', teamIds: [team.id], comments: coverComments(),
    }), time, target: 'all', private: false,
  };
  const angle = {
    apology: ['釈明で対応', '短い釈明を実施し、運営が成功条件の達成を確認した。役になりきって返すことも、このイベントでは一つのパフォーマンスになる。'],
    publicity: ['話題化を選択', '架空の掲載予告を話題化する対応を実施し、運営が成功条件の達成を確認した。注目を集める作戦を選び、その結果が記録された。'],
    failed: ['対応は成功条件に届かず', '掲載予告への対応は実施されたものの、運営が確認した結果では成功条件に届かなかった。次の会場や武道館へ向けた立て直しも作戦の一つになる。'],
    ignored: ['期限内の対応を確認できず', '対応期限までに必要な対応を確認できなかったため、仮ルールに沿って結果が記録された。個人の態度や人格を評価した結果ではない。'],
  }[mode] || ['対応結果を確認', '運営が確定したゲーム内の結果を掲載する。'];
  return {
    ...article({
      headline: `${name}、${angle[0]}　架空の掲載予告への結果を公開`,
      summary: `${name}への架空トピック「${scandal.topic}」の対応結果。運営が確定したファン数の変動は${delta}。`,
      paragraphs: [
        `${name}に届いたのは「${scandal.topic}」という架空の掲載予告。これは実際の疑惑や個人の噂を指すものではなく、全グループが一度ずつ参加する企画のお題である。`,
        angle[1],
        `運営が確定したファン数の変動は${delta}。ファン残高の下限はゼロ。現在の残高と順位は、参加者用ダッシュボードで確認できる。`,
        '本人の発言・実演内容を詳しく載せる場合は、運営が確認した内容だけを追記する。本記事のコメントや賛同数によって、得点・GB・ファン数を変更しない。',
      ], category: 'スキャンダル', illustration: 'scandal', teamIds: [team.id], teamName: name,
      style: mode === 'failed' || mode === 'ignored' ? 'supportive' : 'mixed',
    }), time, target: 'all', private: false,
  };
}

function article({ headline, summary, paragraphs, category = '活動', illustration = 'stage', teamIds = [], style = 'mixed', teamName, comments }) {
  const copy = paragraphs.filter(Boolean).join('\n\n');
  return {
    headline: limit(headline, 100), summary: limit(summary, 180),
    body: `${limit(copy, 6000 - Array.from(FICTION).length - 2)}\n\n${FICTION}`,
    category, illustration, teamIds,
    comments: comments || commentDraft(style, headline, teamName),
  };
}

/** legacy が null の操作（未公開の武道館採点等）から原稿を作らない。 */
export function editorialDraft(action, state, legacy) {
  if (!legacy) return null;
  const teams = state?.teams || [];
  const team = teams.find(t => t.id === action.teamId);
  const name = team?.name || '出演グループ';
  const effect = (state?.effects || []).find(e => e.id === action.id);
  let content;

  if (action.kind === 'scandal_open') {
    content = article({
      headline: `【運営プレビュー】${name}に掲載予告　対応は16:45まで`,
      summary: 'これは対象チームに個別で伝える掲載予告です。参加者用のニュース一覧・記事ページには公開しません。',
      paragraphs: [
        `週刊ケイテキ編集部から${name}に、ゲーム内の架空トピック「${team?.scandal?.topic || '指定の掲載予告'}」について連絡が届いた。これは実際の不祥事や個人の噂ではなく、全組が一度ずつ参加するイベントのお題である。`,
        legacy.body,
        '森本は原稿と対象チームを確認し、対象のチームLINEにのみ手動で伝える。もみ消しを選んだ場合は、このトピックを後の公開記事へ転載しない。',
      ],
      category: 'スキャンダル', illustration: 'scandal', teamIds: [action.teamId], style: 'mixed', teamName: name,
    });
  } else if (action.kind === 'scandal_publish') {
    const lines = teams.map(t => {
      const s = t.scandal;
      if (s?.resolution === 'cover') return `${t.name}：掲載見送り。トピックの内容は公表しない。ファン数の変動なし。`;
      const result = fans(s?.result || 0);
      if (s?.resolution === 'apology') return `${t.name}：架空トピック「${s.topic}」に釈明で対応。確認済みの結果はファン数${result}。`;
      if (s?.resolution === 'publicity') return `${t.name}：架空トピック「${s.topic}」を話題化する対応を選んだ。確認済みの結果はファン数${result}。`;
      if (s?.resolution === 'failed') return `${t.name}：架空トピック「${s.topic}」への対応が成功条件に届かなかった。確認済みの結果はファン数${result}。`;
      return `${t.name}：掲載予告への対応を確認できず。確認済みの結果はファン数${result}。`;
    });
    content = article({
      headline: '週刊ケイテキ、6組の対応結果を公開　釈明・話題化・掲載見送りに分かれる',
      summary: '全グループが一度ずつ挑んだ架空スキャンダル企画の結果を公開。掲載見送りのトピックは明かさず、運営が確定したファン数の変動を掲載する。',
      paragraphs: [
        'ツアー途中に届いた掲載予告をめぐり、各組がそれぞれの対応を選んだ。人気の数字だけでなく、限られた時間とGBをどう使うかが問われる企画となっている。',
        lines.join('\n'),
        '本記事は確定した処理結果を伝えるもの。記事や架空コメントの盛り上がりに合わせた追加加点は行わない。掲載を見送った内容を、本文・コメント・画像・LINE告知で明かすこともない。',
      ],
      category: 'スキャンダル', illustration: 'scandal', teamIds: teams.map(t => t.id),
      comments: [
        ['見出しに弱い古参', '応援', '釈明をステージに変えられたら面白い。架空のお題だからこそ、最後まで役になりきってほしい。', 36, 4],
        ['収支を追う人', '考察', '掲載見送りの内容は知らなくていいと思う。対応に何を使って、その後どう動くかを見たい。', 41, 5],
        ['炎上商法は苦手', '辛口', '話題化が成功したとしても、次の本編まで「話題」だけで走るのはしんどい。ちゃんと芸を見せてほしい。', 23, 15],
        ['開演待ちのファン', '応援', '数字が動くと焦るけど、ここで終わりじゃない。古参ファンも最後の準備を手伝おう。', 30, 3],
        ['定点観測中', '考察', '対応結果と実際のファン残高はダッシュボードで確認したい。残高ゼロの場合、減少には下限もある。', 19, 4],
      ].map(([author, stance, text, agree, disagree], i) => ({ id: `scandal-comment-${i + 1}`, author, stance, text, agree, disagree })),
    });
  } else if (action.kind === 'collab') {
    const names = action.teamIds.map(id => teams.find(t => t.id === id)?.name || id);
    content = article({
      headline: `${names.join('×')}、合同CMで共演　ライバル同士の一回限りのロケ`,
      summary: `${names.join('と')}の合同ロケを運営が確認。各組に出演料300GB、新規ファン3万人を追加した。`,
      paragraphs: [
        '競い合う2組が、合同ロケという共通のミッションで顔をそろえた。相手を引き立てながら自分たちの見せ場もつくれるか。同じ会場を回るだけでは見えない、グループ同士のやり取りが題材になる。',
        legacy.body,
        '合同ロケの受取は各組一回。この記事でロケの細部や名場面を紹介する場合は、運営が映像・実施内容を確認してから追記する。出演料・ファン数の再加算はしない。',
      ], category: '合同ロケ', illustration: 'collab', teamIds: action.teamIds, teamName: names.join('と'),
    });
  } else if (action.kind === 'phase' && action.value === 'announced') {
    const winners = teams.filter(t => t.rank === 1).map(t => t.name).join('・');
    content = article({
      headline: `${winners || '優勝グループ'}がメジャーデビュー　武道館を終え最終結果確定`,
      summary: '全6組の武道館採点と公開処理を終え、最終順位を発表。ツアーの活動と最後のステージを合わせた結果が出そろった。',
      paragraphs: [
        '寮共用棟の「武道館」で各グループが最後のパフォーマンスを披露し、すべての採点を終えた。アイドルの見せ場をつくった古参ファンも含め、グループごとの活動が最終結果につながる。',
        legacy.body,
        '武道館は審査員3人が5項目・合計60点で評価。各項目の平均を合計し、小数第一位に丸めた得点が追加ファン数に換算される。同点時の処理も共通ルールに従う。',
      ], category: '武道館', illustration: 'award', teamIds: teams.map(t => t.id), style: 'supportive', teamName: winners,
    });
  } else if (effect && team && ['stage', 'mission', 'purchase', 'sns'].includes(action.kind)) {
    const isWardrobe = action.kind === 'purchase' && ['costume', 'fanGoods', 'decoration'].includes(action.productId);
    const isAd = action.kind === 'purchase' && ['ad', 'specialAd'].includes(action.productId);
    const angles = {
      stage: ['ツアー会場の採点を終えた', '会場ごとの課題に挑み、運営が得点を確認した。記事の評判ではなく、共通の採点項目で決まったファン数が記録される。'],
      mission: ['古参ファンもグループの活動を支える', 'アイドルを目立たせるための準備や営業も、グループを動かす役割の一つ。運営がミッションの達成を確認し、決められた報酬を記録した。'],
      purchase: isWardrobe
        ? ['武道館へ向けた準備にGBを投入', '衣装や推し活グッズ、装飾は使い方が見せ場になる。購入の数や値段だけでファン数・採点が増えるものではない。どんなステージに仕上げるかが次の焦点だ。']
        : isAd
          ? ['宣伝で新しいファンへアプローチ', 'GBを活動のために使う選択として、宣伝の手続きが確認された。話題づくりと本番の仕上がりをどう両立するかが注目点になる。']
          : ['本番に向けてGBの使い道を選ぶ', '準備のための購入が確認された。今使うGBと、あとで残したいGB。限られた持ち時間と資金の中で、それぞれの作戦が見えてくる。'],
      sns: ['SNS企画への投稿を運営が受理', '投稿内容を運営が確認し、SNS企画として受理した。外部サービス上の再生回数や実際の反応を、この記事が報告するものではない。'],
    };
    const [angle, paragraph] = angles[action.kind];
    content = article({
      headline: `${name}、${effect.label}を完了　${angle}`,
      summary: `確認済みの${effect.label}。GB変動は${money(effect.gb)}、ファン数の変動は${fans(effect.fans)}。`,
      paragraphs: [
        `${name}が${effect.label}を完了した。${paragraph}`,
        `確認済みの記録は、GB変動${money(effect.gb)}、ファン数の変動${fans(effect.fans)}。現在の残高や順位はダッシュボードで確認できる。`,
        '運営は実施内容・写真や映像の掲載可否を確認し、具体的な場面をこの段落に追記してから公開する。確認していない観客の反応や本人の発言は書き足さない。',
      ], category: '活動', illustration: 'stage', teamIds: [team.id], teamName: name,
    });
  } else {
    content = article({
      headline: legacy.headline || '運営からのお知らせ',
      summary: 'アイドル駅伝の進行に関するお知らせ。内容を運営が確認してから公開します。',
      paragraphs: [legacy.body || '内容を記入してください。'],
      category: '運営', illustration: 'notice', teamIds: legacy.target && legacy.target !== 'all' ? [legacy.target] : [],
      style: 'supportive',
    });
  }
  return { ...legacy, ...content };
}

/** 実際の出来事・成績と混ぜない、練習モード専用の読み物。 */
export function sampleArticles() {
  const examples = [
    {
      id: 'demo-open', time: '15:00', headline: '【練習記事】恵迪寮発、6組がデビューを目指す　古参ファンも一緒にツアーへ',
      summary: 'これは架空の練習記事。アイドル役の一年目と古参ファン役の上の年目が、共に北大構内を回るイベントの開幕を紹介する。',
      paragraphs: ['アイドル駅伝の舞台は、北大構内と寮共用棟。6組のグループがツアー会場の課題やミッションに挑み、最後の武道館ライブを目指す。アイドル役の一年目だけでなく、古参ファン役の上の年目にも、営業・盛り上げ・準備という役割がある。', '15時に企画開始、17時30分に武道館開演という想定で進む。各組のGB・ファン数・順位は一覧で確認できる。この記事は表示確認用であり、実際の開幕を報告したものではない。'],
      category: '運営', illustration: 'notice', style: 'supportive', teamIds: [],
    },
    {
      id: 'demo-collab', time: '15:45', headline: '【練習記事】グループ1×グループ2、合同CMで共演　最後の一言を譲れるか',
      summary: '合同ロケの練習用原稿。協力相手もライバルという組み合わせで、一つのCMをつくる場面を想定した。',
      paragraphs: ['グループ1とグループ2が合同CMに挑む、という想定の記事。片方だけが話し続ければ、もう片方の見せ場がなくなる。互いに紹介し合い、最後の決め台詞まで一つの映像にまとめるのがロケの面白さだ。', '仮ルールの合同ロケ報酬は各組300GB・新規ファン3万人、各組一回。この練習記事の表示によって実データの報酬が増えることはない。'],
      category: '合同ロケ', illustration: 'collab', teamIds: ['G1', 'G2'], teamName: 'この2組',
    },
    {
      id: 'demo-costume', time: '15:50', headline: '【練習記事】キラキラ素材にちょんまげ？　衣装会議が予想外の方向へ',
      summary: '派手な衣装づくりを題材にした架空記事。スパンコールや動物の耳、ちょんまげをどう自分たちの色にするか。',
      paragraphs: ['「キラキラした衣装」と「おもしろコスプレ」は両立するのか。スパンコール、動物の耳、ちょんまげを候補に並べる架空の衣装会議を想定した。正統派のアイドル像から少し外れても、全員が役になりきれれば一つのグループカラーになる。', '衣装素材セットは仮ルールで200GB。購入数だけの自動加点はない。実物の工夫と、本人たちがどう着こなしてステージに出るかが評価につながる。写真がない場面を、実際に撮影したかのように掲載しない。'],
      category: '活動', illustration: 'stage', teamIds: ['G3'], teamName: 'グループ3',
    },
    {
      id: 'demo-apology', time: '16:50', headline: '【練習記事】商品名を間違えた架空疑惑、釈明へ　30秒でグループらしさを見せる',
      summary: 'ゲーム内のお題を使った釈明記事の練習。「スポンサーの商品名を間違えた疑惑」に対する対応を想定する。',
      paragraphs: ['グループ3に届いたのは「スポンサーの商品名を間違えた疑惑」という架空の掲載予告。実際の誤りや不祥事を指すものではなく、短い時間で対応を演じる企画のお題である。', 'この練習では釈明が成功した想定で、仮ルールの結果はファン数＋2万人。何を話したか、どんな反応があったかは、この原稿だけでは確定しない。本番では運営が実演を確認した後に追記する。'],
      category: 'スキャンダル', illustration: 'scandal', teamIds: ['G3'], teamName: 'グループ3',
    },
    {
      id: 'demo-cover', time: '16:50', headline: '【練習記事】グループ4の記事は掲載見送り　編集部「内容は公表しない」',
      summary: '掲載見送りを選んだときの公開原稿例。もとの架空トピックやヒントは掲載せず、ファン数の変動がないことを伝える。',
      paragraphs: ['グループ4について予定していた記事は掲載見送りとなった、という練習用の原稿。見送ったトピックの内容は公表しない。記事タイトル、本文、コメント、画像、LINEの紹介文にも、その内容を匂わせる情報を入れない。', '仮ルールで掲載見送りの対応を選ぶと200GBを支払い、ファン数の変動はない。この原稿は表示確認用の想定であり、本番の支払いを記録するものではない。'],
      category: 'スキャンダル', illustration: 'scandal', teamIds: ['G4'], teamName: 'グループ4',
      comments: [
        { id: 'cover-1', author: '見守る古参', stance: '応援', text: '載せないと決めた内容は追わなくていい。次の活動を見たい。', agree: 43, disagree: 3 },
        { id: 'cover-2', author: '資金配分が気になる', stance: '考察', text: '限られたGBの使い方として選んだんだと思う。本番の準備との兼ね合いが気になる。', agree: 28, disagree: 5 },
        { id: 'cover-3', author: '本編待ち', stance: '辛口', text: 'ニュースが静かになった分、ステージはちゃんと派手にしてほしい。', agree: 22, disagree: 12 },
        { id: 'cover-4', author: '話題より歌派', stance: '応援', text: 'ここで終わりじゃないので。ライブを楽しみにしています。', agree: 31, disagree: 2 },
      ],
    },
    {
      id: 'demo-sns', time: '16:55', headline: '【練習記事】15秒の動画にグループの色を　ライブ報告も古参ファンの出番',
      summary: '動画・SNS企画の架空記事。外部の再生回数を競う報道ではなく、イベント内の確認と受理を紹介する。',
      paragraphs: ['短い動画に自己紹介、決めポーズ、あるいは会場での一場面を詰め込む。アイドルの投稿と、古参ファンによるライブ報告を想定した練習記事である。誰が映り、何を見せるかもグループの相談どころになる。', '仮ルールは受理一件につき＋1万人、ボーナスは合計四件まで。アイドル投稿は15分に一回、ファンのライブ報告は採点済みの各会場で一回。実際のYouTube・TikTok上の数値は報酬の根拠にしない。'],
      category: '活動', illustration: 'stage', teamIds: ['G5'], teamName: 'グループ5',
    },
    {
      id: 'demo-live', time: '17:30', headline: '【練習記事】いよいよ武道館　歌、ダンス、コントで6組が最後の見せ場へ',
      summary: '寮共用棟の武道館ライブを告知する練習記事。順位だけでなく、全アイドルが輝く演目に注目したい。',
      paragraphs: ['ツアーを終えた6組が、寮共用棟の武道館へ集まる想定の記事。歌やダンス、コントなど、選んだ演目で最後のパフォーマンスに挑む。同じ演目を複数のグループが選んでもよい。', '武道館は5項目・合計60点を審査員3人が採点する。ファンの盛り上がり、ビジュアル、面白さ、アイドル全員の見せ場、グループカラーの装飾を評価。全6組を終えるまで途中の武道館得点は公開しない。'],
      category: '武道館', illustration: 'award', teamIds: [], style: 'supportive',
    },
    {
      id: 'demo-award', time: '18:00', headline: '【練習記事】リハーサル架空結果：グループ6がメジャーデビュー、という想定で結果記事を確認',
      summary: '優勝発表の記事を確かめるためのリハーサル架空結果。グループ6の優勝は表示用の想定で、本番・練習ダッシュボードの成績を報告するものではない。',
      paragraphs: ['これはリハーサル用の架空結果記事。グループ6が優勝してメジャーデビューした、という想定で誌面を確認する。実際にこのグループのライブが終わったことや、採点で優勝が確定したことを示すものではない。', '本番の結果記事は全6組の採点と結果公開を終えてから作る。確定した順位とファン数を本文へ記載し、森本が公開された記事URLを全体LINEに手動で流す。未確定の勝者を先に書き込まない。'],
      category: '武道館', illustration: 'award', teamIds: ['G6'], style: 'supportive', teamName: 'グループ6',
    },
  ];
  return examples.map(example => ({
    ...article(example), id: example.id, time: example.time,
    published: true, private: false, target: 'all', practice: true,
  }));
}
