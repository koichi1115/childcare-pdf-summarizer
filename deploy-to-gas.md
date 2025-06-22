# GASデプロイ手順

## 📋 最新版をGASに反映する手順

### 1. ファイル一覧と更新順序

以下の順序でGASエディタに反映してください：

#### 基本ファイル
1. **appsscript.json** (マニフェストファイル)
2. **Config.gs** (設定管理)
3. **TaskManager.gs** (タスク管理)
4. **Code.gs** (メイン処理)

#### サポートファイル
5. **SetupHelper.gs** (セットアップ支援)
6. **TestRunner.gs** (テスト実行)
7. **TitleTest.gs** (タイトル抽出テスト)
8. **ImageTest.gs** ⭐ **新規追加** (画像処理テスト)

### 2. 各ファイルの内容

#### src/appsscript.json
```json
{
  "timeZone": "Etc/GMT-9",
  "dependencies": {
    "enabledAdvancedServices": [
      {
        "userSymbol": "Calendar",
        "version": "v3",
        "serviceId": "calendar"
      },
      {
        "userSymbol": "Tasks",
        "version": "v1",
        "serviceId": "tasks"
      }
    ]
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE_ANONYMOUS"
  }
}
```

### 3. v2.0の新機能確認

デプロイ後、以下の関数で動作確認：

```javascript
// 1. 画像対応確認
testImageProcessing()

// 2. フォルダ内ファイル確認
listFilesInFolder()

// 3. 全体テスト実行
runAllTests()
```

### 4. 期待される結果

✅ **JPEG/PNG画像ファイルが処理対象になる**  
✅ **isSupportedFileType()関数が動作する**  
✅ **画像ファイルからの要約・タスク抽出が可能**  
✅ **プライバシー対応済み（汎用的な設定サンプル）**

### 5. トラブルシューティング

#### エラーが発生した場合
1. **構文エラー**: 各ファイルを個別に保存して確認
2. **権限エラー**: Google Drive API権限を再確認
3. **API制限**: Gemini APIの使用量を確認

#### 動作確認項目
- [ ] 既存のPDF処理が正常に動作する
- [ ] 新しい画像処理が動作する
- [ ] 設定サンプルが汎用的になっている
- [ ] 全てのテストが成功する

## 🚀 デプロイ完了後の推奨アクション

1. **iPhone画像テスト**
   - iPhoneでお便りを撮影
   - Google Driveにアップロード
   - 自動処理の確認

2. **既存機能の回帰テスト**
   - 既存PDFでの動作確認
   - カレンダー・タスク登録の確認

3. **設定の確認**
   - スクリプトプロパティが正しく設定されている
   - API権限が適切に付与されている