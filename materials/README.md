# アイドル駅伝の説明資料

2026-10-12版。開会式は細かなルールを説明せず、6枚で約2〜3分。武道館は漫才後に6枚で順位・披露方法・採点・優勝条件を確認する。

| 用途 | 投影・閲覧 | 編集用 | 台本 |
|---|---|---|---|
| 開会式・6枚 | [ブラウザ版](https://idol-ekiden-control.coolmyna3.chatgpt.site/opening-rules-v4.html)／[PDF](opening-rules-v4.pdf) | [PPTX](opening-rules-v4.pptx) | [台本](opening-rules-v4-script.md) |
| 武道館・6枚 | [ブラウザ版](https://idol-ekiden-control.coolmyna3.chatgpt.site/budokan-rules-v3.html)／[PDF](budokan-rules-v3.pdf) | [PPTX](budokan-rules-v3.pptx) | [台本](budokan-rules-v3-script.md) |

- [開会式進行表・社長映像原稿](opening-ceremony-runbook.md)
- [各グループLINEへ送る文面](departure-line-message.md)。運営ページの「連絡原稿」にも収録。
- [共通ルール](../docs/production/common-rules.md)／[最新の変更点](../docs/production/latest-update.md)

## 投影する

ブラウザ版の「発表モード」「全画面」を使う。矢印キーで前後、Fで全画面。武道館の順位は自動で読み込み、「順位更新」で取り直せる。取得失敗時は古い順位を残さず、参加者ページへのリンクを表示する。公開ブラウザ版で投影すること。HTMLを手元に保存した場合、順位APIの取得はできない。

PPTX・PDFは順位を固定表示せず、参加者ページへのQRを載せている。順位確認時は参加者サイトに切り替える。PPTXの文字と表は編集可能。PDFは表示を一致させた閲覧用。文字や表を編集する場合はPPTXを使う。

持ち時間は挨拶も含めて3分（ダンスは指定曲1番）。価格・労働報酬・機材・音源・演目の実施条件は未確定の項目がある。開始時刻変更は、固定スライドの時刻には自動反映されない。

## 旧版

participants.* と staff.* は労働ポイント追加前の参考版。現在の会場・時間・SNSルールと異なるため、当日の投影には使わない。

## 制作と確認

[作成ソース](source/build-opening-rules.mjs)。Artifact Toolで編集可能なPPTXを作成し、構造・フォント・レイアウトを検査、完成PPTXの再読み込みによる全ページ表示を確認する。

デザインは [carnot-tech/consulting-pptx-skill の slide-rules.md](https://github.com/carnot-tech/consulting-pptx-skill/blob/main/references/slide-rules.md) を読み、結論型タイトル、一枚一メッセージ、大きな文字、表の罫線の整理に適用した。紺地にピンク・シアンのステージ照明を合わせた。
