/**
 * 件名抽出のテスト用関数
 */

function testTitleExtraction() {
  console.log("=== 件名抽出テスト ===");
  
  // テスト用の要約文（現在の出力形式）
  const testSummary1 = `## ○○保育園　5月のおたより

【要約】
- 5月のイベント予定があります
`;

  const testSummary2 = `○○保育園　6月のお知らせ

【要約】  
- 6月の行事について
`;

  const testSummary3 = `
○○保育園　7月園だより

【要約】
- 夏祭りの開催
`;

  console.log("テスト1（##付き）:");
  console.log("入力:", testSummary1.split('\n')[0]);
  console.log("結果:", extractTitleFromSummary(testSummary1));
  
  console.log("\nテスト2（記号なし）:");
  console.log("入力:", testSummary2.split('\n')[0]);
  console.log("結果:", extractTitleFromSummary(testSummary2));
  
  console.log("\nテスト3（改行あり）:");
  console.log("入力:", testSummary3.split('\n')[0]);
  console.log("結果:", extractTitleFromSummary(testSummary3));
}