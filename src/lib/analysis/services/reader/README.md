# 小説生成AIシステム API仕様書

## 基本情報

- **ベースURL**: `https://api.novel-ai-system.com/v1`
- **認証**: Bearer トークン認証（Authorization ヘッダー）
- **レスポンス形式**: JSON

## エンドポイント

### 1. 読者体験分析 API

#### 章の読者体験分析

```
POST /reader-experience/analyze
```

**リクエスト本文**:

```json
{
  "chapter": {
    "chapterNumber": 1,
    "title": "始まりの章",
    "content": "章のコンテンツ...",
    "scenes": [
      {
        "id": "scene-1",
        "type": "INTRODUCTION",
        "title": "主人公の登場",
        "startPosition": 0,
        "endPosition": 500,
        "characters": ["田中太郎", "佐藤花子"],
        "summary": "主人公が旅立ちを決意するシーン"
      }
    ]
  },
  "previousChapters": [
    {
      "chapterNumber": 0,
      "title": "プロローグ",
      "content": "前章のコンテンツ..."
    }
  ]
}
```

**成功レスポンス** (200 OK):

```json
{
  "analysis": {
    "interestRetention": 8,
    "empathy": 7,
    "clarity": 9,
    "unexpectedness": 6,
    "anticipation": 8,
    "overallScore": 7.6,
    "weakPoints": [
      {
        "point": "主人公の動機が明確に示されていない",
        "suggestion": "主人公の内面描写を追加し、行動の理由を示してください"
      }
    ],
    "strengths": [
      "世界観の描写が詳細で没入感がある",
      "サブキャラクターの個性が魅力的"
    ]
  }
}
```

**エラーレスポンス** (400 Bad Request):

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "チャプター情報が不足しています",
    "details": "chapterコンテンツは必須です"
  }
}
```

#### 改善提案の生成

```
POST /reader-experience/improvements
```

**リクエスト本文**:

```json
{
  "analysis": {
    "interestRetention": 6,
    "empathy": 5,
    "clarity": 8,
    "unexpectedness": 4,
    "anticipation": 6,
    "overallScore": 5.8,
    "weakPoints": [
      {
        "point": "感情移入が難しい",
        "suggestion": "キャラクターの内面描写を増やす"
      }
    ],
    "strengths": [
      "世界観の構築が緻密"
    ]
  }
}
```

**成功レスポンス** (200 OK):

```json
{
  "improvements": [
    "感情移入しやすくするためにキャラクターの内面描写をより具体的に加えてください",
    "展開の意外性を高めるために予想外の展開や転換を追加してください",
    "続きへの期待を高めるためにクリフハンガーを効果的に使用してください"
  ]
}
```

#### シーン改善提案の生成

```
POST /reader-experience/scene-improvements
```

**リクエスト本文**:

```json
{
  "chapter": {
    "chapterNumber": 2,
    "title": "冒険の始まり",
    "content": "章のコンテンツ...",
    "scenes": [
      {
        "id": "scene-1",
        "type": "INTRODUCTION",
        "title": "出発の朝",
        "startPosition": 0,
        "endPosition": 500,
        "characters": ["主人公", "仲間1"],
        "summary": "冒険に出発する準備をするシーン"
      },
      {
        "id": "scene-2",
        "type": "DEVELOPMENT",
        "title": "最初の試練",
        "startPosition": 501,
        "endPosition": 1200,
        "characters": ["主人公", "仲間1", "敵1"],
        "summary": "初めての障害に直面するシーン"
      }
    ]
  },
  "analysis": {
    "interestRetention": 6,
    "empathy": 5,
    "clarity": 7,
    "unexpectedness": 4,
    "anticipation": 6,
    "overallScore": 5.6,
    "weakPoints": [
      {
        "point": "展開が予想通り",
        "suggestion": "意外性のある展開を追加する"
      }
    ],
    "strengths": [
      "キャラクター同士の掛け合いが魅力的"
    ]
  }
}
```

**成功レスポンス** (200 OK):

```json
{
  "sceneImprovements": {
    "scene-1": [
      "導入シーンでより強いフックを作り、読者の注目を集めてください",
      "章の前半のシーンで状況説明をより明確にしてください"
    ],
    "scene-2": [
      "展開シーンでキャラクターの内面描写を増やし、感情移入を促進してください",
      "意外性のある展開を追加し、読者の予想を覆してください"
    ]
  }
}
```

#### ジャンル固有の読者期待分析

```
GET /reader-experience/genre-expectations
```

**クエリパラメータ**:
- `genre`: 小説のジャンル (fantasy, mystery, romance, thriller など)
- `chapterNumber`: 現在の章番号
- `totalChapters`: 全体の章数 (オプション、デフォルト: 20)

**成功レスポンス** (200 OK):

```json
{
  "expectations": [
    "導入部では読者の好奇心を刺激するミステリーや謎を提示してください",
    "ファンタジー読者は世界観の一貫性と魔法システムの論理性に期待しています",
    "ファンタジー序盤では、魅力的な世界構築と読者を惹きつける冒険要素を入れてください"
  ]
}
```

#### 特定読者タイプの分析

```
POST /reader-experience/reader-type-analysis
```

**リクエスト本文**:

```json
{
  "chapter": {
    "chapterNumber": 3,
    "title": "決断の時",
    "content": "章のコンテンツ..."
  },
  "readerType": "critical"
}
```

**成功レスポンス** (200 OK):

```json
{
  "recommendations": [
    "テーマと象徴を一貫して発展させ、深い解釈の層を提供してください",
    "キャラクターの決断と行動に明確な動機と心理的リアリズムを持たせてください",
    "世界設定の細部における論理的整合性を確保してください"
  ]
}
```

### 2. シーン分析 API

#### シーン情報の抽出

```
POST /scenes/extract
```

**リクエスト本文**:

```json
{
  "content": "章の全文コンテンツ...",
  "options": {
    "minSceneLength": 300,
    "detectCharacters": true
  }
}
```

**成功レスポンス** (200 OK):

```json
{
  "scenes": [
    {
      "id": "auto-scene-1",
      "type": "INTRODUCTION",
      "title": "始まりの朝",
      "startPosition": 0,
      "endPosition": 520,
      "characters": ["主人公", "サブキャラクター1"],
      "summary": "主人公が朝起きて日常を過ごすシーン"
    },
    {
      "id": "auto-scene-2",
      "type": "DEVELOPMENT",
      "title": "友人との出会い",
      "startPosition": 521,
      "endPosition": 1250,
      "characters": ["主人公", "友人1", "友人2"],
      "summary": "主人公が友人たちと出会い、会話するシーン"
    }
  ]
}
```

## エラーコード

| コード | 説明 |
|--------|------|
| INVALID_REQUEST | リクエストの形式が正しくないか、必須パラメータが欠けています |
| AUTHENTICATION_ERROR | 認証に失敗しました |
| AUTHORIZATION_ERROR | 必要な権限がありません |
| RESOURCE_NOT_FOUND | 要求されたリソースが見つかりません |
| SERVICE_ERROR | サービス内部でエラーが発生しました |
| RATE_LIMIT_EXCEEDED | APIリクエスト制限を超えました |

## 認証

すべてのAPIリクエストにはBearer認証トークンが必要です：

```
Authorization: Bearer YOUR_API_KEY
```

## 利用制限

- 1時間あたり100リクエスト
- 1日あたり1000リクエスト
- リクエスト本文の最大サイズ: 100KB

## サンプルコード

### Node.js

```javascript
const axios = require('axios');

async function analyzeChapter(chapter, previousChapters) {
  try {
    const response = await axios.post(
      'https://api.novel-ai-system.com/v1/reader-experience/analyze',
      {
        chapter,
        previousChapters
      },
      {
        headers: {
          'Authorization': `Bearer YOUR_API_KEY`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error analyzing chapter:', error.response?.data || error.message);
    throw error;
  }
}
```

### Python

```python
import requests

def analyze_chapter(chapter, previous_chapters):
    url = 'https://api.novel-ai-system.com/v1/reader-experience/analyze'
    headers = {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    }
    payload = {
        'chapter': chapter,
        'previousChapters': previous_chapters
    }
    
    response = requests.post(url, json=payload, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Error: {response.status_code}, {response.json()}")
```

/**
 * NovelAISystemAPI の実装サンプル
 */
import axios, { AxiosInstance } from 'axios';
import {
  NovelAISystemAPI,
  AnalyzeReaderExperienceRequest,
  AnalyzeReaderExperienceResponse,
  GenerateImprovementsRequest,
  GenerateImprovementsResponse,
  GenerateSceneImprovementsRequest,
  GenerateSceneImprovementsResponse,
  GetGenreExpectationsRequest,
  GetGenreExpectationsResponse,
  AnalyzeForReaderTypeRequest,
  AnalyzeForReaderTypeResponse,
  ExtractScenesRequest,
  ExtractScenesResponse
} from './interfaces';

/**
 * 小説生成AIシステムのAPIクライアント
 */
export class NovelAISystemClient implements NovelAISystemAPI {
  private readonly client: AxiosInstance;
  private readonly baseUrl: string;

  /**
   * コンストラクタ
   * @param apiKey API認証キー
   * @param baseUrl APIのベースURL（デフォルト: https://api.novel-ai-system.com/v1）
   */
  constructor(
    apiKey: string,
    baseUrl: string = 'https://api.novel-ai-system.com/v1'
  ) {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // レスポンスインターセプター（エラーハンドリング）
    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.response) {
          const { status, data } = error.response;
          console.error(`API Error (${status}):`, data);
        } else if (error.request) {
          console.error('No response received:', error.request);
        } else {
          console.error('Request error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * 章の読者体験を分析する
   * @param request 分析リクエスト
   * @returns 読者体験分析結果
   */
  async analyzeReaderExperience(
    request: AnalyzeReaderExperienceRequest
  ): Promise<AnalyzeReaderExperienceResponse> {
    const response = await this.client.post<AnalyzeReaderExperienceResponse>(
      '/reader-experience/analyze',
      request
    );
    return response.data;
  }

  /**
   * 改善提案を生成する
   * @param request 改善提案リクエスト
   * @returns 改善提案のリスト
   */
  async generateImprovements(
    request: GenerateImprovementsRequest
  ): Promise<GenerateImprovementsResponse> {
    const response = await this.client.post<GenerateImprovementsResponse>(
      '/reader-experience/improvements',
      request
    );
    return response.data;
  }

  /**
   * シーンごとの改善提案を生成する
   * @param request シーン改善リクエスト
   * @returns シーンIDごとの改善提案
   */
  async generateSceneImprovements(
    request: GenerateSceneImprovementsRequest
  ): Promise<GenerateSceneImprovementsResponse> {
    const response = await this.client.post<GenerateSceneImprovementsResponse>(
      '/reader-experience/scene-improvements',
      request
    );
    return response.data;
  }

  /**
   * ジャンル固有の読者期待を取得する
   * @param request ジャンル期待リクエスト
   * @returns ジャンル固有の期待リスト
   */
  async getGenreExpectations(
    request: GetGenreExpectationsRequest
  ): Promise<GetGenreExpectationsResponse> {
    const { genre, chapterNumber, totalChapters } = request;
    
    const params = new URLSearchParams();
    params.append('genre', genre);
    params.append('chapterNumber', chapterNumber.toString());
    if (totalChapters) {
      params.append('totalChapters', totalChapters.toString());
    }
    
    const response = await this.client.get<GetGenreExpectationsResponse>(
      `/reader-experience/genre-expectations?${params.toString()}`
    );
    return response.data;
  }

  /**
   * 特定の読者タイプに対する分析を行う
   * @param request 読者タイプ分析リクエスト
   * @returns 読者タイプ固有の推奨事項
   */
  async analyzeForReaderType(
    request: AnalyzeForReaderTypeRequest
  ): Promise<AnalyzeForReaderTypeResponse> {
    const response = await this.client.post<AnalyzeForReaderTypeResponse>(
      '/reader-experience/reader-type-analysis',
      request
    );
    return response.data;
  }

  /**
   * 章からシーン情報を抽出する
   * @param request シーン抽出リクエスト
   * @returns 抽出されたシーンのリスト
   */
  async extractScenes(
    request: ExtractScenesRequest
  ): Promise<ExtractScenesResponse> {
    const response = await this.client.post<ExtractScenesResponse>(
      '/scenes/extract',
      request
    );
    return response.data;
  }
}

// 使用例
async function exampleUsage() {
  const apiKey = 'your_api_key_here';
  const client = new NovelAISystemClient(apiKey);
  
  try {
    // 章の分析例
    const analysisResult = await client.analyzeReaderExperience({
      chapter: {
        chapterNumber: 1,
        title: '新たな旅立ち',
        content: 'この物語は...'
      },
      previousChapters: []
    });
    
    console.log('分析結果:', analysisResult);
    
    // 改善提案の取得
    const improvements = await client.generateImprovements({
      analysis: analysisResult.analysis
    });
    
    console.log('改善提案:', improvements);
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}