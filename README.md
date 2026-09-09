# 10 kids study

子供向けの学習プリント・練習ページ集。ビルド不要の静的HTML/CSS/JSのみで構成されており、GitHub Pagesでそのまま公開できる。

## 構成

```
index.html          トップメニュー
01_hiragana/         ポケモンひらがな練習
02_math/              計算問題ジェネレーター
03_clock/             アナログ時計 学習プリント・経過時間プリント
04_math100/           100マス計算
05_math_sub/          算数の文章問題ジェネレーター
06_hissan/            筆算ドリル
shared/js/            共通ライブラリ(jQuery)
_archive/             未使用・旧Google Apps Script版のバックアップ(公開対象外、.gitignore済み)
```

各機能ページには「← メニューへ」リンクがあり、トップページと相互に行き来できる。

## ローカルでの確認方法

リポジトリのルートで簡易HTTPサーバーを起動し、ブラウザで開く。

```bash
python -m http.server 8000
```

`http://localhost:8000/` を開くとトップメニューが表示される。

## デプロイ方法(GitHub Pages)

1. GitHubでpublicリポジトリを作成する
2. このフォルダをpushする
   ```bash
   git remote add origin <リポジトリのURL>
   git push -u origin main
   ```
3. リポジトリの `Settings > Pages` で `Source: Deploy from a branch` を選び、`main` ブランチ / `/ (root)` を指定する
4. 数分後に `https://<ユーザー名>.github.io/<リポジトリ名>/` で公開される(ビルド不要のためGitHub Actionsの設定は不要)

## 子供用ChromeOS端末でのアクセス

公開後のURLをChromeでブックマークするか、Chromeメニューの「その他のツール > ホーム画面に追加」でアイコン化すると、アプリのように開ける。
