/**
 * タスク管理関連の関数群
 */

/**
 * 要約からタスクを抽出する
 * @param {string} summary AI生成の要約文
 * @param {Array} children 子供の情報
 * @return {Array} 抽出されたタスクの配列
 */
function extractTasksFromSummary(summary, children) {
  const tasks = [];
  
  try {
    // 【ToDo】セクションを抽出
    const todoMatch = summary.match(/【ToDo】([\s\S]*?)(?=【|$)/);
    if (todoMatch) {
      const todoSection = todoMatch[1].trim();
      const todoItems = todoSection.split('\n').filter(item => item.trim() !== '');
      
      todoItems.forEach(item => {
        const task = parseTaskItem(item, children, 'todo');
        if (task) tasks.push(task);
      });
    }
    
    // 【持ち物】セクションを抽出
    const itemsMatch = summary.match(/【持ち物】([\s\S]*?)(?=【|$)/);
    if (itemsMatch) {
      const itemsSection = itemsMatch[1].trim();
      const itemsList = itemsSection.split('\n').filter(item => item.trim() !== '');
      
      itemsList.forEach(item => {
        const task = parseTaskItem(item, children, 'items');
        if (task) tasks.push(task);
      });
    }
    
    Logger.log('抽出されたタスク数: ' + tasks.length);
    return tasks;
    
  } catch (error) {
    Logger.log('タスク抽出エラー: ' + error.toString());
    return [];
  }
}

/**
 * タスクアイテムをパースする
 * @param {string} item タスクアイテムのテキスト
 * @param {Array} children 子供の情報
 * @param {string} type タスクタイプ（todo/items）
 * @return {Object|null} パースされたタスク情報
 */
function parseTaskItem(item, children, type) {
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
    const dueDate = extractDueDate(item);
    
    // タスクのタイトルを生成
    const title = generateTaskTitle(item, type, targetChild);
    
    return {
      title: title,
      notes: item,
      targetChild: targetChild ? targetChild.name : '全員',
      dueDate: dueDate,
      type: type
    };
    
  } catch (error) {
    Logger.log('タスクアイテムパースエラー: ' + error.toString());
    return null;
  }
}

/**
 * テキストから期限日を抽出する
 * @param {string} text テキスト
 * @return {Date|null} 抽出された期限日
 */
function extractDueDate(text) {
  try {
    // ○月○日形式
    const monthDayMatch = text.match(/(\d{1,2})月(\d{1,2})日/);
    if (monthDayMatch) {
      const month = parseInt(monthDayMatch[1]);
      const day = parseInt(monthDayMatch[2]);
      const currentYear = new Date().getFullYear();
      return new Date(currentYear, month - 1, day);
    }
    
    // ○/○形式
    const slashMatch = text.match(/(\d{1,2})\/(\d{1,2})/);
    if (slashMatch) {
      const month = parseInt(slashMatch[1]);
      const day = parseInt(slashMatch[2]);
      const currentYear = new Date().getFullYear();
      return new Date(currentYear, month - 1, day);
    }
    
    // 「まで」「までに」などの表現
    const untilMatch = text.match(/(\d{1,2}月\d{1,2}日)まで/);
    if (untilMatch) {
      return extractDueDate(untilMatch[1]);
    }
    
    return null;
  } catch (error) {
    Logger.log('期限日抽出エラー: ' + error.toString());
    return null;
  }
}

/**
 * タスクのタイトルを生成する
 * @param {string} item タスクアイテム
 * @param {string} type タスクタイプ
 * @param {Object} targetChild 対象の子供
 * @return {string} 生成されたタイトル
 */
function generateTaskTitle(item, type, targetChild) {
  const prefix = type === 'todo' ? '[ToDo]' : '[持ち物]';
  const childPrefix = targetChild ? `[${targetChild.name}]` : '';
  
  // アイテムから不要な記号を除去してタイトルを生成
  let cleanItem = item.replace(/^[-・\s]+/, '').trim();
  
  // 長すぎる場合は切り詰める
  if (cleanItem.length > 50) {
    cleanItem = cleanItem.substring(0, 47) + '...';
  }
  
  return `${prefix}${childPrefix} ${cleanItem}`;
}

/**
 * GoogleタスクにタスクListを登録する
 * @param {Array} tasks タスクの配列
 */
function registerTasksToGoogle(tasks) {
  try {
    const taskListId = getDefaultTaskListId();
    
    tasks.forEach(task => {
      const googleTask = {
        'title': task.title,
        'notes': task.notes
      };
      
      // 期限日が設定されている場合は追加
      if (task.dueDate) {
        googleTask.due = task.dueDate.toISOString();
      }
      
      // 重複チェック
      if (!isDuplicateTask(taskListId, task.title)) {
        Tasks.Tasks.insert(googleTask, taskListId);
        Logger.log('タスクを追加しました: ' + task.title);
      } else {
        Logger.log('重複タスクをスキップしました: ' + task.title);
      }
    });
    
  } catch (error) {
    Logger.log('Googleタスク登録エラー: ' + error.toString());
    throw error;
  }
}

/**
 * デフォルトのタスクリストIDを取得する
 * @return {string} タスクリストID
 */
function getDefaultTaskListId() {
  try {
    const taskListId = PropertiesService.getScriptProperties().getProperty("taskListId");
    
    if (taskListId) {
      return taskListId;
    }
    
    // 設定されていない場合は、デフォルトのタスクリストを取得
    const taskLists = Tasks.Tasklists.list();
    if (taskLists.items && taskLists.items.length > 0) {
      const defaultTaskListId = taskLists.items[0].id;
      Logger.log('デフォルトタスクリストIDを使用: ' + defaultTaskListId);
      return defaultTaskListId;
    }
    
    throw new Error('利用可能なタスクリストが見つかりません');
    
  } catch (error) {
    Logger.log('タスクリストID取得エラー: ' + error.toString());
    throw error;
  }
}

/**
 * 重複タスクかどうかをチェックする
 * @param {string} taskListId タスクリストID
 * @param {string} title タスクタイトル
 * @return {boolean} 重複している場合true
 */
function isDuplicateTask(taskListId, title) {
  try {
    const tasks = Tasks.Tasks.list(taskListId);
    
    if (tasks.items) {
      return tasks.items.some(task => task.title === title && task.status !== 'completed');
    }
    
    return false;
    
  } catch (error) {
    Logger.log('重複チェックエラー: ' + error.toString());
    return false;
  }
}

/**
 * 利用可能なタスクリストを一覧表示する（設定用）
 */
function listTaskLists() {
  try {
    const taskLists = Tasks.Tasklists.list();
    
    console.log('=== 利用可能なタスクリスト ===');
    if (taskLists.items) {
      taskLists.items.forEach(taskList => {
        console.log(`ID: ${taskList.id}`);
        console.log(`名前: ${taskList.title}`);
        console.log('---');
      });
    }
    
  } catch (error) {
    Logger.log('タスクリスト一覧取得エラー: ' + error.toString());
  }
}