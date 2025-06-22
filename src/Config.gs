/**
 * 設定情報を取得・管理するヘルパー関数群
 */

/**
 * 子供の情報を取得する
 * @return {Array} 子供の情報の配列
 */
function getChildrenInfo() {
  const childrenData = PropertiesService.getScriptProperties().getProperty("childrenInfo");
  if (!childrenData) {
    throw new Error("子供の情報が設定されていません。セットアップ手順を確認してください。");
  }
  return JSON.parse(childrenData);
}

/**
 * 学校・施設の情報を取得する
 * @return {Array} 学校・施設の情報の配列
 */
function getInstitutionsInfo() {
  const institutionsData = PropertiesService.getScriptProperties().getProperty("institutionsInfo");
  if (!institutionsData) {
    throw new Error("学校・施設の情報が設定されていません。セットアップ手順を確認してください。");
  }
  return JSON.parse(institutionsData);
}

/**
 * プロンプトを動的に生成する
 * @param {Array} children 子供の情報
 * @param {Array} institutions 学校・施設の情報
 * @return {string} 生成されたプロンプト
 */
function generatePrompt(children, institutions) {
  let prompt = `
#指示
主とする指示の前に以下の前提となる指示を理解してください
## 前提指示１ 対象外ファイル
1ファイル5ページ以上のファイルは取り込み対象外とし、トークンを消費しないでください
## 前提指示2  対象外ファイル
PDF、JPEG、PNG以外のファイルは取り込み対象外とし、トークンを消費しないでください
## 前提指示3  ハルシネーション対策
ハルシネーションしないでください。主とする指示の判断において疑わしい場合、要約の中に判断がつかなかった箇所とその理由を必ず明示してください

## 前提知識1 私のこどもの情報
`;

  // 子供の情報を動的に追加
  children.forEach((child, index) => {
    prompt += `${index + 1}人目:${child.name}（${child.nameKana}）${child.gender} ${child.birthDate}生まれ\n`;
  });

  // 学校・施設の情報を動的に追加
  institutions.forEach((institution, index) => {
    prompt += `## 前提知識${index + 2} ${institution.name}の情報\n`;
    
    if (institution.type === 'school') {
      prompt += `私の子供は以下の${institution.schoolType}に通っています。\n`;
      prompt += `施設名：${institution.name}\n`;
      prompt += `所在地：${institution.address}\n`;
      
      if (institution.classes) {
        prompt += `クラス名：${institution.classes}\n`;
      }
      
      // 通学している子供の情報
      institution.students.forEach(student => {
        prompt += `${student.currentYear}現在：${student.name}（${student.class}）\n`;
      });
      
      if (institution.groupDefinitions) {
        prompt += `## ${institution.name}の組分け定義\n`;
        prompt += `${institution.groupDefinitions}\n`;
      }
    } else if (institution.type === 'activity') {
      prompt += `以下の習い事に通っている子供がいます。\n`;
      prompt += `習い事名：${institution.name}\n`;
      prompt += `所在地：${institution.address}\n`;
      
      institution.students.forEach(student => {
        prompt += `通っている人：${student.name}\n`;
        prompt += `レッスン日時：${student.schedule}\n`;
        if (student.notes) {
          prompt += `${student.notes}\n`;
        }
      });
    }
  });

  prompt += `
## 主とする指示
私の子供が通う学校や習い事からのお知らせやお便りの資料をPDFまたは画像として配置します。
内容をstep-by-stepで注意深く心をこめて分析し、私の子供に関係する部分について以下の対応を行ってください。
1.ドキュメントの発行元を判断する
  ドキュメントがどの学校・施設のものかを判断します。
2.ドキュメントの内容を要約する
 イベント名、場所、日時、持ち物、特定の対象クラスに関する情報がないか特に注意深く分析し
 以下のとおり要約すること。要約は500文字程度にすること。可能な限り箇条書き形式にすること。
 人間の目でみづらいので*の記号は使用しないこと。箇条書きの場合・や - を使用すること
 【要約】
 要約の内容を記述
 【ToDo】
 ドキュメントに記載がある場合のみ記述。誰のtodoか、内容を正確に記載
 【持ち物】
 ドキュメントに記載がある場合のみ記述。誰の持ち物か、内容を正確に記載
 【イベント】
 ドキュメントに記載がある場合のみ記述。誰のイベントか、内容を正確に記載
3.お知らせの件名を抽出する
 PDF・画像からドキュメントのタイトルとしてふさわしい件名を分析し、抽出する
 件名は文書の最初の行に記載し、##などの記号は一切使用しない
 件名の最初は指示1で判断したドキュメントの発行元の施設名を記載
 例：○○保育園　5月のおたより
 例：○○音楽教室　1月～3月レッスンスケジュール
4.ToDoや持ち物を抽出する
 学校・施設のドキュメントの場合で、私の子供の所属するクラスに関係するtodoや持ち物が記載されている場合は、
 5w1hを意識し、いつまでに何をする必要があるか、持ち物の場合はいつまでに何を持っていく必要があるか
 抽出してください
5.レッスンスケジュールを抽出する
 ドキュメントが習い事のものである場合、レッスンスケジュールが記載されている可能性があります。
 その場合はレッスンのある日、無い日を箇条書きで記載すること。
 学校のドキュメントの場合、この項番自体を出力しない。
 例）レッスンあり：12/20（土）,27（土）、・・・
 　　レッスンなし：2025/1/4（土）・・・
`;

  return prompt;
}

/**
 * サンプル設定データを表示する（初期設定用）
 */
function showSampleConfig() {
  const sampleChildren = [
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

  const sampleInstitutions = [
    {
      "name": "○○保育園",
      "type": "school",
      "schoolType": "保育園",
      "address": "〒000-0000 ○○県○○市○○区○○町1-1-1",
      "classes": "0歳児クラス=ひよこ組,1歳児クラス=うさぎ組,2歳児クラス=りす組,3歳児クラス=ぺんぎん組,4歳児クラス=ぱんだ組,5歳児クラス=らいおん組",
      "students": [
        {
          "name": "お子様の氏名",
          "class": "らいおん組",
          "currentYear": "2025年4月現在"
        },
        {
          "name": "お子様の氏名2",
          "class": "りす組",
          "currentYear": "2025年4月現在"
        }
      ],
      "groupDefinitions": "乳児組=ひよこ組,うさぎ組,りす組 幼児組=ぺんぎん組,ぱんだ組,らいおん組"
    },
    {
      "name": "○○音楽教室",
      "type": "activity",
      "address": "〒000-0000 ○○県○○市○○区○○町2-2-2",
      "students": [
        {
          "name": "お子様の氏名",
          "schedule": "毎週土曜日 16:30～17:00",
          "notes": "レッスンスケジュール：レッスンスケジュールのドキュメントに記載されたカレンダーに〇がついている日がレッスン日、無い日はレッスンがお休みの日です。"
        }
      ]
    }
  ];

  console.log("=== 子供の情報設定例 ===");
  console.log("スクリプトプロパティ key: childrenInfo");
  console.log("value:", JSON.stringify(sampleChildren, null, 2));
  
  console.log("\n=== 学校・施設の情報設定例 ===");
  console.log("スクリプトプロパティ key: institutionsInfo");
  console.log("value:", JSON.stringify(sampleInstitutions, null, 2));
}