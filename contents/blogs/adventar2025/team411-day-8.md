---
title: "dotfilesをやってみよう"
excerpt: "team411 Advent Calendar 2025 8日目の記事です。"
date: 2025-12-08
tags: ["adventar2025", "技術"]
---

この記事は [team411 Advent Calendar 2025](https://adventar.org/calendars/12375) の8日目の記事です。

昨日は黄泉比良坂46(むつみん)さんによる「[あなたのWindows環境、WingetとScoopで自動化しませんか？](https://zenn.dev/team411/articles/9d25086d7f909d)」でした。あいにく私はあまりWindowsを使っていないのですが、それでもWingetなどにはお世話になっており、Windowsを使っているみなさんには是非とも読んでいただきたい内容でした。

## はじめに

改めましてこんにちは、team411で [uBoard](https://uboard.info) や [MO](https://team411.net/projects/mo/) のプロジェクトに携わっていたり、メイド服を着ていたりするみみと言います。普段はNext.jsをはじめとするTypeScriptを書いて生活しています。

この記事では、昨日のむつみんさんの記事でも取り上げられていたdotfilesについて深掘りしていこうと思います (Windowsの人も使えるので離脱しないでね)。

## dotfilesとは

dotfiles (ドットファイル) とは、主にLinuxやmacOSなどのUnix系OSでの各種ソフトウェアやツールの設定ファイルを表す言葉です。また、これらのファイルを一元管理して環境の再現性を高めるための仕組みやリポジトリのことを指しています。

dotfilesをしっかり書くと、複数端末間で設定を簡単に共有したり、PCを初期化した際に必要な設定をサクッと復元できるようになります。

このdotfilesですが、シェルスクリプトを書いて管理することができますが、快適に使おうとするとそれなりの量を書かなければいけなかったり、始めるハードルが高い気がしています (個人の感想)。そこで今回は、dotfilesを管理するツールであるchezmoiを紹介していこうと思います。

https://www.chezmoi.io

## chezmoiではじめる簡単dotfiles

Quick Startにあるように、進めていきます。

https://www.chezmoi.io/quick-start/

まずリポジトリを初期化します。

```bash
chezmoi init
```

デフォルトパスは `~/.local/share/chezmoi` です。

```bash
chezmoi cd
```
でこのパスに移動することができます。設定ファイルを編集する際は、ここのリポジトリをいじれば良いです。また、既存の設定ファイルをchezmoiの管理下に置きたいときは

```bash
chezmoi add ~/.zshrc
```

とします。この例のように `~/.zshrc` を追加した場合、`dot_zshrc` というファイルが作られ、この中身を編集して、

```bash
chezmoi apply
```

することで、変更を適用することができます。あとはこのリポジトリをpushしてあげれば完了です！

```bash
chezmoi init git@github.com:ユーザー名/dotfiles.git
```

としてあげれば他のPCからもこの設定を使うことができます。その他にもOSによって設定を変えたり個人用と仕事用のプロファイルを分けたりなど、さまざまな機能があるのでぜひ公式ドキュメントをみてみてください。

## APIキーの扱いを考える

さて、dotfilesの管理はできるようになりましたが、APIキーなどの機密情報をそのままGitHubにpushするのはよろしくありません。

例えば私は、Z.aiというサブスクに登録してClaude Codeの代替としてGLMを使っていますが、この時使用するAPIキーを `.zshrc` に書かなければいけません。

そこで、1PasswordのEnvironmentの機能を使って隠蔽したい環境変数部分だけ別ファイルに切り分けて管理するようにしています。

1Password側の設定はここに詳しく書いてあります。

https://dev.classmethod.jp/articles/1password-environments-env-management/

ここで、 `~/.config/zsh/env.zsh` などに環境変数を保存し、`.zshrc` で

```bash
source ~/.config/zsh/env.zsh
```

してあげれば、簡単に重要な情報を切り分けることができます。これまで私は、1Passwordを使わずにやっていたので、切り分けたファイルの管理が大変でしたが、1Password EnvironmentsがBetaではあるものの利用できるようになったことで非常に快適になりました。さらに、この読み込み時に1Passwordの認証も走るのでより安全になるかと思います。

## おわりに

というわけで、chezmoiを使ったdotfilesの管理方法の紹介でした。手軽なので、是非みなさんこれを機にdotfiles、初めてみてください。

明日は `undefined` さんによる、`null` です。楽しみですね！
