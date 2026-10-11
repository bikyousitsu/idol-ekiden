export const SCANDAL_WORKFLOW='rumor-apology-v2';
export const APOLOGY_MIN=-100000;
export const APOLOGY_MAX=30000;
export const isCurrentScandal=c=>!c.legacyAllScandals&&(!c.attentionEvent||c.attentionEvent.scandalWorkflow===SCANDAL_WORKFLOW);
export function scandalCopies(team,memberName,deadline){
 const name=team?.name||'グループ〇',member=memberName?.trim()||'△',topic=team?.scandal?.topic||'運営が用意した架空疑惑';
 return {
  rumor:`【駅伝内の架空投稿／ファン役】\n${name}の${member}さん、過去に「${topic}」って……。信じて推してたのに、幻滅……。本人から説明を聞きたい。`,
  interview:`週刊ケイテキの記者です。こんな書き込みがあるんですけど、${member}さん、事実なんでしょうか？ グループや古参ファンの皆さんはどうお考えですか？`,
  manager:`【マネージャー森本】\nこんな書き込みが出ているんですけど。さっき取材に来た雑誌の記事になるみたいですよ？\n\n${topic}\n\n${deadline}までに、どちらか選んでください。\n① 雑誌社に口止め料200GBを払う：記事は出ません。ファン数の増減なし。\n② 謝罪動画を撮り、全体LINEへ投稿する：疑惑の記事と、謝罪動画への反応の記事が出ます。動画の完成度を本部が確認し、ファン数は−10万人〜＋3万人で増減します（人数の範囲は仮）。\n\nこれは駅伝内の架空のお題です。最初のLINEの書き込みは残りますが、①は雑誌の記事化を止める選択です。`,
 };
}
