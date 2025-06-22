function summarizePDFsWithGemini() {
  try {
    const folderId = PropertiesService.getScriptProperties().getProperty("folderId");
    const apiKey = PropertiesService.getScriptProperties().getProperty("GeminiKey");
    const apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

    // 設定情報を取得
    const children = getChildrenInfo();
    const institutions = getInstitutionsInfo();
    const dynamicPrompt = generatePrompt(children, institutions);

    const folder = DriveApp.getFolderById(folderId);
    
    // PDF、JPEG、PNG ファイルを取得
    const allFiles = folder.getFiles();
    
    while (allFiles.hasNext()) {
      const file = allFiles.next();
      
      // ファイル形式を確認（PDF、JPEG、PNG のみ処理）
      const mimeType = file.getBlob().getContentType();
      if (!isSupportedFileType(mimeType)) {
        continue; // サポート外のファイルはスキップ
      }
      
      const fileBlob = file.getBlob();
      const base64EncodedFile = Utilities.base64Encode(fileBlob.getBytes());
      
      // ファイルの作成（アップロード）時間を取得
      const createDate = file.getDateCreated(); 
      const now = new Date();
      const timeDiff = (now.getTime() - createDate.getTime()) / (60 * 1000);
      
      // 1分以内のファイルのみ処理
      if (1 >= timeDiff) {
        const requestBody = {
          contents: [
            {
              parts: [
                {text: dynamicPrompt},
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64EncodedFile
                  }
                }
              ]
            }
          ]
        };
      
        const options = {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          payload: JSON.stringify(requestBody)
        };

        const response = UrlFetchApp.fetch(apiEndpoint, options);
        const result = JSON.parse(response.getContentText());
        
        // 生成AIの出力から件名抽出
        const summary = result.candidates[0].content.parts[0].text;
        const extractedTitle = extractTitleFromSummary(summary);
        
        Logger.log('ファイル名: ' + file.getName());
        Logger.log('ファイル形式: ' + mimeType);
        Logger.log('要約: ' + summary);

        // カレンダーにイベントを追加
        const calendar = CalendarApp.getDefaultCalendar();
        const eventTitle = extractedTitle;
        const today = new Date();
        const fileId = file.getId();
        const fileUrl = "https://drive.google.com/open?id=" + fileId;
        const eventDescription = "\n\n添付ファイル: " + fileUrl + "\n\n" + summary;

        const event = calendar.createEvent(eventTitle, today, new Date(today.getTime() + 3600000), {description: eventDescription});
        Logger.log('イベントを作成しました: ' + eventTitle);

        // タスクを抽出して登録
        const tasks = extractTasksFromSummary(summary, children);
        if (tasks.length > 0) {
          registerTasksToGoogle(tasks);
        }
      }
    }
  } catch (error) {
    Logger.log('エラーが発生しました: ' + error.toString());
    throw error;
  }
}

/**
 * サポートされているファイル形式かどうかを判定する
 * @param {string} mimeType ファイルのMIME type
 * @return {boolean} サポートされている場合true
 */
function isSupportedFileType(mimeType) {
  const supportedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png'
  ];
  
  return supportedTypes.includes(mimeType);
}

/**
 * 要約から件名を抽出する
 * @param {string} summary AI生成の要約文
 * @return {string} 抽出された件名
 */
function extractTitleFromSummary(summary) {
  try {
    // 改行で分割して各行をチェック
    const lines = summary.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // 空行をスキップ
      if (!trimmed) continue;
      
      // マークダウン記号やセクション名をスキップ
      if (trimmed.startsWith('#') || 
          trimmed.startsWith('【') || 
          trimmed.includes('要約') || 
          trimmed.includes('ToDo') || 
          trimmed.includes('持ち物') || 
          trimmed.includes('イベント')) {
        continue;
      }
      
      // 最初の有効な行を件名として使用
      if (trimmed.length > 0) {
        Logger.log('抽出された件名: ' + trimmed);
        return trimmed;
      }
    }
    
    // 件名が見つからない場合はデフォルト
    Logger.log('件名が抽出できませんでした。デフォルトを使用します。');
    return 'お知らせ';
    
  } catch (error) {
    Logger.log('件名抽出エラー: ' + error.toString());
    return 'お知らせ';
  }
}