// テスト用の設定サンプル表示
// この内容をGASのエディタで実行してください

function testShowSampleConfig() {
  console.log("=== 設定サンプルのテスト ===");
  
  // 子供の情報サンプル
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

  // 学校・施設の情報サンプル
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
  
  console.log("=== childrenInfo設定値 ===");
  console.log(JSON.stringify(sampleChildren, null, 2));
  
  console.log("\n=== institutionsInfo設定値 ===");
  console.log(JSON.stringify(sampleInstitutions, null, 2));
  
  return {
    children: sampleChildren,
    institutions: sampleInstitutions
  };
}

// プロンプト生成のテスト
function testGeneratePrompt() {
  console.log("=== プロンプト生成テスト ===");
  
  const testData = testShowSampleConfig();
  
  // Config.gsのgeneratePrompt関数をシミュレート
  let prompt = `
#指示
主とする指示の前に以下の前提となる指示を理解してください
## 前提指示１ 対象外ファイル
1ファイル5ページ以上のファイルは取り込み対象外とし、トークンを消費しないでください
## 前提指示2  対象外ファイル
pdfまたは画像以外のファイルは取り込み対象外とし、トークンを消費しないでください
## 前提指示3  ハルシネーション対策
ハルシネーションしないでください。主とする指示の判断において疑わしい場合、要約の中に判断がつかなかった箇所とその理由を必ず明示してください

## 前提知識1 私のこどもの情報
`;

  // 子供の情報を動的に追加
  testData.children.forEach((child, index) => {
    prompt += `${index + 1}人目:${child.name}（${child.nameKana}）${child.gender} ${child.birthDate}生まれ\n`;
  });

  // 学校・施設の情報を動的に追加
  testData.institutions.forEach((institution, index) => {
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
        prompt += `${student.currentYear}：${student.name}（${student.class}）\n`;
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

  console.log("=== 生成されたプロンプト ===");
  console.log(prompt);
  
  return prompt;
}