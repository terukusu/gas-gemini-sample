# gas-gemini サンプルコード

Google Apps Script用のGeminiクライアントライブラリの使用例です。

## 前提条件

1. [gas-gemini](../gas-gemini/)をライブラリとして追加
2. Google Gemini APIキーを取得し、PropertiesServiceに設定
3. appsscript.jsonのライブラリIDを実際のgas-geminiのScript IDに変更

## APIキーの設定

1. GASのスクリプトエディタで「プロジェクトの設定」→「スクリプト プロパティ」
2. プロパティ名: `api_key`
3. 値: あなたのGemini APIキー

## サンプル一覧

### 基本機能
- `testSimple()` - シンプルなテキスト生成
- `testJson()` - JSON形式での回答取得
- `testParameterOverride()` - パラメータの個別上書き

### 画像・動画機能
- `testImage()` - 画像分析（Drive上のファイル）
- `testVideo()` - 動画分析（Gemini独自機能）
- `testImageGenerate()` - 画像生成（Imagen4）

### 高度な機能
- `testToolUse()` - Tool Use（関数呼び出し）
- `testEmbeddings()` - エンベディング（単一）
- `testBatchEmbeddings()` - バッチエンベディング（複数）
- `testDetailedResponse()` - 詳細なAPIレスポンス取得

## 実行方法

1. `myFunction()`を実行すると基本的なテストが実行されます
2. 他のテスト関数のコメントアウトを外して実行してください
3. 画像・動画テストの場合は、Drive上のファイルIDを適切なものに変更してください

## 注意事項

- 画像・動画ファイルのIDは実在するもので、適切な権限があるファイルを指定してください
- Tool Use機能では実際に関数が実行されるため、副作用に注意してください
- APIレート制限に注意し、大量のリクエストを短時間で実行しないでください
- 全ての関数にエラーハンドリングを実装済み（try-catch文）
- ライブラリの参照には`GeminiLib.createGeminiClient()`を使用してください

## OpenAI版との違い

| 機能 | OpenAI | Gemini | 備考 |
|------|--------|--------|------|
| テキスト生成 | `simpleChat` | `simpleChat` | 同じインターフェース |
| Function Calling | `functions` | `tools` | パラメータ名が異なる |
| 画像生成 | DALL-E | Imagen4 | モデル指定が異なる |
| 動画分析 | ❌ | ✅ | Gemini独自機能 |
| 音声文字起こし | ✅ | ❌ | Geminiは非対応 |

## モデル設定例

```javascript
// 高性能モデル（コスト高）
const client = createGeminiClient({
  apiKey: GEMINI_API_KEY,
  model: 'gemini-2.5-pro'
});

// 高速モデル（コスト低）
const client = createGeminiClient({
  apiKey: GEMINI_API_KEY,
  model: 'gemini-2.5-flash'
});
```