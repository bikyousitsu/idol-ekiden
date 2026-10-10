# アイドル駅伝：ケイテキ!ニュースと運営画面

参加者：[トップ](https://idol-ekiden-control.coolmyna3.chatgpt.site)／[練習版](https://idol-ekiden-control.coolmyna3.chatgpt.site/demo)／[リハーサル](https://idol-ekiden-control.coolmyna3.chatgpt.site/rehearsal)。運営：[編集ページ](https://idol-ekiden-control.coolmyna3.chatgpt.site/admin)。

参加者はログイン不要。ニュース一覧、一記事一URL、要約・本文、架空の応援・考察・辛口コメント、ファン数・全組のGB、予定を見られます。Yahoo!ニュースの情報配置を参考にした独自の「ケイテキ!ニュース」です。

運営はログインとサーバーの運営権限が必要。採点・報酬・購入・SNS・合同ロケ・スキャンダル・武道館、台帳の訂正・バックアップ、スタッフ追加、記事編集を行います。操作記録は共有DBに保存。会場・価格等は試運転用の仮案です。

## 初回・当日

手順は [画面の使い分け](../../docs/production/dashboard-pages.md) と [ニュース編集ガイド](../../docs/production/news-editorial-guide.md)。

- 所有者だけが初回管理者登録できます。Sitesで秘密設定した BOOTSTRAP_OWNER_EMAIL とログイン情報を照合します。登録後は ALLOW_OWNER_BOOTSTRAP を無効にする。設定値や実ユーザーIDをソースへ保存しない。
- 練習・リハーサル・本番は別台帳。本番は600GB・ファン0人で開始。運営画面の初期選択は練習です。公開トップは本番を表示します。
- イベント時刻と進行は運営が更新。開催日未定のため自動進行しません。入力の時刻・上限・重複・残高・締切は計算で検証します。
- 採点の変更は理由を付けて置換・取消し、履歴を残す。最終得点は全6組の披露後に反映。
- 記事は記録から下書きを作り、人が編集・確認して公開。プレビューとLINE用コピーは保存済み記事を使用します。下書き保存は公開・共有の停止も兼ねます。
- 16:00の予告はチーム別。16:45対応締切、16:50結果処理で6本の原稿を作る。もみ消しは掲載見送り記事にし、詳細を出さない。確認後、森本が個別記事URLを全体LINEへ手動投稿。
- 通信断は紙台帳、復旧後は受付番号を確認して登録。JSONバックアップは公開リポジトリへ入れない。

## 公開・編集の境界

公開GET /api/event は、ログイン済みでも台帳・操作担当・予告・共有鍵を返しません。書込みは拒否。運営APIは /api/admin/event と /api/admin/articles。認証・運営権限・同じサイトからの送信を確認します。台帳更新は台帳の版、記事更新は記事ごとの版とDBの版で競合を検知。拒否した原稿は画面に残します。

未公開記事は404。チーム限定予告は確認後に発行した192bitの鍵付きURLだけで閲覧でき、公開一覧には入りません。URLを転送された人も読めるため、チーム内だけで扱います。公開停止すると元のURLも読めません。編集プレビューには運営権限が必要。記事は検索登録なし・参照元を送らない設定です。

## 開発と確認

Node.js22.13以上。依存関係をインストールし、ローカルD1へ drizzle/0000_bright_spiral.sql を適用。npm run dev で起動。端末内の初回登録試験には、非公開の .dev.vars に受付フラグとローカルサインインのメールを設定します。

```text
node --test test/core.test.mjs test/news-content.test.mjs test/articles.test.mjs
node test/api-smoke.mjs
npm run build
```

API試験はlocalhostのリハーサル台帳だけを使い、元へ戻します。実際の本人ログイン・スタッフ追加・LINEでの表示・複数端末の同期・現地通信は本番前に通し試験が必要です。LINE・AI APIの有料接続はありません。

数値の正本は [rules.json](../../data/rules.json)。変更後は計算・画面・資料をそろえる。Sitesでは既存 .openai/hosting.json の project_id を再利用し、保存したソースと同じビルドを公開します。DB・環境変数・秘密・実台帳は公開ソースから除外します。
