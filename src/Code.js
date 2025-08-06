const GEMINI_API_KEY = PropertiesService.getScriptProperties().getProperty('api_key');

const client = GASGemini.createGeminiClient({
  apiKey: GEMINI_API_KEY,
  model: 'gemini-2.5-flash',  // 最新の2.5モデル
  temperature: 0.7,
  topP: 0.95,
  topK: 40
});

function myFunction() {
  testSimple();
  // testJson();
  // testToolUse();
  // testImage();
  // testVideo();
  // testImageGenerate();
  // testEmbeddings();
  // testBatchEmbeddings();
  // testParameterOverride();
  // testDetailedResponse();
}

// シンプルな例
function testSimple() {
  try {
    const result = client.simpleChat("こんにちは！居ますか？");
    Logger.log(result);
    // 出力例：こんにちは！なにかお手伝いできることはありますか？
  } catch (error) {
    Logger.log("エラーが発生しました: " + error.message);
  }
}

// ==== AIの回答をJSONで受け取る例 ====
function testJson() {
  try {
    const responseSchemaHuman = {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "description": "名前"
        },
        "age": {
          "type": "number",
          "description": "年齢"
        }
      },
      "required": ["name", "age"]
    };
    
    const params = {
      responseSchema: responseSchemaHuman
    }

    const result = client.simpleChat("架空の人物になって自己紹介をして", params);
    Logger.log(result);
    // 出力例：{age=28.0, name=佐藤健太} （オブジェクト型）
  } catch (error) {
    Logger.log("JSON生成エラー: " + error.message);
  }
}

// ==== Tool Use（関数呼び出し）で前提知識を補完する例 ====
function testToolUse() {
  try {
    function getWeather(args) {
      return {weather: "晴れ", location: args.location, temperature: "25°C"};
    }
    
    // 新形式（推奨）
    const tools = [{
      name: "getWeather",
      description: "指定された地域の現在の天気を調べます。",
      parameters: {
        "type": "object",
        "properties": {
          "location": {
            "type": "string",
            "description": "天気を調べたい地域名"
          }
        },
        "required": ["location"]
      },
      execute: getWeather  // 実行する関数
    }];
    
    const params = {
      tools: tools,
      temperature: 0.3  // Tool Use時は低温度推奨
    }
    
    const result = client.simpleChat("アラスカの天気は？", params);
    Logger.log(result);
    // 出力例：アラスカの天気は晴れで、気温は25°Cです。
  } catch (error) {
    Logger.log("Tool Useエラー: " + error.message);
  }
}

// ==== Drive上の画像を処理する例 ====
function testImage() {
  try {
    const myImage = DriveApp.getFileById("1yrMzdYc3X2x1Ui_1D1x4g4nU_robqrxU");

    const params = {
      model: "gemini-2.5-flash", // 最新マルチモーダル対応モデル
      images: [myImage.getBlob()],
      temperature: 0.4,  // 画像分析は低温度推奨
      maxTokens: 1000
    };

    const result = client.simpleChat("この画像を詳しく解説してください。", params);
    Logger.log(result);
    // 出力例：この画像は、スマートフォンやタブレットなどのデバイスで使用されるメニューの一部を示しています...
  } catch (error) {
    Logger.log("画像分析エラー: " + error.message);
  }
}

// ==== Drive上の動画を分析する例（Gemini独自機能） ====
function testVideo() {
  try {
    const myVideo = DriveApp.getFileById("1nPivg4JwHhrE4Qax1du2CM2P5uIIY9Py");

    const params = {
      model: "gemini-2.5-flash", // 最新動画分析対応モデル
      temperature: 0.3,
      maxTokens: 2000,
      safetySettings: [  // 動画用の安全設定
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_LOW_AND_ABOVE"
        }
      ]
    };

    const result = client.simpleVideoAnalysis(myVideo.getBlob(), "この動画で何が起こっていますか？要約してください。", params);
    Logger.log(result);
    // 出力例：この動画では、公園で子供たちがサッカーをして遊んでいる様子が映されています...
  } catch (error) {
    Logger.log("動画分析エラー: " + error.message);
  }
}

// ==== 画像生成の例 ====
function testImageGenerate() {
  try {
    const params = {
      model: "imagen-3.0-generate-001", // 画像生成を使うときはこのモデルを指定
      aspectRatio: "1:1" // アスペクト比を指定（Gemini独自）
    };

    const result = client.simpleImageGeneration("犬を描いてください。", params);
    Logger.log(result);
    // 出力例：data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...
  } catch (error) {
    Logger.log("画像生成エラー: " + error.message);
  }
}

// ==== エンベディング（ベクトル化）の例 ====
function testEmbeddings() {
  try {
    const params = {
      model: "text-embedding-004", // embeddingsを使うときはこのモデルを指定
      taskType: "RETRIEVAL_DOCUMENT" // タスクタイプを指定
    };

    const result = client.simpleEmbedding(["わーい"], params);
    Logger.log(result);
    // 出力例：[0.002589861, 0.013294913, -0.079392985, ...]
  } catch (error) {
    Logger.log("エンベディングエラー: " + error.message);
  }
}

// ==== 複数テキストの一括エンベディング例 ====
function testBatchEmbeddings() {
  try {
    const texts = ["こんにちは", "さようなら", "ありがとう"];
    
    const params = {
      model: "text-embedding-004",
      taskType: "RETRIEVAL_DOCUMENT"
    };

    const result = client.simpleEmbedding(texts, params);
    Logger.log(result);
    // 出力例：
    // [
    //   [0.002589861, 0.013294913, -0.079392985, ...], // "こんにちは"のベクトル
    //   [0.003421567, 0.021534678, -0.056789234, ...], // "さようなら"のベクトル
    //   [0.001234567, 0.098765432, -0.012345678, ...]  // "ありがとう"のベクトル
    // ]
  } catch (error) {
    Logger.log("バッチエンベディングエラー: " + error.message);
  }
}

// ==== パラメータ個別上書きの例 ====
function testParameterOverride() {
  try {
    // インスタンス作成時のデフォルト設定
    const client = GASGemini.createGeminiClient({
      apiKey: GEMINI_API_KEY,
      model: 'gemini-2.5-flash',
      temperature: 0.7,
      topP: 0.95,
      topK: 40
    });

    // この呼び出しのみ高い創造性で実行
    const result = client.simpleChat("詩を書いて", {
      temperature: 1.2,  // デフォルトの0.7を上書き
      maxTokens: 500,
      topP: 0.9         // デフォルトの0.95を上書き
    });
    
    Logger.log(result);
    // より創造的な詩が生成される
  } catch (error) {
    Logger.log("パラメータ上書きエラー: " + error.message);
  }
}

// ==== 詳細なAPIレスポンスを取得する例 ====
function testDetailedResponse() {
  try {
    const result = client.generateContent("宇宙について教えて", {
      temperature: 0.5,
      maxTokens: 1000
    });
    
    Logger.log("Generated text:", result.candidates[0].content.parts[0].text);
    Logger.log("Usage info:", result.usageMetadata);
    Logger.log("Safety ratings:", result.candidates[0].safetyRatings);
    // 詳細なレスポンス情報を確認できる
  } catch (error) {
    Logger.log("詳細レスポンス取得エラー: " + error.message);
  }
}