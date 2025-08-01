# ai-sdk-tools-playground

Vercel AI SDK の Tool 機能の素振り

## ベストプラクティス

手続き的にではなく宣言的に書くのがよい

### 前処理：ユーザーの入力を API のスキーマに沿うように正規化する

そのために AI に背景情報を渡しておく必要がある。どう渡すか

#### △ tools の中でさらに AI を呼ぶ（二度手間）

```typescript
  tools: {
    weather: tool({
      async execute({ location }) {
        const res = await openai('gpt-4.1').chat.completions.create({
          messages: [
            {
              role: 'system',
              content: [
              'あなたは一次細分区域の cityMap を知っているアシスタントです。cityMap は以下の JSON 配列形式で提供されます：',
                JSON.stringify(cityMap),
                '',
                'ユーザーが入力した location（地名）から最も妥当な name を選び、その対応する id を**文字列**だけで返してください。',
              ].join('\n'),
            },
            { role: 'user', content: `location: "${input}"` },
          ],
        });
        const id = aiRes.choices[0].message.content.trim().replace(/"/g, '');
        /* ... */
```

#### ◎ message の中であらかじめ宣言しておく

```typescript
const result = streamText({
  messages: [
    {
      role: "system",
      content:
        `weather ツールは、引数に一次細分区域IDを受け取り、天気取得APIを叩いて生のJSONを返します。あなたは、入力された場所から最も近い地域を下記の「一時細分区域ID一覧」から選んで、そのIDを指定して weather ツールを呼んでください。あなたはその後、天気APIから返ってきたJSONを日本語でわかりやすく要約してください。
        --- 一時細分区域IDの一覧 ---
        ${JSON.stringify(cityMap)}`.trim(),
    },
    ...messages,
  ],
```

### 後処理：API の結果を AI に要約させる

#### △ tools の中でさらに AI を呼ぶ（二度手間）

```typescript
  tools: {
    weather: tool({
      async execute({ location }) {
        /* ... */
        const data = await apiRes.json();

        const prompt = ;

        const sumRes = await openai.chat.completions.create({
          messages: [
            { role: 'system', content: 'あなたは日本語で要約するアシスタントです。' },
            {
              role: 'user', 
              content: `以下は天気APIのレスポンスです。場所名・天気 (telop)・最高／最低気温を抜き出して、日本語で手短に要約してください。データ:${JSON.stringify(data)}`.trim() },
          ],
        });
        const summary = sumRes.choices?.[0]?.message?.content;
        /* ... */
      },
    }),
  },
```

#### ◎ マルチステップ呼び出しを使う

```typescript
const result = streamText({
  maxSteps: 2, // マルチステップ呼び出しを有効化
  messages: [
    {
      role: "system",
      content:
        `weather ツールは天気データの生JSONを返すので、あなたはそのJSONを日本語でわかりやすく要約してください。
    },
    ...messages,
  ],
  tools: {
    weather: tool({
      /* ... */
```

## 参考

- マルチステップ呼び出し公式：[AI SDK: ツール呼び出し](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#multi-step-calls-using-maxsteps)
- 検索エンジン：[【エージェント実装の第一歩】Vercel AI SDK のツール機能を使いこなす](https://zenn.dev/kikagaku/articles/14b51ea07b46c6)
- 基礎：[Vercel AI SDK で AIモデルごとのSDKに依存しないアプリを実装しよう！](https://zenn.dev/nomhiro/articles/poc-vercel-ai-sdk)
- 公式チュートリアル：[Getting Started: Next.js App Router](https://ai-sdk.dev/docs/getting-started/nextjs-app-router)

## 関連リンク

- [天気予報 API（livedoor 天気互換）](https://weather.tsukumijima.net/)
