# poimoru-blog

## 共通ヘッダー・フッター

リンクやHTMLは `scripts/sync-site-chrome.cjs`、見た目は `assets/chrome.css`、開閉とスクロール動作は `assets/site.js` で管理します。HTMLを変更したら `node scripts/sync-site-chrome.cjs` を実行して、静的HTMLに反映します。`node scripts/sync-site-chrome.cjs --check` で同期漏れを確認できます。

Xは正式URLの確認まで公開版に出しません。確認後に同期スクリプトとカテゴリ雛形を更新します。

## 記事とカテゴリを更新する

GitHubの `Poimoru site check` は、共通部分の同期、内部リンク・サイトマップ、アイキャッチの重複を検査します。さらに、PC幅1280pxとスマホ幅390pxで共通ヘッダー・フッターと記事部品の固定サンプルを比較します。本文の文章や画像が変わっただけでは比較を止めません。

公開する変更は作業ブランチから `main` へのプルリクエストにします。意図した共通デザイン変更の場合のみ、差分画像をレビューした上で管理者が `visual-change-approved` を付けます。画像の読み込みやはみ出し、リンクなどの検査はラベルがあっても省略されません。

公開記事のカード情報は `assets/stories.js` に一度だけ登録します。トップ、カテゴリ一覧、記事末尾の関連記事がこの情報を参照します。招待コードは記事本文の `inviteCode` を元に表示・コピーするため、追従ボタン用に別途登録しません。

`node scripts/build-categories.cjs` で公開用カテゴリを生成します。空のカテゴリに最初の記事を追加した場合は `sitemap.xml` にもそのURLを追加します。ページ送りは1ページ10件で、2ページ目以降は `?page=2` でアクセスできます。

公開前には両方の生成スクリプトを `--check` 付きで実行し、Nokogiriがある環境で `ruby scripts/check-release.rb` を実行します。本番は既存の `workers.dev` を維持します。独自ドメインを接続する際には生成スクリプトのorigin、canonical、OGP、構造化データ、robots、sitemapの更新を一緒に行います。
