# テスト手順書

## 🧪 テスト概要

このドキュメントでは、改修されたPDF要約ツールのテスト手順を説明します。

## 📋 テスト準備

### 1. Google Apps Script プロジェクトの設定

1. **新しいGASプロジェクトを作成**
2. **ファイルをコピー**
   - `src/Code.gs` → GASエディタにコピー
   - `src/Config.gs` → GASエディタで新しいファイルを作成してコピー
   - `src/TaskManager.gs` → GASエディタで新しいファイルを作成してコピー
   - `src/appsscript.json` → GASエディタのマニフェストにコピー

3. **必要なサービスを有効化**
   - Google Calendar API
   - Google Tasks API
   - Google Drive API

### 2. スクリプトプロパティの設定

「プロジェクトの設定」→「スクリプト プロパティ」で以下を設定：

```
キー: folderId
値: [Google Driveのテスト用フォルダID]

キー: GeminiKey  
値: [Gemini APIキー]

キー: childrenInfo
値: [{"name": "テスト太郎", "nameKana": "てすとたろう", "gender": "男性", "birthDate": "2020年4月1日"}]

キー: institutionsInfo
値: [{"name": "テスト保育園", "type": "school", "schoolType": "保育園", "address": "テスト住所", "students": [{"name": "テスト太郎", "class": "らいおん組", "currentYear": "2025年現在"}]}]
```

## 🔍 単体テスト

### テスト1: 設定情報の読み込み

```javascript
// GASエディタで実行
function test1_ConfigLoading() {
  try {
    const children = getChildrenInfo();
    const institutions = getInstitutionsInfo();
    
    console.log("子供情報:", children);
    console.log("施設情報:", institutions);
    
    if (children.length > 0 && institutions.length > 0) {
      console.log("✅ 設定情報の読み込み成功");
      return true;
    } else {
      console.log("❌ 設定情報が不完全");
      return false;
    }
  } catch (error) {
    console.log("❌ エラー:", error.toString());
    return false;
  }
}
```

### テスト2: プロンプト生成

```javascript
// GASエディタで実行  
function test2_PromptGeneration() {
  try {
    const children = getChildrenInfo();
    const institutions = getInstitutionsInfo();
    const prompt = generatePrompt(children, institutions);
    
    console.log("生成されたプロンプト:");
    console.log(prompt);
    
    if (prompt.includes(children[0].name) && prompt.includes(institutions[0].name)) {
      console.log("✅ プロンプト生成成功");
      return true;
    } else {
      console.log("❌ プロンプトに必要な情報が含まれていない");
      return false;
    }
  } catch (error) {
    console.log("❌ エラー:", error.toString());
    return false;
  }
}
```

### テスト3: タスク抽出ロジック

```javascript
// テスト用の要約文でタスク抽出をテスト
function test3_TaskExtraction() {
  const testSummary = `
テスト保育園　テストのお知らせ

【要約】
- テストイベントを5月10日に実施します

【ToDo】  
- テスト太郎：参加確認書を5月5日までに提出

【持ち物】
- テスト太郎：お弁当、水筒（5月10日）

【イベント】
- テストイベント：5月10日、らいおん組
`;

  try {
    const children = getChildrenInfo();
    const tasks = extractTasksFromSummary(testSummary, children);
    
    console.log("抽出されたタスク:", tasks);
    
    if (tasks.length >= 2) {
      console.log("✅ タスク抽出成功");
      return true;
    } else {
      console.log("❌ 期待されるタスク数が抽出されていない");
      return false;
    }
  } catch (error) {
    console.log("❌ エラー:", error.toString());
    return false;
  }
}
```

### テスト4: Googleタスク登録

```javascript
// 実際にGoogleタスクに登録するテスト（要注意）
function test4_GoogleTasksRegistration() {
  try {
    const testTasks = [
      {
        title: "[テスト][テスト太郎] テスト用タスク",
        notes: "これはテスト用のタスクです",
        dueDate: new Date(2025, 4, 10) // 2025年5月10日
      }
    ];
    
    registerTasksToGoogle(testTasks);
    console.log("✅ Googleタスク登録成功");
    return true;
  } catch (error) {
    console.log("❌ エラー:", error.toString());
    return false;
  }
}
```

## 🔄 統合テスト

### 統合テスト: PDF処理フロー全体

1. **テスト用PDFの準備**
   - 簡単なテキストPDF（1-2ページ）を作成
   - 以下のような内容を含む：
     ```
     テスト保育園からのお知らせ
     
     5月のイベント：
     - 遠足：5月15日
     - らいおん組は参加
     
     持参物：
     - お弁当
     - 水筒
     
     提出物：
     - 参加確認書を5月10日まで
     ```

2. **テスト実行**
   ```javascript
   // 注意：実際にPDFをアップロードして実行
   function integrationTest() {
     // PDFを指定フォルダにアップロード後、実行
     summarizePDFsWithGemini();
   }
   ```

3. **結果確認**
   - ✅ Googleカレンダーにイベントが作成される
   - ✅ Googleタスクにタスクが登録される
   - ✅ ログに適切な要約が出力される

## ⚠️ テスト時の注意事項

1. **API使用量**
   - Gemini APIの使用量に注意
   - テスト用の小さなPDFを使用

2. **Googleサービス**
   - テスト用のカレンダー・タスクリストを使用
   - 本番データを汚さないよう注意

3. **エラーハンドリング**
   - 各テストでエラーが発生した場合の対処方法を確認
   - ログ出力を必ず確認

## 📊 テスト結果記録

| テスト項目 | 結果 | 備考 |
|-----------|------|------|
| 設定情報読み込み | ⬜ | |
| プロンプト生成 | ⬜ | |
| タスク抽出 | ⬜ | |
| Googleタスク登録 | ⬜ | |
| 統合テスト | ⬜ | |

## 🐛 発見された問題

- [ ] 問題1: 
- [ ] 問題2:
- [ ] 問題3:

## ✅ テスト完了チェックリスト

- [ ] 全ての単体テストが成功
- [ ] 統合テストが成功  
- [ ] エラーハンドリングが適切に動作
- [ ] 設定手順書が正確
- [ ] パフォーマンスが許容範囲内