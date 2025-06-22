/**
 * セットアップ用のヘルパー関数
 */

/**
 * 正確なスクリプトプロパティ値を表示する
 */
function showExactPropertyValues() {
  console.log("=== スクリプトプロパティ設定値（コピペ用）===");
  
  // 子供情報のサンプル
  const childrenSample = [
    {
      "name": "お子様の氏名", 
      "nameKana": "おこさまのしめい",
      "gender": "男性",
      "birthDate": "2020年3月16日"
    }
  ];
  
  // 施設情報のサンプル
  const institutionsSample = [
    {
      "name": "○○保育園",
      "type": "school", 
      "schoolType": "保育園",
      "address": "〒000-0000 ○○県○○市○○区○○町1-1-1",
      "students": [
        {
          "name": "お子様の氏名",
          "class": "らいおん組", 
          "currentYear": "2025年4月現在"
        }
      ]
    }
  ];
  
  console.log("childrenInfo の値（この行をそのままコピー）:");
  console.log(JSON.stringify(childrenSample));
  
  console.log("\ninstitutionsInfo の値（この行をそのままコピー）:");
  console.log(JSON.stringify(institutionsSample));
  
  console.log("\n=== 設定手順 ===");
  console.log("1. GASエディタ > プロジェクトの設定 > スクリプト プロパティ");
  console.log("2. 上記の値をそのままコピーして設定");
  console.log("3. 設定後、testCurrentSettings() を実行して確認");
}

/**
 * 現在の設定をテストする
 */
function testCurrentSettings() {
  console.log("=== 現在の設定確認 ===");
  
  try {
    // 生の値を取得
    const childrenRaw = PropertiesService.getScriptProperties().getProperty("childrenInfo");
    const institutionsRaw = PropertiesService.getScriptProperties().getProperty("institutionsInfo");
    
    console.log("childrenInfo（生データ）:");
    console.log(childrenRaw);
    console.log("\ninstitutionsInfo（生データ）:");
    console.log(institutionsRaw);
    
    // パース試行
    if (childrenRaw) {
      try {
        const children = JSON.parse(childrenRaw);
        console.log("✅ childrenInfo パース成功:", children);
      } catch (error) {
        console.log("❌ childrenInfo パースエラー:", error.toString());
        console.log("問題のある文字:", childrenRaw.substring(0, 50));
      }
    } else {
      console.log("❌ childrenInfo が設定されていません");
    }
    
    if (institutionsRaw) {
      try {
        const institutions = JSON.parse(institutionsRaw);
        console.log("✅ institutionsInfo パース成功:", institutions);
      } catch (error) {
        console.log("❌ institutionsInfo パースエラー:", error.toString());
        console.log("問題のある文字:", institutionsRaw.substring(0, 50));
      }
    } else {
      console.log("❌ institutionsInfo が設定されていません");
    }
    
  } catch (error) {
    console.log("❌ 設定確認エラー:", error.toString());
  }
}

/**
 * 設定をクリアする（リセット用）
 */
function clearProperties() {
  try {
    PropertiesService.getScriptProperties().deleteProperty("childrenInfo");
    PropertiesService.getScriptProperties().deleteProperty("institutionsInfo");
    console.log("✅ スクリプトプロパティをクリアしました");
  } catch (error) {
    console.log("❌ クリアエラー:", error.toString());
  }
}

/**
 * サンプル設定を自動で設定する（テスト用）
 */
function setSampleProperties() {
  try {
    const childrenSample = [
      {
        "name": "テスト太郎",
        "nameKana": "てすとたろう", 
        "gender": "男性",
        "birthDate": "2020年4月1日"
      }
    ];
    
    const institutionsSample = [
      {
        "name": "テスト保育園",
        "type": "school",
        "schoolType": "保育園", 
        "address": "〒000-0000 テスト県テスト市テスト区テスト町1-1-1",
        "students": [
          {
            "name": "テスト太郎",
            "class": "らいおん組",
            "currentYear": "2025年4月現在"
          }
        ]
      }
    ];
    
    PropertiesService.getScriptProperties().setProperties({
      'childrenInfo': JSON.stringify(childrenSample),
      'institutionsInfo': JSON.stringify(institutionsSample)
    });
    
    console.log("✅ サンプル設定を自動設定しました");
    console.log("testCurrentSettings() を実行して確認してください");
    
  } catch (error) {
    console.log("❌ 自動設定エラー:", error.toString());
  }
}