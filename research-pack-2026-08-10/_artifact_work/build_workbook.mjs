import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const packDir = path.resolve("..");
const analysisDir = path.join(packDir, "_analysis");
const previewDir = path.join(packDir, "_artifact_work", "previews");
await fs.mkdir(previewDir, { recursive: true });

const readJson = async (name) => JSON.parse(await fs.readFile(path.join(analysisDir, name), "utf8"));
const siteDaily = await readJson("sitewide_chart.json");
const siteQueries = await readJson("sitewide_queries.json");
const sitePages = await readJson("sitewide_pages.json");
const countries = await readJson("sitewide_countries.json");
const devices = await readJson("sitewide_devices.json");
const appearance = await readJson("sitewide_search_appearance.json");
const winners = await readJson("winner_summaries.json");
const winnerQueries = await readJson("winner_queries.json");
const winnerDaily = await readJson("winner_daily.json");
const queryMarkers = await readJson("winner_query_markers.json");
const seoPages = await readJson("site_pages.json");
const registry = await readJson("content_registry.json");

const wb = Workbook.create();
wb.comments.setSelf({ displayName: "Ievgenii Iablonsky" });
const sheetNames = ["Dashboard","Winner Summary","Winner Queries","Query Markers","Site Pages","Site Queries","Site Daily","Winner Daily","Geo & Device","SEO Inventory","Content Registry"];
for (const name of sheetNames) wb.worksheets.add(name);

const colors = {
  navy: "#17324D",
  blue: "#2E6F9E",
  teal: "#278B82",
  gold: "#D39A33",
  red: "#B6574E",
  paleBlue: "#EAF2F8",
  paleTeal: "#E8F4F1",
  paleGold: "#FBF4E4",
  paleRed: "#F8EDEC",
  gray: "#6B7280",
  paleGray: "#F4F6F8",
  white: "#FFFFFF",
  border: "#CBD5E1",
};

const letters = (n) => {
  let s = "";
  for (let x = n; x > 0; x = Math.floor((x - 1) / 26)) s = String.fromCharCode(65 + ((x - 1) % 26)) + s;
  return s;
};

function baseSheet(name, title, note, headers, rows, widths = {}) {
  const sh = wb.worksheets.getItem(name);
  sh.showGridLines = false;
  const lastCol = letters(headers.length);
  sh.getRange(`A1:${lastCol}1`).merge();
  sh.getRange("A1").values = [[title]];
  sh.getRange(`A2:${lastCol}2`).merge();
  sh.getRange("A2").values = [[note]];
  sh.getRange(`A1:${lastCol}1`).format = {
    fill: colors.navy,
    font: { bold: true, color: colors.white, size: 16 },
    verticalAlignment: "center",
  };
  sh.getRange(`A2:${lastCol}2`).format = {
    fill: colors.paleBlue,
    font: { color: colors.navy, italic: true, size: 9 },
    wrapText: true,
    verticalAlignment: "center",
  };
  sh.getRange(`A3:${lastCol}3`).values = [headers];
  sh.getRange(`A3:${lastCol}3`).format = {
    fill: colors.blue,
    font: { bold: true, color: colors.white },
    wrapText: true,
    verticalAlignment: "center",
    borders: { preset: "outside", style: "thin", color: colors.border },
  };
  if (rows.length) {
    sh.getRange(`A4:${lastCol}${rows.length + 3}`).values = rows;
    sh.getRange(`A4:${lastCol}${rows.length + 3}`).format = {
      font: { color: "#17202A", size: 9 },
      verticalAlignment: "top",
      borders: { insideHorizontal: { style: "thin", color: "#E5E7EB" } },
    };
  }
  sh.getRange(`A1:${lastCol}1`).format.rowHeight = 27;
  sh.getRange(`A2:${lastCol}2`).format.rowHeight = 34;
  sh.getRange(`A3:${lastCol}3`).format.rowHeight = 30;
  sh.freezePanes.freezeRows(3);
  for (let i = 1; i <= headers.length; i++) {
    sh.getRange(`${letters(i)}:${letters(i)}`).format.columnWidth = widths[i] || 14;
  }
  return sh;
}

// Dashboard
const dash = wb.worksheets.getItem("Dashboard");
dash.showGridLines = false;
dash.getRange("A1:H1").merge();
dash.getRange("A1").values = [["You Owe Me — Search & Authority Evidence Pack"]];
dash.getRange("A2:H2").merge();
dash.getRange("A2").values = [["Google Search Console Web search, 2026-05-08 to 2026-08-07. Query data is privacy-limited; page-filtered queries do not reconcile to page totals."]];
dash.getRange("A1:H1").format = { fill: colors.navy, font: { bold: true, color: colors.white, size: 18 }, verticalAlignment: "center" };
dash.getRange("A2:H2").format = { fill: colors.paleBlue, font: { italic: true, color: colors.navy, size: 9 }, wrapText: true };
dash.getRange("A4:B4").merge(); dash.getRange("C4:D4").merge(); dash.getRange("E4:F4").merge(); dash.getRange("G4:H4").merge();
dash.getRange("A4").values = [["Total clicks"]]; dash.getRange("C4").values = [["Total impressions"]]; dash.getRange("E4").values = [["CTR"]]; dash.getRange("G4").values = [["Avg position"]];
dash.getRange("A5:B6").merge(); dash.getRange("C5:D6").merge(); dash.getRange("E5:F6").merge(); dash.getRange("G5:H6").merge();
dash.getRange("A5").formulas = [["=SUM('Site Daily'!B4:B95)"]];
dash.getRange("C5").formulas = [["=SUM('Site Daily'!C4:C95)"]];
dash.getRange("E5").formulas = [["=A5/C5"]];
dash.getRange("G5").formulas = [["=SUMPRODUCT('Site Daily'!E4:E95,'Site Daily'!C4:C95)/SUM('Site Daily'!C4:C95)"]];
dash.getRange("A4:H4").format = { fill: colors.blue, font: { bold: true, color: colors.white }, horizontalAlignment: "center" };
dash.getRange("A5:H6").format = { fill: colors.paleBlue, font: { bold: true, color: colors.navy, size: 18 }, horizontalAlignment: "center", verticalAlignment: "center", borders: { preset: "outside", style: "thin", color: colors.border } };
dash.getRange("A5:D6").format.numberFormat = "#,##0";
dash.getRange("E5:F6").format.numberFormat = "0.00%";
dash.getRange("G5:H6").format.numberFormat = "0.00";
dash.getRange("A8:H8").merge(); dash.getRange("A8").values = [["Interpretation guardrails"]];
dash.getRange("A8:H8").format = { fill: colors.gold, font: { bold: true, color: colors.white } };
dash.getRange("A9:H13").merge();
dash.getRange("A9").values = [["• Do not explain performance by page type alone.\n• Compare winners with similar-format non-winners.\n• Treat impression leaders, CTR leaders, established click winners, and emerging pages as different success classes.\n• Query exports are partial; missing query rows are not missing demand.\n• Search visibility is not product conversion. App Store/analytics data is still required."]];
dash.getRange("A9:H13").format = { fill: colors.paleGold, wrapText: true, verticalAlignment: "top", font: { size: 10, color: "#473615" }, borders: { preset: "outside", style: "thin", color: colors.border } };
dash.getRange("A15:H15").merge(); dash.getRange("A15").values = [["Workbook map"]];
dash.getRange("A15:H15").format = { fill: colors.teal, font: { bold: true, color: colors.white } };
dash.getRange("A16:H24").values = [
  ["Winner Summary", "13-page cohort with growth and query-coverage diagnostics", null, null, null, null, null, null],
  ["Winner Queries", "All 899 page-filtered query rows", null, null, null, null, null, null],
  ["Query Markers", "Overlapping heuristic language categories", null, null, null, null, null, null],
  ["Site Pages", "All 80 Search Console landing-page rows", null, null, null, null, null, null],
  ["Site Queries", "Top 1,000 property-level queries", null, null, null, null, null, null],
  ["Site Daily", "92 daily rows", null, null, null, null, null, null],
  ["Winner Daily", "Daily rows for all cohort pages", null, null, null, null, null, null],
  ["Geo & Device", "Countries, devices, and search appearance", null, null, null, null, null, null],
  ["SEO Inventory", "Local source metadata, schema, links, interaction, and registry", null, null, null, null, null, null],
];
dash.getRange("A16:H24").format = { wrapText: true, borders: { insideHorizontal: { style: "thin", color: colors.border } } };
dash.getRange("A:A").format.columnWidth = 24; dash.getRange("B:B").format.columnWidth = 58; dash.getRange("C:H").format.columnWidth = 8;
dash.freezePanes.freezeRows(2);

// Winner Summary
const winnerHeaders = ["Slug","Page URL","Clicks","Impressions","CTR","Position","Selection reasons","Visible query rows","Visible clicks","Visible impressions","Visible click coverage","Visible impression coverage","Top-5 visible impression share","Last 28d clicks","Prior 28d clicks","Click growth","Last 28d impressions","Prior 28d impressions","Impression growth","Source export"];
const winnerRows = winners.map(w => [w.slug,w.page_url,w.clicks,w.impressions,w.ctr,w.position,w.selection_reasons,w.visible_query_rows,w.visible_clicks,w.visible_impressions,null,null,w.top5_impression_share,w.last_28d_clicks,w.previous_28d_clicks,null,w.last_28d_impressions,w.previous_28d_impressions,null,w.source_export]);
const winSh = baseSheet("Winner Summary", "Winner & comparison cohort", "Mixed cohort: established click leaders, impression leaders, meaningful-sample CTR leaders, strong-rank/low-CTR pages, and emerging comparisons.", winnerHeaders, winnerRows, {1:28,2:58,7:34,20:46});
for (let r=4;r<=winnerRows.length+3;r++) {
  winSh.getRange(`K${r}`).formulas = [[`=IFERROR(I${r}/C${r},0)`]];
  winSh.getRange(`L${r}`).formulas = [[`=IFERROR(J${r}/D${r},0)`]];
  winSh.getRange(`P${r}`).formulas = [[`=IFERROR(N${r}/O${r}-1,0)`]];
  winSh.getRange(`S${r}`).formulas = [[`=IFERROR(Q${r}/R${r}-1,0)`]];
}
winSh.getRange(`E4:E${winnerRows.length+3}`).format.numberFormat = "0.00%";
winSh.getRange(`K4:M${winnerRows.length+3}`).format.numberFormat = "0.0%";
winSh.getRange(`P4:P${winnerRows.length+3}`).format.numberFormat = "0.0%";
winSh.getRange(`S4:S${winnerRows.length+3}`).format.numberFormat = "0.0%";
winSh.getRange(`P4:P${winnerRows.length+3}`).conditionalFormats.add("colorScale", { colors:[colors.paleRed,colors.paleGold,colors.paleTeal], thresholds:["min","50%","max"] });
winSh.getRange(`S4:S${winnerRows.length+3}`).conditionalFormats.add("colorScale", { colors:[colors.paleRed,colors.paleGold,colors.paleTeal], thresholds:["min","50%","max"] });

const wqHeaders = ["Page slug","Page URL","Query rank by clicks","Query","Clicks","Impressions","CTR","Position"];
const wqRows = winnerQueries.map(x=>[x.page_slug,x.page_url,x.query_rank_by_clicks,x.query,x.clicks,x.impressions,x.ctr,x.position]);
const wqSh = baseSheet("Winner Queries", "Page-filtered Search Console queries", "All visible query rows for the 13-page cohort. Privacy suppression is substantial; do not reconcile these rows to page totals.", wqHeaders, wqRows, {1:28,2:56,3:14,4:66});
wqSh.getRange(`G4:G${wqRows.length+3}`).format.numberFormat = "0.00%";
wqSh.getRange(`H4:H${wqRows.length+3}`).format.numberFormat = "0.00";

const qmHeaders=["Page slug","Page URL","Language marker","Query rows","Clicks","Impressions","Visible impression share","Visible click share"];
const qmRows=queryMarkers.map(x=>[x.page_slug,x.page_url,x.marker,x.query_rows,x.clicks,x.impressions,x.share_visible_impressions,x.share_visible_clicks]);
const qmSh=baseSheet("Query Markers","Heuristic query-language markers","Markers overlap and are not a partition. Use them to locate language patterns, then inspect actual query rows.",qmHeaders,qmRows,{1:28,2:56,3:28});
qmSh.getRange(`G4:H${qmRows.length+3}`).format.numberFormat="0.0%";

const spHeaders=["Page URL","Clicks","Impressions","CTR","Position","Clicks at 1% CTR (scenario)","Clicks at 2% CTR (scenario)"];
const spRows=sitePages.map(x=>[x["Top pages"],x.Clicks,x.Impressions,x.CTR,x.Position,null,null]);
const spSh=baseSheet("Site Pages","All Search Console landing pages","Page rows are source evidence, not additive property totals. Scenario columns are arithmetic illustrations, not forecasts.",spHeaders,spRows,{1:70});
for(let r=4;r<=spRows.length+3;r++){spSh.getRange(`F${r}`).formulas=[[`=C${r}*1%`]];spSh.getRange(`G${r}`).formulas=[[`=C${r}*2%`]];}
spSh.getRange(`D4:D${spRows.length+3}`).format.numberFormat="0.00%"; spSh.getRange(`E4:E${spRows.length+3}`).format.numberFormat="0.00"; spSh.getRange(`F4:G${spRows.length+3}`).format.numberFormat="0.0";

const sqHeaders=["Query","Clicks","Impressions","CTR","Position"];
const sqRows=siteQueries.map(x=>[x["Top queries"],x.Clicks,x.Impressions,x.CTR,x.Position]);
const sqSh=baseSheet("Site Queries","Top 1,000 property-level queries","Property-level queries cannot be reliably joined to a page. Use page-filtered Winner Queries for page/query relationships.",sqHeaders,sqRows,{1:82});
sqSh.getRange(`D4:D${sqRows.length+3}`).format.numberFormat="0.00%"; sqSh.getRange(`E4:E${sqRows.length+3}`).format.numberFormat="0.00";

const sdHeaders=["Date","Clicks","Impressions","CTR","Position","Chart date label"];
const sdRows=siteDaily.map(x=>[new Date(x.Date+"T00:00:00Z"),x.Clicks,x.Impressions,x.CTR,x.Position,null]);
const sdSh=baseSheet("Site Daily","Daily sitewide performance","Source: Search Console Chart sheet for 2026-05-08 through 2026-08-07.",sdHeaders,sdRows,{1:16});
sdSh.getRange(`A4:A${sdRows.length+3}`).format.numberFormat="yyyy-mm-dd"; sdSh.getRange(`D4:D${sdRows.length+3}`).format.numberFormat="0.00%"; sdSh.getRange(`E4:E${sdRows.length+3}`).format.numberFormat="0.00";
for(let r=4;r<=sdRows.length+3;r++) sdSh.getRange(`F${r}`).formulas=[[`=TEXT(A${r},"m/d")`]];

const wdHeaders=["Page slug","Page URL","Date","Clicks","Impressions","CTR","Position"];
const wdRows=winnerDaily.map(x=>[x.page_slug,x.page_url,new Date(x.Date+"T00:00:00Z"),x.Clicks,x.Impressions,x.CTR,x.Position]);
const wdSh=baseSheet("Winner Daily","Daily performance by cohort page","Use the date rows for trend shape. Percentage growth is volatile for small pages.",wdHeaders,wdRows,{1:28,2:56,3:16});
wdSh.getRange(`C4:C${wdRows.length+3}`).format.numberFormat="yyyy-mm-dd"; wdSh.getRange(`F4:F${wdRows.length+3}`).format.numberFormat="0.00%"; wdSh.getRange(`G4:G${wdRows.length+3}`).format.numberFormat="0.00";

const geoRows=[];
for(const x of countries)geoRows.push(["Country",x.Country,x.Clicks,x.Impressions,x.CTR,x.Position]);
for(const x of devices)geoRows.push(["Device",x.Device,x.Clicks,x.Impressions,x.CTR,x.Position]);
for(const x of appearance)geoRows.push(["Search appearance",x["Search Appearance"],x.Clicks,x.Impressions,x.CTR,x.Position]);
const geoSh=baseSheet("Geo & Device","Countries, devices, and search appearance","Use this sheet for audience/device context. Country rows are ordered by clicks in the source export.",["Dimension","Value","Clicks","Impressions","CTR","Position"],geoRows,{1:20,2:34});
geoSh.getRange(`E4:E${geoRows.length+3}`).format.numberFormat="0.00%"; geoSh.getRange(`F4:F${geoRows.length+3}`).format.numberFormat="0.00";

const seoHeaders=["URL","Route","Title","Meta description","H1","H2 count","Main words","Schema types","Internal inlinks","Internal outlinks","Forms","Inputs","Buttons","Page type","Cluster","Audience","Problem solved","Use when","Tags","Canonical","Robots"];
const seoRows=seoPages.map(p=>[p.url,p.route,p.title,p.meta_description,(p.h1||[]).join(" | "),(p.h2||[]).length,p.word_count_main,(p.schema_types||[]).join(", "),p.internal_inlink_count,p.internal_outlink_count,p.forms,p.inputs,p.buttons,p.registry?.pageType||"",p.registry?.cluster||"",p.registry?.primaryAudience||"",p.registry?.problemSolved||"",p.registry?.useWhen||"",(p.registry?.tags||[]).join(", "),p.canonical,p.robots||"default/indexable"]);
const seoSh=baseSheet("SEO Inventory","Local-source SEO and content inventory","Snapshot from repository source on 2026-08-10. These fields include information a browser-only model may miss or not compare consistently.",seoHeaders,seoRows,{1:58,2:34,3:52,4:72,5:52,8:42,16:58,17:68,18:68,19:52,20:58});
seoSh.getRange(`A4:U${seoRows.length+3}`).format.wrapText=true;

const regHeaders=["URL","Title","Page type","Cluster","Primary audience","Problem solved","Use when","Parent","Related pages","Related tools","Related solutions","App Store CPP","Tags","Status","Priority","Updated","Primary CTA","Next step"];
const regRows=registry.map(r=>[r.url,r.title,r.pageType,r.cluster,r.primaryAudience,r.problemSolved,r.useWhen,r.parent,(r.relatedPages||[]).join(", "),(r.relatedTools||[]).join(", "),(r.relatedSolutions||[]).join(", "),r.appStoreCpp,(r.tags||[]).join(", "),r.status,r.priority,r.updated,r.primaryCta,r.nextStep]);
const regSh=baseSheet("Content Registry","Strategic content registry","Internal map for page jobs, audiences, clusters, routing, CPPs, and overlap analysis.",regHeaders,regRows,{1:40,2:52,5:58,6:68,7:68,9:52,10:52,11:52,13:52,17:34,18:50});
regSh.getRange(`A4:R${regRows.length+3}`).format.wrapText=true;

// Add native charts directly from source sheets.
const trend = dash.charts.add("line", {chartType:"line",title:"Search impressions by day",hasLegend:false});
const trendSeries=trend.series.add("Impressions");
trendSeries.categoryFormula=`'Site Daily'!$F$4:$F$${sdRows.length+3}`;
trendSeries.formula=`'Site Daily'!$C$4:$C$${sdRows.length+3}`;
trendSeries.fill=colors.blue;
trend.title="Search impressions by day"; trend.hasLegend=false; trend.xAxis={axisType:"textAxis",textStyle:{fontSize:8}}; trend.yAxis={numberFormatCode:"#,##0"}; trend.setPosition("J2","Q13");
const rank = dash.charts.add("bar", {chartType:"bar",title:"Cohort pages by clicks",hasLegend:false});
const rankSeries=rank.series.add("Clicks");
rankSeries.categoryFormula="'Winner Summary'!$A$4:$A$13";
rankSeries.formula="'Winner Summary'!$C$4:$C$13";
rankSeries.fill=colors.teal;
rank.title="Cohort pages by clicks"; rank.hasLegend=false; rank.xAxis={axisType:"textAxis",textStyle:{fontSize:8}}; rank.yAxis={numberFormatCode:"#,##0"}; rank.setPosition("J15","Q30");

// Tables and consistent filters.
const tableDefs=[
  [winSh,"A3:T16","WinnerSummaryTable"],[wqSh,`A3:H${wqRows.length+3}`,"WinnerQueriesTable"],[qmSh,`A3:H${qmRows.length+3}`,"QueryMarkersTable"],
  [spSh,`A3:G${spRows.length+3}`,"SitePagesTable"],[sqSh,`A3:E${sqRows.length+3}`,"SiteQueriesTable"],[sdSh,`A3:F${sdRows.length+3}`,"SiteDailyTable"],
  [wdSh,`A3:G${wdRows.length+3}`,"WinnerDailyTable"],[geoSh,`A3:F${geoRows.length+3}`,"GeoDeviceTable"],[seoSh,`A3:U${seoRows.length+3}`,"SeoInventoryTable"],[regSh,`A3:R${regRows.length+3}`,"ContentRegistryTable"]
];
for(const [sh,range,name] of tableDefs){const t=sh.tables.add(range,true,name);t.style="TableStyleMedium2";t.showFilterButton=true;}

// Compact visual verification exports.
const previewSheets=["Dashboard","Winner Summary","Winner Queries","Query Markers","Site Pages","Site Queries","Site Daily","Winner Daily","Geo & Device","SEO Inventory","Content Registry"];
for(const name of previewSheets){
  const blob=await wb.render({sheetName:name,autoCrop:"all",scale:0.8,format:"png"});
  await fs.writeFile(path.join(previewDir,`${name.replaceAll(" ","_").replaceAll("&","and")}.png`),new Uint8Array(await blob.arrayBuffer()));
}

const inspect = await wb.inspect({kind:"table",range:"Dashboard!A1:H24",include:"values,formulas",tableMaxRows:24,tableMaxCols:8,maxChars:8000});
console.log(inspect.ndjson);
const errors=await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:300},summary:"final formula error scan"});
console.log(errors.ndjson);

const out=await SpreadsheetFile.exportXlsx(wb);
await out.save(path.join(packDir,"01_GSC_AND_SITE_EVIDENCE.xlsx"));
console.log(`Saved ${path.join(packDir,"01_GSC_AND_SITE_EVIDENCE.xlsx")}`);
