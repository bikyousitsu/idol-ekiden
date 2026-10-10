# A4印刷セット

2026-10-11 試運転版。HTMLをブラウザで開いて印刷できます。

- participant-guide.html：参加者1枚。60人分または各チーム数枚。
- team-routes.html：6組のルート札、各1枚。
- score-sheets.html：ツアー4会場と武道館の空欄票。ツアー各会場6枚、武道館18枚。
- score-sheets.csv：24ツアー＋18武道館＝42行の記入欄。
- reception-ledger.html：通信断用台帳。数枚。
- stage-signs.html：4会場＋本部の5枚。
- event-cards.html：仕事・スキャンダル・SNSの8カード、2ページ。
- operations-checklist.html：運営1枚。
- live-order.html：武道館演目申告・出順・音源確認の別紙2ページ。PDFは../../output/pdf/live-order.pdf。

印刷PDF冊子：../../output/pdf/print-pack.pdf（21ページ・種類別しおり）。ページ1：参加者、2〜7：ルート、8〜11：ツアー採点、12：最終採点、13：受付台帳、14〜18：会場札、19〜20：イベントカード、21：運営チェック。必要なページを必要枚数印刷してください。

生成元：scripts/build-print.mjs。ルール変更後は再生成してください。A4・倍率100%・ヘッダー/フッターなしでプレビュー確認。CSSは印刷用ですが、ブラウザやフォントによってページ分割は変わるため、本番印刷前に確認してください。公開先URL/QRは公開方法確定後に記入します。
