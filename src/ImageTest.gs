/**
 * 画像処理テスト用の関数群
 */

/**
 * 画像ファイル対応のテスト
 */
function testImageProcessing() {
  console.log("=== 画像処理テスト ===");
  
  // サポートされているファイル形式のテスト
  const testMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',        // サポート外
    'text/plain',       // サポート外
    'application/msword' // サポート外
  ];
  
  console.log("ファイル形式判定テスト:");
  testMimeTypes.forEach(mimeType => {
    const isSupported = isSupportedFileType(mimeType);
    const status = isSupported ? "✅ サポート" : "❌ サポート外";
    console.log(`${mimeType}: ${status}`);
  });
}

/**
 * 指定フォルダ内のファイル一覧とMIME typeを表示
 */
function listFilesInFolder() {
  try {
    const folderId = PropertiesService.getScriptProperties().getProperty("folderId");
    if (!folderId) {
      console.log("❌ folderIdが設定されていません");
      return;
    }
    
    const folder = DriveApp.getFolderById(folderId);
    const files = folder.getFiles();
    
    console.log("=== フォルダ内ファイル一覧 ===");
    let count = 0;
    
    while (files.hasNext()) {
      const file = files.next();
      const mimeType = file.getBlob().getContentType();
      const isSupported = isSupportedFileType(mimeType);
      const status = isSupported ? "✅" : "❌";
      
      console.log(`${status} ${file.getName()} (${mimeType})`);
      count++;
    }
    
    console.log(`\n合計ファイル数: ${count}`);
    
  } catch (error) {
    console.log("❌ エラー:", error.toString());
  }
}

/**
 * 画像ファイルの詳細情報を表示
 */
function analyzeImageFiles() {
  try {
    const folderId = PropertiesService.getScriptProperties().getProperty("folderId");
    if (!folderId) {
      console.log("❌ folderIdが設定されていません");
      return;
    }
    
    const folder = DriveApp.getFolderById(folderId);
    const files = folder.getFiles();
    
    console.log("=== 画像ファイル詳細分析 ===");
    
    while (files.hasNext()) {
      const file = files.next();
      const mimeType = file.getBlob().getContentType();
      
      // 画像ファイルのみ分析
      if (mimeType.startsWith('image/')) {
        const blob = file.getBlob();
        const sizeKB = Math.round(blob.getBytes().length / 1024);
        const createDate = file.getDateCreated();
        
        console.log(`\n📷 ${file.getName()}`);
        console.log(`   MIME Type: ${mimeType}`);
        console.log(`   ファイルサイズ: ${sizeKB} KB`);
        console.log(`   作成日時: ${createDate}`);
        console.log(`   サポート状況: ${isSupportedFileType(mimeType) ? "✅ サポート" : "❌ サポート外"}`);
        
        // ファイルサイズの警告
        if (sizeKB > 1000) {
          console.log(`   ⚠️  警告: ファイルサイズが大きいです (${sizeKB} KB)`);
        }
      }
    }
    
  } catch (error) {
    console.log("❌ エラー:", error.toString());
  }
}

/**
 * テスト用画像での動作確認
 * 注意: 実際に画像ファイルがフォルダに存在する必要があります
 */
function testImageProcessingFlow() {
  console.log("=== 画像処理フロー テスト ===");
  console.log("注意: 実際の画像ファイルをフォルダにアップロードしてから実行してください");
  
  try {
    // メイン関数を実行（画像ファイルがある場合）
    summarizePDFsWithGemini();
    console.log("✅ 画像処理フロー実行完了");
    
  } catch (error) {
    console.log("❌ 画像処理フローエラー:", error.toString());
  }
}