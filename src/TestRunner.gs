/**
 * テスト実行用の関数群
 */

/**
 * 全てのテストを実行する
 */
function runAllTests() {
  console.log("=== 全テスト実行開始 ===");
  
  const testResults = {
    configLoading: false,
    promptGeneration: false,
    taskExtraction: false,
    totalTests: 3,
    passedTests: 0
  };
  
  // テスト1: 設定情報読み込み
  try {
    console.log("\n--- テスト1: 設定情報読み込み ---");
    testResults.configLoading = testConfigLoading();
    if (testResults.configLoading) testResults.passedTests++;
  } catch (error) {
    console.log("❌ テスト1でエラー:", error.toString());
  }
  
  // テスト2: プロンプト生成
  try {
    console.log("\n--- テスト2: プロンプト生成 ---");
    testResults.promptGeneration = testPromptGeneration();
    if (testResults.promptGeneration) testResults.passedTests++;
  } catch (error) {
    console.log("❌ テスト2でエラー:", error.toString());
  }
  
  // テスト3: タスク抽出
  try {
    console.log("\n--- テスト3: タスク抽出 ---");
    testResults.taskExtraction = testTaskExtractionLogic();
    if (testResults.taskExtraction) testResults.passedTests++;
  } catch (error) {
    console.log("❌ テスト3でエラー:", error.toString());
  }
  
  // 結果サマリー
  console.log("\n=== テスト結果サマリー ===");
  console.log(`合格: ${testResults.passedTests}/${testResults.totalTests}`);
  console.log(`成功率: ${Math.round((testResults.passedTests / testResults.totalTests) * 100)}%`);
  
  if (testResults.passedTests === testResults.totalTests) {
    console.log("🎉 全てのテストに合格しました！");
  } else {
    console.log("⚠️ 一部のテストが失敗しました。詳細を確認してください。");
  }
  
  return testResults;
}

/**
 * テスト1: 設定情報の読み込み
 */
function testConfigLoading() {
  try {
    console.log("設定情報を読み込んでいます...");
    
    const children = getChildrenInfo();
    const institutions = getInstitutionsInfo();
    
    console.log("子供情報:", JSON.stringify(children, null, 2));
    console.log("施設情報:", JSON.stringify(institutions, null, 2));
    
    // 基本的な検証
    if (!children || children.length === 0) {
      console.log("❌ 子供情報が設定されていません");
      return false;
    }
    
    if (!institutions || institutions.length === 0) {
      console.log("❌ 施設情報が設定されていません");
      return false;
    }
    
    // 必須フィールドの検証
    const child = children[0];
    if (!child.name || !child.nameKana || !child.birthDate) {
      console.log("❌ 子供情報に必須フィールドが不足しています");
      return false;
    }
    
    const institution = institutions[0];
    if (!institution.name || !institution.type) {
      console.log("❌ 施設情報に必須フィールドが不足しています");
      return false;
    }
    
    console.log("✅ 設定情報の読み込み成功");
    return true;
    
  } catch (error) {
    console.log("❌ 設定情報読み込みエラー:", error.toString());
    return false;
  }
}

/**
 * テスト2: プロンプト生成
 */
function testPromptGeneration() {
  try {
    console.log("プロンプトを生成しています...");
    
    const children = getChildrenInfo();
    const institutions = getInstitutionsInfo();
    const prompt = generatePrompt(children, institutions);
    
    console.log("生成されたプロンプト（最初の500文字）:");
    console.log(prompt.substring(0, 500) + "...");
    
    // プロンプトの内容検証
    if (!prompt.includes(children[0].name)) {
      console.log("❌ プロンプトに子供の名前が含まれていません");
      return false;
    }
    
    if (!prompt.includes(institutions[0].name)) {
      console.log("❌ プロンプトに施設名が含まれていません");
      return false;
    }
    
    if (!prompt.includes("主とする指示")) {
      console.log("❌ プロンプトの基本構造が正しくありません");
      return false;
    }
    
    console.log("✅ プロンプト生成成功");
    return true;
    
  } catch (error) {
    console.log("❌ プロンプト生成エラー:", error.toString());
    return false;
  }
}

/**
 * テスト3: タスク抽出ロジック
 */
function testTaskExtractionLogic() {
  try {
    console.log("タスク抽出ロジックをテストしています...");
    
    const children = getChildrenInfo();
    const testSummary = createTestSummary(children[0].name);
    
    console.log("テスト用要約文:");
    console.log(testSummary);
    
    const tasks = extractTasksFromSummary(testSummary, children);
    
    console.log("抽出されたタスク:");
    tasks.forEach((task, index) => {
      console.log(`タスク${index + 1}:`, JSON.stringify(task, null, 2));
    });
    
    // タスク抽出の検証
    if (tasks.length === 0) {
      console.log("❌ タスクが抽出されませんでした");
      return false;
    }
    
    // ToDoタスクの検証
    const todoTasks = tasks.filter(task => task.type === 'todo');
    if (todoTasks.length === 0) {
      console.log("❌ ToDoタスクが抽出されませんでした");
      return false;
    }
    
    // 持ち物タスクの検証
    const itemTasks = tasks.filter(task => task.type === 'items');
    if (itemTasks.length === 0) {
      console.log("❌ 持ち物タスクが抽出されませんでした");
      return false;
    }
    
    // タスクタイトルの検証
    const firstTask = tasks[0];
    if (!firstTask.title || !firstTask.notes) {
      console.log("❌ タスクの必須フィールドが不足しています");
      return false;
    }
    
    console.log("✅ タスク抽出ロジック成功");
    return true;
    
  } catch (error) {
    console.log("❌ タスク抽出エラー:", error.toString());
    return false;
  }
}

/**
 * テスト用の要約文を生成する
 */
function createTestSummary(childName) {
  return `
○○保育園　5月のおたより

【要約】
- 5月のイベント予定：こどもの日の会（5月5日）、親子遠足（5月15日）
- らいおん組は遠足の際にお弁当とレジャーシートが必要
- 全体での避難訓練を5月20日に実施

【ToDo】
- ${childName}：遠足の参加確認書を5月10日までに提出
- ${childName}：健康チェック表の記入

【持ち物】
- ${childName}：お弁当、レジャーシート（5月15日遠足用）
- ${childName}：着替え一式（5月20日まで）

【イベント】
- こどもの日の会：5月5日、全園児対象
- 親子遠足：5月15日、らいおん組
`;
}

/**
 * 個別テストの実行用関数
 */
function testConfigOnly() {
  return testConfigLoading();
}

function testPromptOnly() {
  return testPromptGeneration();
}

function testTaskExtractionOnly() {
  return testTaskExtractionLogic();
}

/**
 * 設定サンプルの表示（セットアップ用）
 */
function showConfigSamples() {
  console.log("=== 設定サンプル ===");
  showSampleConfig();
}

/**
 * タスクリスト一覧の表示（セットアップ用）
 */
function showTaskLists() {
  console.log("=== タスクリスト一覧 ===");
  listTaskLists();
}