# アイドル駅伝の説明資料

事前に参加者と運営へ共有する試運転版です。金額・個人配置・徒歩時間は仮案として記載しています。

| 対象 | 閲覧用 | 編集用 | 説明台本 |
|---|---|---|---|
| 参加者・12枚 | [PDF](participants.pdf)／[ブラウザ版](participants.html) | [PowerPoint](participants.pptx) | [台本](participants-script.md) |
| 運営・16枚 | [PDF](staff.pdf)／[ブラウザ版](staff.html) | [PowerPoint](staff.pptx) | [台本](staff-script.md) |

参加者向けは約8〜10分、運営向けは約15分の説明を想定しています。各PowerPointには説明台本を発表者ノートにも入れています。

PDFは表示の一致を優先した閲覧用です。文字や表を編集するときはPowerPointかブラウザ版を使ってください。

## 当日版にする前の確認

- 開催日、グループ名、正式なグループカラーを決める。
- 15分枠と徒歩10分が成立するか、実際に歩いて確かめる。
- 13人の名簿と、司会交代で同時11人とする配置案を確認する。
- GBの報酬・価格・継続収入の一括清算案を試運転で決める。
- 音源、会場の物品、雨天時の代替、採点・入力・訂正を通し練習する。

## 資料を更新する

共通ルールは [data/rules.json](../data/rules.json) に置いています。商品と採点表はそこから読み込みます。説明文と台本に同じ数字があるため、ルールを変更したときは説明文も同時に見直してください。

作成用のソースは [source/build-decks.mjs](source/build-decks.mjs)、PDF用は [source/export-pdf.py](source/export-pdf.py) です。Codexの提供ランタイムとArtifact Toolで実行します。PowerPoint完成版を上書きしないよう、更新時には出力名の版番号を変えてください。

デザイン規約は [consulting-pptx-skillのslide-rules.md](https://github.com/carnot-tech/consulting-pptx-skill/blob/main/references/slide-rules.md) を参照しています。
