# 327アイドル駅伝

一年目がアイドルになり、上の年目が古参ファンとして支える、恵迪寮祭のチーム型イベントです。チーム全員で北大構内のツアーと仕事を回り、最後は寮の共用棟「武道館」でパフォーマンスを行います。

> **最新版は2026年10月11日の試運転用制作パックです。** 当日のルールは [共通ルール・料金表](docs/production/common-rules.md)、資料の入口は [制作パック一覧](docs/production/README.md) を参照してください。金額・個人配置・徒歩時間は仮案で、本番前の確認が必要です。

[資料とソースをまとめてダウンロード](downloads/production-pack.zip)／[制作結果と本番までの引継ぎ](docs/production/completion-report.md)

## 現在の企画

| 項目 | 現在の方向性 |
|---|---|
| 規模 | 6グループ、参加者約60人を想定 |
| 開始 | 15:00に記者会見・説明を開始 |
| ツアー | 北大構内の4会場を各組1回ずつ回る、各会場1チーム |
| 役割 | 一年目がアイドル、上の年目が古参ファン、チーム全員で行動 |
| 衣装 | 華やかな衣装やおもしろコスプレを実物のビジュアルとして採点、購入数による自動加点は行わない |
| お金 | ゲーム内通貨GBを仕事で稼ぎ、宣伝・衣装・レッスンなどに使う |
| 人気 | ファン数・順位・全チームのGB残高を全体公開 |
| スキャンダル | 運営が作った架空の疑惑を全チームに1回、対応方法をチームで選ぶ |
| 合同ロケ | 共同CM、合流が難しい組は動画リレーで参加 |
| ライブ | 17:30に寮共用棟「武道館」で開演、5項目60点、演目の重複可 |
| 勝利条件 | 武道館の加算後、獲得ファン数が最も多いグループが優勝 |
| LINE | 運営が内容と結果を確認し、全体・チーム別LINEへ手動投稿 |

GBは実際の現金とは別です。初期600 GB、報酬と価格、継続収入の17:00一括清算、ツアーの15分枠、17:20集合、18:00終演は試運転の仮案です。

## 読む・説明する・印刷する

| 用途 | 最新資料 |
|---|---|
| 全資料の入口 | [制作パック一覧](docs/production/README.md) |
| 数字の正本 | [data/rules.json](data/rules.json)／[共通ルール・料金表](docs/production/common-rules.md) |
| 参加者に説明 | [ガイド](docs/production/participant-guide.md)／[PPTX・12枚](materials/participants.pptx)／[PDF](materials/participants.pdf)／[HTML](materials/participants.html)／[説明台本](materials/participants-script.md) |
| 運営に説明 | [運営マニュアル](docs/production/operations-manual.md)／[PPTX・16枚](materials/staff.pptx)／[PDF](materials/staff.pdf)／[HTML](materials/staff.html)／[説明台本](materials/staff-script.md) |
| 資料をブラウザで選ぶ | [説明資料の入口](materials/index.html)／[資料の使い方](materials/README.md) |
| 仕事・騒動・共演を実施 | [イベントカード](docs/production/event-cards.md) |
| ツアーを進行・採点 | [お題・解答・競技基準](docs/production/stage-task-book.md)／[司会・会場・演目台本](docs/production/staff-scripts.md) |
| 芸能ニュースを出す | [ニュース原案](docs/production/news-templates.md) |
| 紙で配る・記録する | [印刷PDF冊子](output/pdf/print-pack.pdf)／[印刷原稿・採点票](materials/print/) |
| 買う・借りるものを確認 | [調達・実費予算](docs/production/procurement-budget.md) |
| 試運転する | [リハーサル・当日チェック](docs/production/rehearsal-checklist.md)／[バランス検討](docs/production/balance-review.md) |
| 制作時の確認を読む | [確認記録](docs/production/verification.md) |

ブラウザ版HTMLはダウンロード後に開いてください。運営資料にはお題と解答もあるため、参加者には参加者PDFを共有する想定です。

PDFは閲覧・印刷用です。説明資料の文字や表を編集する場合はPPTXかHTMLを使ってください。

## ダッシュボード

- [ダッシュボードの実装](apps/dashboard/)
- [主催者確認用サイト](https://idol-ekiden-control.coolmyna3.chatgpt.site)：**本人限定の確認版として配信済み**です。参加者向けの公開・共有は、アクセス設定と実データの同期を確認してから行います。

画面では各グループのファン数・順位・GB残高、ニュース、予定を確認し、運営が採点・仕事・購入・スキャンダル対応を記録する構成です。データの共有、同時更新、運営権限、入力の訂正、通信が切れた場合の復旧は、本番前の通し試験で確認します。

ルールを変更するときは、まず `data/rules.json` と共通ルールを更新し、計算・画面・説明資料・印刷物・シミュレーションの順にそろえます。

## 本番前に確かめること

- 15分枠の「実施5分＋移動10分」を実際に歩いて確認する。余裕のない区間では任意ミッションを省き、時間割を調整する。
- 18条ステージの具体的な位置、雨天時の代替、会場の道具・音源・使用条件を確認する。
- 13人の運営名簿と、司会交代で同時11人とする配置案を確認する。
- GBの報酬と価格、SNS報酬の上限、清算と提出の締切、同点時の扱いを試運転で決める。
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
