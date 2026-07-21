# poimoru-blog プロジェクトルール

ポイ活×投資ブログ「ポイモル」。静的HTMLをCloudflare Workersで配信。

## スタックと構成
- 純粋な静的HTML/CSS/JS（ビルドツールなし、フレームワークなし）
- 配信: Cloudflare Workers（wrangler.jsonc）。GitHub push → デプロイ
- **スタイルの正本は assets/style.css・スクリプトの正本は assets/site.js（2026-07-09の共有化以降）。
  ページ内にインライン<style>ブロックやメーター/コピー用<script>を書かない**
- 記事は articles/*.html。本文構成の参照元は articles/torima.html
- 記事画像は articles/images/

## コマンド
- **デプロイ手順・本番URL・PAT運用は `../AGENTS.md` の「2-B. リポジトリ構成とデプロイ」を参照**
  （プロジェクト全体の正本。Claude以外のエージェントもこれを読むこと）
- 編集の詳細手順は ★編集ガイド.md を参照
- 本番: https://poimoru-blog.satorunaoi0731.workers.dev ／ GitHub push で自動デプロイ

## ルール
- 新記事・新セクションは assets/style.css の既存クラスを再利用する。新しいCSS体系を発明しない。
  新コンポーネントが必要な場合は style.css に追加して全ページで使えるようにする
- 数値（実測データ）は必ずGoogle Sheetsの実測値に基づく。推測値を書かない（EEAT戦略）
- 読者ペルソナ: 25〜45歳・リスク回避型・コツコツ稼ぎたい層。誇張表現禁止、デメリットも正直に書く

## やってはいけないこと
- 招待コードを勝手に変更・削除しない（台帳は下記。カルティは20人上限あり）
- OGP・canonical・JSON-LD・sitemap.xml を壊さない。記事追加時は sitemap.xml も更新する
- APIキー・サービスアカウント鍵・個人情報をHTMLに含めない
- 法令・各アプリ利用規約に関わる表現の変更は poimoru-legal スキルでチェックしてから公開する

## 公開前チェック
- poimoru-factcheck（数値検証）→ poimoru-sitecheck（リンク・OGP・レスポンシブ）を通す
  ※ これらはClaude Code用スキル。他エージェントは「記事の全数値をGoogle Sheetsの実測値と突き合わせ、
  リンク切れ・OGP・canonical・JSON-LD・sitemap整合を確認する」を手動で実施すること

## 招待コード台帳（2026-06-10時点・変更したらここを更新）

| アプリ | コード | ボーナス | 制限 | 掲載先 |
|---|---|---|---|---|
| LINE WALK | `2RQVDLZH` | 最大10,000コイン | — | articles/linewalk.html |
| カルティポイント | `T63KTT` | 双方5,000pt | **20人まで**（上限到達で要差し替え） | articles/kartie-point.html |
| トリマ | `9-GXLp1me` | 双方5,000マイル | — | articles/torima.html |
| おぢぽ | `XLJ1l9S3` | 被招待者330pt | 自分への報酬は10人まで | articles/odipo.html |
| チョッキンズ | 制度なし | — | — | — |

反映手順: ①本文の`inviteCode`欄とサイドバーの計2箇所を置換 ②ステマ開示文
（「※利用で双方にpt/コイン/マイルが入ります」）が併記されているか確認 ③デプロイ ④この表を更新
