# 327アイドル駅伝

一年目がアイドルになり、上の年目が古参ファンとして支える、恵迪寮祭のチーム型イベントです。チーム全員で北大構内のツアーと仕事を回り、最後は寮の共用棟「武道館」でパフォーマンスを行います。

> **最新版は2026年10月12日の試運転用制作パックです。** 当日のルールは [共通ルール・料金表](docs/production/common-rules.md)、資料の入口は [制作パック一覧](docs/production/README.md) を参照してください。金額・個人配置・徒歩時間は仮案で、本番前の確認が必要です。

[資料とソースをまとめてダウンロード](downloads/production-pack.zip)／[制作結果と本番までの引継ぎ](docs/production/completion-report.md)

## 現在の企画

| 項目 | 現在の方向性 |
|---|---|
| 規模 | 6グループ、参加者約60人を想定 |
| 開始 | 14:30集合開始、14:45ごろ式、15:00ごろ出発 |
| ツアー | 15:30から北大構内の4会場を各組1回ずつ回る、各会場1チーム |
| 役割 | 一年目がアイドル、上の年目が古参ファン、チーム全員で行動 |
| 衣装 | 華やかな衣装やおもしろコスプレを実物のビジュアルとして採点、購入数による自動加点は行わない |
| お金 | ゲーム内通貨GBを労働で稼ぎ、宣伝・衣装・レッスンなどに使う |
| 人気 | ファン数・順位・全チームのGB残高を全体公開 |
| スキャンダル | 16:30頃の途中首位1組へ架空疑惑。記者役が突撃し、チームで対応を選ぶ |
| 合同ロケ | 医学部噴水前で2チーム同時集合、共同CMを作る |
| ライブ | 17:30に寮共用棟「武道館」で開演、5項目60点。ファン数上位からお題選択、同じお題は2組まで |
| 勝利条件 | 武道館の加算後、獲得ファン数が最も多いグループが優勝 |
| LINE | 運営が内容と結果を確認し、全体・チーム別LINEへ手動投稿 |

GBは実際の現金とは別です。初期600 GB、報酬と価格、継続収入の17:00一括清算、ツアーの15分枠、17:20集合、18:00終演は試運転の仮案です。

## 読む・説明する・印刷する

| 用途 | 最新資料 |
|---|---|
| 全資料の入口 | [制作パック一覧](docs/production/README.md) |
| 数字の正本 | [data/rules.json](data/rules.json)／[共通ルール・料金表](docs/production/common-rules.md) |
| 開会式・武道館で説明 | [最新版スライド・台本・進行表](materials/README.md) |
| チームLINEの出発案内 | [送信用文面](materials/departure-line-message.md) |
| 運営に説明 | [運営マニュアル](docs/production/operations-manual.md)／[PPTX・16枚](materials/staff.pptx)／[PDF](materials/staff.pdf)／[HTML](materials/staff.html)／[説明台本](materials/staff-script.md) |
| 資料をブラウザで選ぶ | [説明資料の入口](materials/index.html)／[資料の使い方](materials/README.md) |
| 仕事・騒動・共演を実施 | [イベントカード](docs/production/event-cards.md) |
| ツアーを進行・採点 | [お題・解答・競技基準](docs/production/stage-task-book.md)／[司会・会場・演目台本](docs/production/staff-scripts.md) |
| 芸能ニュースを出す | [ニュース原案](docs/production/news-templates.md) |
| 紙で配る・記録する | [印刷PDF冊子](output/pdf/print-pack.pdf)／[印刷原稿・採点票](materials/print/) |
| 買う・借りるものを確認 | [調達・実費予算](docs/production/procurement-budget.md) |
| 試運転する | [リハーサル・当日チェック](docs/production/rehearsal-checklist.md)／[バランス検討](docs/production/balance-review.md) |
| 制作時の確認を読む | [確認記録](docs/production/verification.md) |

ブラウザ版HTMLはダウンロード後に開いてください。運営資料にはお題と解答もあるため、参加者には最新版の開会式・武道館資料を共有する想定です。

PDFは閲覧・印刷用です。説明資料の文字や表を編集する場合はPPTXかHTMLを使ってください。

## ダッシュボード

管理者の「予定・お題」から開始時刻を変えると、全体予定・6組のツアー・入力締切を一括でずらせます。スキャンダルの6原稿は「記事の編集」に最初から表示されます。

- [優勝決定後の画面](https://idol-ekiden-control.coolmyna3.chatgpt.site/results)：結果公開後に受賞・全順位・武道館点・GBを表示。
- [労働とスキャンダルの具体案](docs/production/event-proposals.md)：①中央食堂前の台車リレー企画、②医学部噴水前合同ロケ。お題・実演条件・配置は提案を明記。


- [ダッシュボードの実装](apps/dashboard/)
- [参加者ページ](https://idol-ekiden-control.coolmyna3.chatgpt.site)：ログイン不要。ファン数・GB・確認済みニュースを公開。
- [運営専用ページ](https://idol-ekiden-control.coolmyna3.chatgpt.site/admin)：担当別の運営ID＋パスコードで採点・報酬・記事を編集。スタッフのChatGPT登録は不要。
- [スタッフのログイン入口](https://idol-ekiden-control.coolmyna3.chatgpt.site/admin/login)／[ID発行・15分の動作確認手順](docs/production/setup-and-smoke-check.md)：管理者が「スタッフID」から発行し、本人へ個別に渡す。
- [ニュースの練習版](https://idol-ekiden-control.coolmyna3.chatgpt.site/demo)／[個別記事の例](https://idol-ekiden-control.coolmyna3.chatgpt.site/news/demo-collab?event=practice)
- [記事編集・LINE投稿の手順](docs/production/news-editorial-guide.md)：予告はチーム別、16:50の結果記事は全体へ。森本が見出しとURLを手動投稿。

参加者ページと運営画面を分離しました。ニュースは一記事一URLで、要約・本文・架空の応援／考察／辛口コメントを掲載します。コメントの反応数は架空の演出で、得点に影響しません。運営は専用画面から採点・仕事・購入・スキャンダル対応を記録します。データの共有、同時更新、運営権限、入力の訂正、通信が切れた場合の復旧は、本番前の通し試験で確認します。

ルールを変更するときは、まず `data/rules.json` と共通ルールを更新し、計算・画面・説明資料・印刷物・シミュレーションの順にそろえます。

## 本番前に確かめること

- 15分枠の「実施5分＋移動10分」を実際に歩いて確認する。余裕のない区間では任意ミッションを省き、時間割を調整する。
- 18条ステージの具体的な位置、雨天時の代替、会場の道具・音源・使用条件を確認する。
- 侍欠席の11人。合同ロケはたけ、本部はツアー開始後シャネル・スーダン。受付・入力の分担と武道館中の代行を確認する。
- GBの報酬と価格、SNSの評価基準と減点の限度、清算と提出の締切、同点時の扱いを試運転で決める。
- 開催日、正式なグループ名と色、衣装と装飾のセット内容・在庫を確定する。
- 公開ダッシュボードとLINEの実際の見え方・連絡手順を、運営とテスト参加者で確認する。

## 実費予算

自由に使える10,000円から衣装・装飾・道具・印刷などを出す提案です。[調達・実費予算](docs/production/procurement-budget.md) に、借用を優先した配分案をまとめています。購入と追加予算は未承認です。

現行案はLINEへの手動投稿を基本とし、有料AIやMessaging APIの契約は実施の必須条件にしていません。外部サービスを有料で使う場合は、用途と当時の料金、月額上限を改めて確認します。

## 初期案の記録

以下は2026年10月9日ごろの構想を残した資料です。会場・衣装の採点・自動配信・価格などに、現在案と異なる記述があります。運営時は上記の制作パックと共通ルールを優先してください。

- [企画の目的・初期構成](docs/concept.md)
- [資金・人気・ミッションの初期案](docs/game-design.md)
- [最後のライブの初期案](docs/live.md)
- [LINE・AI・ダッシュボードの初期案](docs/system.md)
- [予算とAPI費用の初期検討](docs/budget.md)
- [初期の決定事項と検討事項](docs/decisions-and-next-steps.md)
- [初期の運営共有文](docs/organizer-share.md)
- [LINE自動配信の試作](apps/line-pilot/README.md)：現行の手動投稿方針とは別の検証記録

## 参考

- [前回の駅伝資料：Project Gaia](https://hamankousa.github.io/project-gaia-handouts/)
- 説明スライドは [carnot-tech/consulting-pptx-skill](https://github.com/carnot-tech/consulting-pptx-skill) の最新版、とくに `references/slide-rules.md` の設計原則を参照しています。

この公開リポジトリには、パスワード、LINEの秘密情報、会話中のスクリーンショット、実運用の台帳を含めません。

最下位1組には神対応イベントで＋5万人。同率は抽選で各1組、対象は一度固定します。衣装は各ツアー会場の披露前に購入・着用し、実物をビジュアル採点。詳細と最新配置は [最新変更](docs/production/latest-update.md)。

最新：全体LINEの架空書き込み→記者取材→森本から個別二択。口止めは記事なし、謝罪動画は本部が−10万〜＋3万人を入力し2記事を作成。[マネージャーのLINE原稿](docs/production/manager-line-messages.md) と [BGM・音源キュー](docs/production/show-audio-cues.md) を追加しました。
