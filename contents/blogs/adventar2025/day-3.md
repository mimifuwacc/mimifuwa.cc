---
title: "英語の授業を受けていたらSMCの勉強が始まった"
excerpt: "ハーフダチョウ研究会Advent Calendar 2025 3日目の記事です。"
date: 2025-12-08
tags: ["adventar2025", "技術"]
---

この記事は [ハーフダチョウ研究会Advent Calendar 2025](https://adventar.org/calendars/11432) の3日目の記事です。

昨日は [NowPlayingを少しおしゃれにする Part2](https://mimifuwa.cc/blogs/adventar2025/day-2) でOG画像生成部分とデプロイの話をしました。

## はじめに

こんにちはみみです。冒頭にあるように、この記事は3日目の記事です。

```bash
$ date
Mon Dec  8 01:06:44 JST 2025
```

見なかったことにします (言い訳をすると、体調を崩していたのと旅行に行っていたのが原因です)。

さてこの記事では、英語の授業をきっかけに読んだ論文で知った、ステートレスモデルチェッキング (SMC) のC/C++向けライブラリであるGenMCについて、ほんの少し勉強した内容を話します。

## 英語の授業を受けていた

私が通っている電気通信大学には、学部3年にもなって英語の必修の授業が存在しています (内容が技術寄りなのが唯一許せるポイントですが、学生からの評価が高いわけがありません)。

この授業では、気になっている研究室の先生の論文 (英語) をまとめて3分程度で発表するという課題があります。
私はプログラミング言語に関する研究に興味があったので、その方向性の研究をしている先生の論文を探しました。

そんな中、

> Efficiently Adapting Stateless Model Checking for C11/C++11 to Mixed-Size Accesses

という論文を見つけ、「C/C++の話やしなんとかなるやろ〜」という軽い気持ちで選びました。以下この論文の内容を自分なりに噛み砕いた内容を書いていこうと思います。

この分野に関する知識がほとんどないので、表現が不十分/間違っているところなどあるかもしれませんが、あたたかい目で見ていただけると幸いです (もちろん指摘などは大歓迎です)。

https://link.springer.com/chapter/10.1007/978-981-97-8943-6_17

## SMCとは

そもそも、ステートレスモデルチェッキング (SMC) とはなんでしょうか。簡単にいうと、主に並行システム (マルチスレッドプログラムや分散システムなど) の正しさを検証するためのツールです。

https://plv.mpi-sws.org/genmc/popl2025/

ステートレスであるため、実行パスの「状態」を丸ごと保存せず、探索した「実行パス (どの選択ポイントでどのスレッドを選んだか)」の履歴だけを管理します。

が、勘のいいみなさんならお気づきでしょうが、このSMC、スレッド数や共有変数へのアクセスが増えると、可能な実行順序が組み合わせ爆発を起こして大変なことになります。

そこで、DPORという手法が取られます。詳しい説明は省略しますが、簡単にいうと

**操作と操作が「独立しているか」「依存しているか」を判断し、「依存」関係にある捜査の実行順序だけを入れ替えてテストする手法です。**

## GenMCを触ってみる

さて、SMCのC/C++向けライブラリであるGenMCを使って実際にSMCを触ってみましょう。

https://github.com/MPI-SWS/genmc

### ビルドする

`README.md` に書いてある通りにビルドしていきます。私の環境はmacOSなので、

```text
cmake llvm libffi
```

を `brew` で入れ、以下のコマンドを実行してビルドを行いました (パスを通さないとビルドが通らなかったので少し複雑になっています)。

```bash
$ CXX=/usr/bin/g++ CC=/usr/bin/gcc \\
  LLVM_DIR=/opt/homebrew/opt/llvm/lib/cmake/llvm \\
  LDFLAGS="-L/opt/homebrew/opt/hwloc/lib" \\
  CPPFLAGS="-I/opt/homebrew/opt/hwloc/include" \\
  cmake \\
  -DCMAKE_BUILD_TYPE=RelWithDebInfo \\
  -DCMAKE_PREFIX_PATH=/opt/homebrew/opt/llvm:/opt/homebrew/opt/hwloc -B \\
  RelWithDebInfo -S .

$ cmake --build RelWithDebInfo
```

試しに、バージョンを見てみると正しくビルドできていることがわかります。

```bash
$ ./RelWithDebInfo/genmc --version
GenMC (https://plv.mpi-sws.org/genmc):
  GenMC v0.16.1 (commit #22d3d0b)
  Built with LLVM 21.1.7 (Release)
```

### 実行例

https://github.com/MPI-SWS/genmc/blob/master/doc/manual.md

マニュアルがあるので、それを追いながら実行してみましょう。

まず、以下のようなプログラムについて考えます。

```c
/* file: mp.c */
#include <stdlib.h>
#include <pthread.h>
#include <stdatomic.h>
#include <stdbool.h>
#include <assert.h>

atomic_int data;
atomic_bool ready;

void *thread_1(void *unused)
{
  atomic_store_explicit(&data, 42, memory_order_relaxed);
  atomic_store_explicit(&ready, true, memory_order_release);
  return NULL;
}

void *thread_2(void *unused)
{
  if (atomic_load_explicit(&ready, memory_order_acquire)) {
    int d = atomic_load_explicit(&data, memory_order_relaxed);
    assert(d == 42);
  }
  return NULL;
}

int main()
{
  pthread_t t1, t2;

  if (pthread_create(&t1, NULL, thread_1, NULL))
    abort();
  if (pthread_create(&t2, NULL, thread_2, NULL))
    abort();

  return 0;
}
```

このプログラムでは、`thread_1` で `data` に値を書き込んだ後、 `ready` を `true` にして準備が完了したことを示し、`thread_2` で `raedy` が準備完了になった時に `data` からデータを取得し検証しています。

`memory_order_release` はこの操作より前の書き込みが完了してから値を読めるようになり、
`memory_order_acquire` はこの操作より後の読み込みが、この操作の後に実行されることを保証するため、スレッド1で `data` を42に変更した後にスレッド2で読まれることが保証されています。なお、`memory_order_relaxed` は順序関係を気にせず書き込む一方で高速なオプションです。

実際に、GenMCで検証してみると、

```bash
./RelWithDebInfo/genmc mp.c
GenMC v0.16.1 (LLVM 21.1.7)
Copyright (C) 2024 MPI-SWS. All rights reserved.

*** Compilation complete.
*** Transformation complete.
Tip: Estimating state-space size. For better performance, you can use --disable-estimation.
*** Estimation complete.
Total executions estimate: 2 (+- 0)
Time to completion estimate: 0.04s
*** Verification complete.
No errors were detected.
Number of complete executions explored: 2
Total wall-clock time: 0.20s
```

エラーがなく、データの整合性が保証されているとわかります。

一方で、`ready` の書き込みも `memory_order_relaxed` でやってみると、GenMCでの検証結果は、

```bash
Error detected: Safety violation!
Event (2, 2) in graph:
<-1, 0> main:
        (0, 0): B
        (0, 1): M
        (0, 2): M
        (0, 3): TC [forks 1] L.30
        (0, 4): Wna (t1, 1) L.30
        (0, 5): TC [forks 2] L.32
        (0, 6): Wna (t2, 2) L.32
        (0, 7): E
<0, 1> thread_1:
        (1, 0): B
        (1, 1): Wrlx (data, 42) L.12
        (1, 2): Wrlx (ready, 1) L.13
        (1, 3): E
<0, 2> thread_2:
        (2, 0): B
        (2, 1): Racq (ready, 1) [(1, 2)] L.19
        (2, 2): Rrlx (data, 0) [INIT] L.20

Assertion violation: d == 42
Number of complete executions explored: 1
Total wall-clock time: 0.02s
```

となり、スレッド2が `(2, 2): Rrlx (data, 0) ` 適切にデータを読み込めていない (42となるところが0となっている) ことがわかります。

ここで紹介した例は非常にシンプルなものですが、GenMCを使うとこのような検証を行うことができます。

## サイズが混在したアクセスがあると

非常に便利なGenMCですが、今回取り上げた論文では mixed-size access (以下、サイズ混在アクセスと呼びます) に対応できないと言われています。なぜでしょうか。

### 一貫性が破綻する

GenMCは、マルチスレッドプログラムなどの「あらゆる実行順序」を試し、正しいかを検証します。

この検証を行うために、GenMCは実行履歴を「実行グラフ」という形で記録します。これは、どの操作がどの操作の「前に起きたか」や「どの書き込みを読み取ったか」を矢印で結んだもので、矢印の主なものに、`rf (reads-from)` と、`mo (modification-order)` があります。

`rf(reads-from)` は「スレッドBの読み取りXは、スレッドAの書き込みYの結果を読み取った」のようなデータの流れで、
`mo (modification-order)` は「同じメモリ場所Zに対して、書き込みPの次に書き込みQが行われた」のような書き込みの順序です。

GenMCでは、これらの `rf` や `mo` の関係を操作（イベント）単位で記録するように設計されており、サイズ混在アクセスを行うと、イベントだけでは記録しきれなくなってしまい、グラフが構築できず検証が正しく行えなくなってしまいます。

### 具体例

まず、通常のアクセスをみてみます。
`int x` に対して、スレッドAが `x = 10` と書き込み、スレッドBが `int temp = x` と読み込んだ場合、

```text
スレッドAがxに書き込んだ (イベントW1)
スレッドBがxを読み取った (イベントR1)
```

というイベントがあり、

```text
イベントR1はイベントW1を読み取った
```

という `rf` の関係が記録されます。

次に、サイズ混在アクセスによってグラフがうまく構築できない具体例を見てみましょう。
`int value` (4バイト) に対して、スレッドAが `int value = 0x11223344` と書き込み、スレッドBが `value` のアドレスを `char*` (1バイトポインタ)　として扱い、2バイト目だけを読み取る場合、

```text
スレッドAがアドレスの1〜4に書き込んだ (イベントW-All)
スレッドBがアドレスの2だけを読み取った (イベントR-Part)
```

というイベントがありますが、
「アドレス範囲 `[1,2,3,4]`」と「アドレス範囲 `[2]`」という、部分的に重なる範囲（フットプリント）間の関係になってしまい、イベント同士の関係ではなくなってしまいます。

## それでもGenMCを使いたい

今回取り上げた論文ではサイズ混在アクセスがある場合でもGenMCを使えるようにしていました。方法は単純で、`rf` や `mo` といった矢印 (関係) に「フットプリント (アドレス範囲) 」の情報を持たせるだけです。

これによって、イベントを分割することなく検証を行うことができるようになりました (イベントを分割すると計算量が増えたり本来しなくて良い検証まで行う必要が出てきてしまう)。

結果としても、メモリが混在したアクセスにおいてイベントを分割する手法と比べて高速に検証でき、通常の場合でも既存のGenMCと同程度のパフォーマンスを出せていることが示されており、有効なアプローチであると考えられます！

## 感想

さて、本来英語の授業だったはずですが、終わってみればGenMCについてちょっと勉強できたという謎の経験でした。

普段Web系のライブラリしか見ていないですが、別の分野のツールを見れた (+少し触れた) のはとても楽しかったです。また、実装がメインの論文を読むというのも初めての経験で面白かったです。来年から卒研でこのような機会が増えていくと思うので楽しみです。

というわけで、3日目は「英語の授業を受けていたらSMCの勉強が始まった」でした。明日は、RSC関連のVSCode拡張を作ってみた話をしようと思います。
