// タスク抽出ロジックのテスト用サンプル
// この内容をGASのエディタで実行してください

function testTaskExtraction() {
  console.log("=== タスク抽出テスト ===");
  
  // テスト用の要約文
  const testSummary = `
○○保育園　5月のおたより

【要約】
- 5月のイベント予定：こどもの日の会（5月5日）、親子遠足（5月15日）
- らいおん組は遠足の際にお弁当とレジャーシートが必要
- りす組は手作りこいのぼりを5月2日までに持参
- 全体での避難訓練を5月20日に実施

【ToDo】
- お子様の氏名：遠足の参加確認書を5月10日までに提出
- お子様の氏名2：手作りこいのぼりを5月2日までに完成

【持ち物】
- お子様の氏名：お弁当、レジャーシート（5月15日遠足用）
- お子様の氏名2：手作りこいのぼり（5月2日まで）

【イベント】
- こどもの日の会：5月5日、全園児対象
- 親子遠足：5月15日、らいおん組・りす組
`;

  // テスト用の子供情報
  const testChildren = [
    {
      "name": "お子様の氏名",
      "nameKana": "おこさまのしめい", 
      "gender": "男性",
      "birthDate": "2020年3月16日"
    },
    {
      "name": "お子様の氏名2",
      "nameKana": "おこさまのしめい2",
      "gender": "女性", 
      "birthDate": "2023年6月2日"
    }
  ];

  console.log("=== テスト用要約文 ===");
  console.log(testSummary);
  
  // TaskManager.gsのextractTasksFromSummaryをシミュレート
  const tasks = [];
  
  try {
    // 【ToDo】セクションを抽出
    const todoMatch = testSummary.match(/【ToDo】([\s\S]*?)(?=【|$)/);
    if (todoMatch) {
      const todoSection = todoMatch[1].trim();
      console.log("\n=== ToDoセクション ===");
      console.log(todoSection);
      
      const todoItems = todoSection.split('\n').filter(item => item.trim() !== '');
      console.log("\n=== ToDo項目 ===");
      todoItems.forEach((item, index) => {
        console.log(`${index + 1}: ${item}`);
        const task = parseTaskItemTest(item, testChildren, 'todo');
        if (task) tasks.push(task);
      });
    }
    
    // 【持ち物】セクションを抽出
    const itemsMatch = testSummary.match(/【持ち物】([\s\S]*?)(?=【|$)/);
    if (itemsMatch) {
      const itemsSection = itemsMatch[1].trim();
      console.log("\n=== 持ち物セクション ===");
      console.log(itemsSection);
      
      const itemsList = itemsSection.split('\n').filter(item => item.trim() !== '');
      console.log("\n=== 持ち物項目 ===");
      itemsList.forEach((item, index) => {
        console.log(`${index + 1}: ${item}`);
        const task = parseTaskItemTest(item, testChildren, 'items');
        if (task) tasks.push(task);
      });
    }
    
    console.log("\n=== 抽出されたタスク ===");
    tasks.forEach((task, index) => {
      console.log(`タスク${index + 1}:`, JSON.stringify(task, null, 2));
    });
    
    return tasks;
    
  } catch (error) {
    console.log('タスク抽出エラー: ' + error.toString());
    return [];
  }
}

// TaskManager.gsのparseTaskItemをシミュレート
function parseTaskItemTest(item, children, type) {
  try {
    // 空行や記号のみの行をスキップ
    if (!item.trim() || item.trim().match(/^[-・\s]*$/)) {
      return null;
    }
    
    // 子供の名前を検索
    let targetChild = null;
    children.forEach(child => {
      if (item.includes(child.name) || item.includes(child.nameKana)) {
        targetChild = child;
      }
    });
    
    // 期限を抽出（○月○日、○/○など）
    const dueDate = extractDueDateTest(item);
    
    // タスクのタイトルを生成
    const title = generateTaskTitleTest(item, type, targetChild);
    
    return {
      title: title,
      notes: item,
      targetChild: targetChild ? targetChild.name : '全員',
      dueDate: dueDate,
      type: type
    };
    
  } catch (error) {
    console.log('タスクアイテムパースエラー: ' + error.toString());
    return null;
  }
}

// 期限日抽出のテスト
function extractDueDateTest(text) {
  try {
    console.log(`期限日抽出テスト: "${text}"`);
    
    // ○月○日形式
    const monthDayMatch = text.match(/(\d{1,2})月(\d{1,2})日/);
    if (monthDayMatch) {
      const month = parseInt(monthDayMatch[1]);
      const day = parseInt(monthDayMatch[2]);
      const currentYear = new Date().getFullYear();
      const dueDate = new Date(currentYear, month - 1, day);
      console.log(`○月○日形式で検出: ${dueDate}`);
      return dueDate;
    }
    
    // ○/○形式
    const slashMatch = text.match(/(\d{1,2})\/(\d{1,2})/);
    if (slashMatch) {
      const month = parseInt(slashMatch[1]);
      const day = parseInt(slashMatch[2]);
      const currentYear = new Date().getFullYear();
      const dueDate = new Date(currentYear, month - 1, day);
      console.log(`○/○形式で検出: ${dueDate}`);
      return dueDate;
    }
    
    // 「まで」「までに」などの表現
    const untilMatch = text.match(/(\d{1,2}月\d{1,2}日)まで/);
    if (untilMatch) {
      const dueDate = extractDueDateTest(untilMatch[1]);
      console.log(`まで形式で検出: ${dueDate}`);
      return dueDate;
    }
    
    console.log('期限日を検出できませんでした');
    return null;
  } catch (error) {
    console.log('期限日抽出エラー: ' + error.toString());
    return null;
  }
}

// タスクタイトル生成のテスト
function generateTaskTitleTest(item, type, targetChild) {
  const prefix = type === 'todo' ? '[ToDo]' : '[持ち物]';
  const childPrefix = targetChild ? `[${targetChild.name}]` : '';
  
  // アイテムから不要な記号を除去してタイトルを生成
  let cleanItem = item.replace(/^[-・\s]+/, '').trim();
  
  // 長すぎる場合は切り詰める
  if (cleanItem.length > 50) {
    cleanItem = cleanItem.substring(0, 47) + '...';
  }
  
  const title = `${prefix}${childPrefix} ${cleanItem}`;
  console.log(`タイトル生成: "${title}"`);
  return title;
}