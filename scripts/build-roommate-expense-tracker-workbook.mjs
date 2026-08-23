import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

process.on("uncaughtException", (error) => {
  console.error("BUILDER_ERROR", error?.name, error?.message);
  console.error(error?.stack ?? error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("BUILDER_REJECTION", error?.name, error?.message);
  console.error(error?.stack ?? error);
  process.exit(1);
});

const outputPath = process.argv[2];
const previewDir = process.argv[3];

if (!outputPath) {
  throw new Error("Usage: node build-roommate-expense-tracker-workbook.mjs <output.xlsx> [preview-dir]");
}

const COLORS = {
  ink: "#18212B",
  body: "#344054",
  muted: "#667085",
  green: "#AFE67E",
  greenSoft: "#EAF7DF",
  blueSoft: "#DFEAF4",
  yellowSoft: "#FFF4C2",
  surface: "#FFFFFF",
  surfaceAlt: "#F8FAFC",
  line: "#D8E2E8",
  redSoft: "#FDECEC",
};

const amountFormat = '#,##0.00;[Red]-#,##0.00;0.00';
const dateFormat = "yyyy-mm-dd";
const roommateSlots = Array.from({ length: 6 }, (_, index) => index);

function col(index) {
  let value = index;
  let label = "";
  while (value > 0) {
    value -= 1;
    label = String.fromCharCode(65 + (value % 26)) + label;
    value = Math.floor(value / 26);
  }
  return label;
}

function setWidths(sheet, widths) {
  for (const [column, width] of Object.entries(widths)) {
    sheet.getRange(`${column}:${column}`).format.columnWidth = width;
  }
}

function mergeWrite(sheet, range, value, format = {}) {
  const target = sheet.getRange(range);
  target.merge();
  target.values = [[value]];
  target.format = format;
}

function titleBand(sheet, range, title, subtitleRange, subtitle) {
  mergeWrite(sheet, range, title, {
    fill: COLORS.green,
    font: { bold: true, color: COLORS.ink, size: 20 },
    verticalAlignment: "center",
    wrapText: true,
  });
  sheet.getRange(range).format.rowHeight = 34;
  mergeWrite(sheet, subtitleRange, subtitle, {
    fill: COLORS.surfaceAlt,
    font: { color: COLORS.body, size: 11 },
    verticalAlignment: "center",
    wrapText: true,
  });
  sheet.getRange(subtitleRange).format.rowHeight = 30;
}

function sectionBand(sheet, range, value) {
  mergeWrite(sheet, range, value, {
    fill: COLORS.blueSoft,
    font: { bold: true, color: COLORS.ink, size: 12 },
    verticalAlignment: "center",
  });
}

function styleHeader(range) {
  range.format = {
    fill: COLORS.green,
    font: { bold: true, color: COLORS.ink },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
    borders: { preset: "all", style: "thin", color: COLORS.line },
  };
  range.format.rowHeight = 34;
}

function styleDataArea(range) {
  range.format = {
    fill: COLORS.surface,
    font: { color: COLORS.body },
    verticalAlignment: "top",
    wrapText: true,
    borders: {
      insideHorizontal: { style: "thin", color: COLORS.line },
      bottom: { style: "thin", color: COLORS.line },
    },
  };
}

function addStatusFormatting(range) {
  range.conditionalFormats.add("containsText", {
    text: "Ready",
    format: { fill: COLORS.greenSoft, font: { bold: true, color: "#355428" } },
  });
  range.conditionalFormats.add("notContainsText", {
    text: "Ready",
    format: { fill: COLORS.yellowSoft, font: { color: COLORS.ink } },
  });
}

function quotedSheet(sheetName, address) {
  return `'${sheetName}'!${address}`;
}

const workbook = Workbook.create();
const start = workbook.worksheets.add("Start Here");
const setup = workbook.worksheets.add("Setup");
const expenses = workbook.worksheets.add("Expenses");
const repayments = workbook.worksheets.add("Repayments");
const summary = workbook.worksheets.add("Summary");
const example = workbook.worksheets.add("Example");
const settings = workbook.worksheets.add("Settings");

console.log("workbook: sheets created");

for (const sheet of [start, setup, expenses, repayments, summary, example, settings]) {
  sheet.showGridLines = false;
}

// Start Here
titleBand(
  start,
  "A1:H1",
  "Roommate Expense Tracker Spreadsheet",
  "A2:H2",
  "A reusable manual record for agreed roommate expenses, repayments, opening positions, and monthly settle-ups.",
);
sectionBand(start, "A4:H4", "Set up your copy");
const startSteps = [
  "Open Setup and enter two to six unique roommate names, one period, and one currency.",
  "Enter opening positions only when they come from a previously checked closing summary.",
  "Add each shared cost once on Expenses. Choose who paid, who was included, and equal or custom shares.",
  "Add money sent between roommates on Repayments. Do not edit the original expense to show a repayment.",
  "Open Summary and resolve any checks before using the suggested settle-up.",
];
start.getRange("A5:B9").values = startSteps.map((step, index) => [index + 1, step]);
start.getRange("A5:A9").format = {
  fill: COLORS.greenSoft,
  font: { bold: true, color: "#355428" },
  horizontalAlignment: "center",
  verticalAlignment: "center",
};
start.getRange("B5:H9").merge(true);
start.getRange("B5:H9").format = {
  fill: COLORS.surface,
  font: { color: COLORS.body },
  wrapText: true,
  verticalAlignment: "center",
  borders: { preset: "inside", style: "thin", color: COLORS.line },
};
start.getRange("A5:H9").format.rowHeight = 34;
sectionBand(start, "A11:H11", "What positive and negative mean");
mergeWrite(start, "A12:H13", "A positive position means the roommate should receive money. A negative position means the roommate owes money. All positions should add up to zero.", {
  fill: COLORS.surface,
  font: { color: COLORS.body },
  wrapText: true,
  verticalAlignment: "center",
});
sectionBand(start, "A15:H15", "Privacy");
mergeWrite(start, "A16:H17", "Information entered in this workbook stays in the file unless you choose to upload or share it elsewhere.", {
  fill: COLORS.surface,
  font: { color: COLORS.body },
  wrapText: true,
  verticalAlignment: "center",
});
sectionBand(start, "A19:H19", "Boundary");
mergeWrite(start, "A20:H22", "This workbook records costs and shares the roommates already understand and accept. It does not decide fair rent, create or prove a legal debt, process payments, collect money, or replace a lease or roommate agreement.", {
  fill: COLORS.surface,
  font: { color: COLORS.body },
  wrapText: true,
  verticalAlignment: "center",
});
setWidths(start, { A: 8, B: 22, C: 14, D: 14, E: 14, F: 14, G: 14, H: 14 });
start.freezePanes.freezeRows(2);
console.log("workbook: start sheet ready");

// Settings
titleBand(
  settings,
  "A1:D1",
  "Workbook settings",
  "A2:D2",
  "These lists support workbook dropdowns. Edit them only if you understand how the workbook validation ranges are connected.",
);
settings.getRange("A4:D4").values = [["Categories", "Split methods", "Yes or no", "Currencies"]];
styleHeader(settings.getRange("A4:D4"));
const categories = ["Rent", "Utilities", "Internet", "Groceries", "Household supplies", "Subscription", "Repair or maintenance", "Other"];
const splitMethods = ["Equal among included roommates", "Custom agreed shares"];
const yesNo = ["Yes", "No"];
const currencies = ["USD", "EUR", "GBP", "CAD", "AUD", "NZD", "JPY", "CHF", "SGD", "THB", "Other"];
const settingsRows = Array.from({ length: 11 }, (_, index) => [
  categories[index] ?? null,
  splitMethods[index] ?? null,
  yesNo[index] ?? null,
  currencies[index] ?? null,
]);
settings.getRange("A5:D15").values = settingsRows;
styleDataArea(settings.getRange("A5:D15"));
setWidths(settings, { A: 26, B: 34, C: 16, D: 16 });
settings.freezePanes.freezeRows(4);
console.log("workbook: settings sheet ready");

// Setup
titleBand(
  setup,
  "A1:F1",
  "Household setup",
  "A2:F2",
  "Enter at least two and no more than six unique roommate names. Use one currency for the entire workbook.",
);
setup.getRange("A4:A6").values = [["Household name (optional)"], ["Period"], ["Currency"]];
setup.getRange("A4:A6").format = { fill: COLORS.blueSoft, font: { bold: true, color: COLORS.ink } };
setup.getRange("B4:D6").merge(true);
setup.getRange("B4:D6").format = { fill: COLORS.surface, borders: { preset: "outside", style: "thin", color: COLORS.line } };
setup.getRange("B6").dataValidation = { rule: { type: "list", formula1: quotedSheet("Settings", "$D$5:$D$15") } };
setup.getRange("A8:C8").values = [["Roommate", "Name", "Opening position"]];
styleHeader(setup.getRange("A8:C8"));
setup.getRange("A9:C14").values = roommateSlots.map((index) => [`Roommate ${index + 1} name`, null, 0]);
styleDataArea(setup.getRange("A9:C14"));
setup.getRange("B9:B14").format.fill = COLORS.yellowSoft;
setup.getRange("C9:C14").format.fill = COLORS.yellowSoft;
setup.getRange("C9:C14").format.numberFormat = amountFormat;
setup.getRange("A16:C16").values = [["Opening position total", null, null]];
setup.getRange("C16").formulas = [["=SUM(C9:C14)"]];
setup.getRange("C16").format.numberFormat = amountFormat;
setup.getRange("A17:F18").merge();
setup.getRange("A17").formulas = [[
  '=IF(COUNTIF(B9:B14,"<>")<2,"Add at least two roommate names.",IF(OR(AND(B9<>"",COUNTIF($B$9:$B$14,B9)>1),AND(B10<>"",COUNTIF($B$9:$B$14,B10)>1),AND(B11<>"",COUNTIF($B$9:$B$14,B11)>1),AND(B12<>"",COUNTIF($B$9:$B$14,B12)>1),AND(B13<>"",COUNTIF($B$9:$B$14,B13)>1),AND(B14<>"",COUNTIF($B$9:$B$14,B14)>1)),"Roommate names must be unique.",IF(ABS(C16)>0.01,"Opening positions do not balance. Check that the total is 0.00.","Ready: opening positions balance to 0.00.")))',
]];
setup.getRange("A17:F18").format = {
  fill: COLORS.yellowSoft,
  font: { bold: true, color: COLORS.ink },
  wrapText: true,
  verticalAlignment: "center",
};
addStatusFormatting(setup.getRange("A17:F18"));
mergeWrite(setup, "A20:F20", "Use a positive opening position when a roommate should receive money and a negative position when they owe money.", {
  fill: COLORS.surfaceAlt,
  font: { color: COLORS.body, italic: true },
  wrapText: true,
});
mergeWrite(setup, "A21:F22", "Opening positions should come from one previously verified closing summary and must add up to zero.", {
  fill: COLORS.surfaceAlt,
  font: { color: COLORS.body, italic: true },
  wrapText: true,
});
setWidths(setup, { A: 30, B: 24, C: 20, D: 16, E: 16, F: 16 });
setup.freezePanes.freezeRows(8);
console.log("workbook: setup sheet ready");

// Expenses
titleBand(
  expenses,
  "A1:Z1",
  "Shared expenses",
  "A2:Z2",
  "Record each shared cost once. Use equal shares only for the included roommates, or enter custom shares that the household already agreed to.",
);
expenses.getRange("A3:F3").merge();
expenses.getRange("A3").values = [["Expense inputs"]];
expenses.getRange("G3:L3").merge();
expenses.getRange("G3").values = [["Included?"]];
expenses.getRange("M3:R3").merge();
expenses.getRange("M3").values = [["Custom agreed shares"]];
expenses.getRange("S3").values = [["Notes"]];
expenses.getRange("T3:Y3").merge();
expenses.getRange("T3").values = [["Calculated shares"]];
expenses.getRange("Z3").values = [["Check"]];
expenses.getRange("A3:Z3").format = {
  fill: COLORS.blueSoft,
  font: { bold: true, color: COLORS.ink },
  horizontalAlignment: "center",
  verticalAlignment: "center",
};
expenses.getRange("A4:F4").values = [["Date", "Expense", "Category", "Amount", "Paid by", "Split method"]];
expenses.getRange("S4:Z4").values = [["Notes", null, null, null, null, null, null, "Share check"]];
roommateSlots.forEach((index) => {
  const setupRow = 9 + index;
  const includedCol = col(7 + index);
  const customCol = col(13 + index);
  const calculatedCol = col(20 + index);
  const headerFormula = `=IF('Setup'!B${setupRow}="","Roommate ${index + 1}",'Setup'!B${setupRow})`;
  expenses.getRange(`${includedCol}4`).formulas = [[headerFormula]];
  expenses.getRange(`${customCol}4`).formulas = [[headerFormula]];
  expenses.getRange(`${calculatedCol}4`).formulas = [[headerFormula]];
});
styleHeader(expenses.getRange("A4:Z4"));
styleDataArea(expenses.getRange("A5:Z204"));
expenses.getRange("A5:S204").format.fill = COLORS.surface;
expenses.getRange("T5:Z204").format.fill = COLORS.surfaceAlt;
expenses.getRange("A5:A204").format.numberFormat = dateFormat;
expenses.getRange("D5:D204").format.numberFormat = amountFormat;
expenses.getRange("M5:R204").format.numberFormat = amountFormat;
expenses.getRange("T5:Y204").format.numberFormat = amountFormat;

const expenseFormulaRows = [];
for (let row = 5; row <= 204; row += 1) {
  const calculated = roommateSlots.map((index) => {
    const includedCol = col(7 + index);
    const customCol = col(13 + index);
    const calcCol = col(20 + index);
    const laterIncludedStart = col(8 + index);
    const laterIncluded = index < 5 ? `COUNTIF($${laterIncludedStart}${row}:$L${row},"Yes")` : "0";
    const previousCalculated = index === 0 ? "0" : `SUM($T${row}:${col(19 + index)}${row})`;
    return `=IF(COUNTIF($A${row}:$S${row},"<>")=0,"",IF($F${row}="Equal among included roommates",IF(${includedCol}${row}<>"Yes",0,IF(${laterIncluded}=0,$D${row}-${previousCalculated},ROUND($D${row}/COUNTIF($G${row}:$L${row},"Yes"),2))),IF($F${row}="Custom agreed shares",IF(${includedCol}${row}="Yes",${customCol}${row},0),"")))`;
  });
  const missingCustomTerms = roommateSlots.map((index) => {
    const includedCol = col(7 + index);
    const customCol = col(13 + index);
    return `AND(${includedCol}${row}="Yes",${customCol}${row}="")`;
  }).join(",");
  const check = `=IF(COUNTIF($A${row}:$S${row},"<>")=0,"",IF(OR($D${row}="",$D${row}<=0),"Enter an amount greater than 0.",IF($E${row}="","Choose who paid.",IF(COUNTIF($G${row}:$L${row},"Yes")=0,"Choose at least one included roommate.",IF($F${row}="Equal among included roommates","Ready",IF($F${row}="Custom agreed shares",IF(OR(${missingCustomTerms}),"Enter custom shares that add up to the expense amount.",IF(ABS(SUM($M${row}:$R${row}))<0.005,"Enter custom shares that add up to the expense amount.",IF(SUM($M${row}:$R${row})<$D${row}-0.005,"Custom shares are short by "&ROUND($D${row}-SUM($M${row}:$R${row}),2)&".",IF(SUM($M${row}:$R${row})>$D${row}+0.005,"Custom shares are over by "&ROUND(SUM($M${row}:$R${row})-$D${row},2)&".","Ready")))),"Enter custom shares that add up to the expense amount."))))))`;
  expenseFormulaRows.push([...calculated, check]);
}
expenses.getRange("T5:Z204").formulas = expenseFormulaRows;
expenses.getRange("C5:C204").dataValidation = { rule: { type: "list", formula1: quotedSheet("Settings", "$A$5:$A$12") } };
expenses.getRange("D5:D204").dataValidation = { rule: { type: "decimal", operator: "greaterThan", formula1: 0 } };
expenses.getRange("E5:E204").dataValidation = { rule: { type: "list", formula1: quotedSheet("Setup", "$B$9:$B$14") } };
expenses.getRange("F5:F204").dataValidation = { rule: { type: "list", formula1: quotedSheet("Settings", "$B$5:$B$6") } };
expenses.getRange("G5:L204").dataValidation = { rule: { type: "list", formula1: quotedSheet("Settings", "$C$5:$C$6") } };
expenses.getRange("M5:R204").dataValidation = { rule: { type: "decimal", operator: "greaterThanOrEqual", formula1: 0 } };
addStatusFormatting(expenses.getRange("Z5:Z204"));
setWidths(expenses, {
  A: 13, B: 24, C: 22, D: 15, E: 19, F: 31,
  G: 15, H: 15, I: 15, J: 15, K: 15, L: 15,
  M: 16, N: 16, O: 16, P: 16, Q: 16, R: 16,
  S: 30, T: 16, U: 16, V: 16, W: 16, X: 16, Y: 16, Z: 43,
});
expenses.freezePanes.freezeRows(4);
console.log("workbook: expenses sheet ready");

// Repayments
titleBand(
  repayments,
  "A1:F1",
  "Repayments between roommates",
  "A2:F2",
  "Record a repayment once, from the roommate who sent it to the roommate who received it. Do not reduce or delete the original expense.",
);
repayments.getRange("A4:F4").values = [["Date", "From", "To", "Amount", "Note", "Check"]];
styleHeader(repayments.getRange("A4:F4"));
styleDataArea(repayments.getRange("A5:F204"));
repayments.getRange("A5:E204").format.fill = COLORS.surface;
repayments.getRange("F5:F204").format.fill = COLORS.surfaceAlt;
repayments.getRange("A5:A204").format.numberFormat = dateFormat;
repayments.getRange("D5:D204").format.numberFormat = amountFormat;
const repaymentChecks = [];
for (let row = 5; row <= 204; row += 1) {
  repaymentChecks.push([`=IF(COUNTIF($A${row}:$E${row},"<>")=0,"",IF(OR($B${row}="",$C${row}=""),"Choose who sent and who received the repayment.",IF($B${row}=$C${row},"Choose two different roommates.",IF(OR($D${row}="",$D${row}<=0),"Enter an amount greater than 0.","Ready"))))`]);
}
repayments.getRange("F5:F204").formulas = repaymentChecks;
repayments.getRange("B5:C204").dataValidation = { rule: { type: "list", formula1: quotedSheet("Setup", "$B$9:$B$14") } };
repayments.getRange("D5:D204").dataValidation = { rule: { type: "decimal", operator: "greaterThan", formula1: 0 } };
addStatusFormatting(repayments.getRange("F5:F204"));
setWidths(repayments, { A: 14, B: 22, C: 22, D: 16, E: 42, F: 48 });
repayments.freezePanes.freezeRows(4);
repayments.tables.add("A4:F204", true, "RoommateRepayments");
console.log("workbook: repayments sheet ready");

// Summary
titleBand(
  summary,
  "A1:S1",
  "Roommate settle-up summary",
  "A2:S2",
  "Positive means should receive. Negative means owes. Review every check before using a suggested transfer.",
);
summary.getRange("A4:G4").values = [["Roommate", "Opening position", "Paid toward expenses", "Assigned expense share", "Repayments sent", "Repayments received", "Current position"]];
summary.getRange("H4").values = [["Status"]];
styleHeader(summary.getRange("A4:H4"));
for (let index = 0; index < 6; index += 1) {
  const row = 5 + index;
  const setupRow = 9 + index;
  const assignedCol = col(20 + index);
  summary.getRange(`A${row}`).formulas = [[`=IF('Setup'!B${setupRow}="","",'Setup'!B${setupRow})`]];
  summary.getRange(`B${row}`).formulas = [[`=IF(A${row}="","",'Setup'!C${setupRow})`]];
  summary.getRange(`C${row}`).formulas = [[`=IF(A${row}="","",SUMIFS('Expenses'!$D$5:$D$204,'Expenses'!$E$5:$E$204,A${row},'Expenses'!$Z$5:$Z$204,"Ready"))`]];
  summary.getRange(`D${row}`).formulas = [[`=IF(A${row}="","",SUM('Expenses'!$${assignedCol}$5:$${assignedCol}$204))`]];
  summary.getRange(`E${row}`).formulas = [[`=IF(A${row}="","",SUMIFS('Repayments'!$D$5:$D$204,'Repayments'!$B$5:$B$204,A${row},'Repayments'!$F$5:$F$204,"Ready"))`]];
  summary.getRange(`F${row}`).formulas = [[`=IF(A${row}="","",SUMIFS('Repayments'!$D$5:$D$204,'Repayments'!$C$5:$C$204,A${row},'Repayments'!$F$5:$F$204,"Ready"))`]];
  summary.getRange(`G${row}`).formulas = [[`=IF(A${row}="","",B${row}+C${row}-D${row}+E${row}-F${row})`]];
  summary.getRange(`H${row}`).formulas = [[`=IF(A${row}="","",IF(ABS(G${row})<=0.01,"Settled",IF(G${row}>0,"Should receive "&ROUND(G${row},2),"Owes "&ROUND(-G${row},2))))`]];
}
styleDataArea(summary.getRange("A5:H10"));
summary.getRange("B5:G10").format.numberFormat = amountFormat;
summary.getRange("G5:G10").conditionalFormats.add("cellIs", { operator: "greaterThan", formula: 0.01, format: { fill: COLORS.greenSoft, font: { bold: true, color: "#355428" } } });
summary.getRange("G5:G10").conditionalFormats.add("cellIs", { operator: "lessThan", formula: -0.01, format: { fill: COLORS.yellowSoft, font: { bold: true, color: COLORS.ink } } });

sectionBand(summary, "A12:H12", "Totals and record check");
summary.getRange("A13:A17").values = [["Expense total"], ["Assigned-share total"], ["Repayment total"], ["Position total"], ["Record check"]];
summary.getRange("B13").formulas = [[`=SUMIF('Expenses'!$Z$5:$Z$204,"Ready",'Expenses'!$D$5:$D$204)`]];
summary.getRange("B14").formulas = [["=SUM(D5:D10)"]];
summary.getRange("B15").formulas = [[`=SUMIF('Repayments'!$F$5:$F$204,"Ready",'Repayments'!$D$5:$D$204)`]];
summary.getRange("B16").formulas = [["=SUM(G5:G10)"]];
summary.getRange("B17").formulas = [[`=IF('Setup'!A17<>"Ready: opening positions balance to 0.00.","Resolve the highlighted setup, expense, or repayment checks before settling.",IF(COUNTIFS('Expenses'!$Z$5:$Z$204,"<>",'Expenses'!$Z$5:$Z$204,"<>Ready")+COUNTIFS('Repayments'!$F$5:$F$204,"<>",'Repayments'!$F$5:$F$204,"<>Ready")>0,"Resolve the highlighted setup, expense, or repayment checks before settling.",IF(ABS(B16)>0.01,"Current positions do not balance to 0.00. Check the opening positions and expense shares.","Ready: current positions balance to 0.00.")))`]];
summary.getRange("A13:A17").format = { fill: COLORS.surfaceAlt, font: { bold: true, color: COLORS.ink } };
summary.getRange("B13:B16").format.numberFormat = amountFormat;
summary.getRange("B13:B17").format = {
  fill: COLORS.surface,
  borders: { preset: "all", style: "thin", color: COLORS.line },
  wrapText: true,
};
summary.getRange("B17:H18").merge();
summary.getRange("B17:H18").format = { fill: COLORS.yellowSoft, font: { bold: true, color: COLORS.ink }, wrapText: true, verticalAlignment: "center" };
addStatusFormatting(summary.getRange("B17:H18"));

sectionBand(summary, "A20:H20", "Suggested settlement transfers");
mergeWrite(summary, "A21:H21", "These transfers settle the current positions with the fewest practical payments the workbook can calculate. Review the underlying entries before sending money.", {
  fill: COLORS.surfaceAlt,
  font: { color: COLORS.body, italic: true },
  wrapText: true,
});
summary.getRange("A22:C22").values = [["From", "To", "Amount"]];
styleHeader(summary.getRange("A22:C22"));
summary.getRange("A23:C27").formulas = Array.from({ length: 5 }, (_, index) => [
  `=IF($B$17<>"Ready: current positions balance to 0.00.","",K${22 + index})`,
  `=IF($B$17<>"Ready: current positions balance to 0.00.","",L${22 + index})`,
  `=IF($B$17<>"Ready: current positions balance to 0.00.","",M${22 + index})`,
]);
styleDataArea(summary.getRange("A23:C27"));
summary.getRange("C23:C27").format.numberFormat = amountFormat;
summary.getRange("A29:H30").merge();
summary.getRange("A29").formulas = [[`=IF($B$17<>"Ready: current positions balance to 0.00.","Settlement suggestions are unavailable until the current positions balance to 0.00.",IF(COUNTIF($G$5:$G$10,"<-0.01")=0,"No settlement transfer is needed.",""))`]];
summary.getRange("A29:H30").format = { fill: COLORS.blueSoft, font: { bold: true, color: COLORS.ink }, wrapText: true, verticalAlignment: "center" };

// Inspectable settlement engine. Each step applies one transfer and carries the six balances forward.
summary.getRange("J20:S20").values = [["Step", "From", "To", "Amount", "Position 1", "Position 2", "Position 3", "Position 4", "Position 5", "Position 6"]];
styleHeader(summary.getRange("J20:S20"));
summary.getRange("J21:M21").values = [[0, null, null, null]];
summary.getRange("N21:S21").formulas = [roommateSlots.map((index) => `=IF($B$17="Ready: current positions balance to 0.00.",$G${5 + index},"")`)];
for (let step = 1; step <= 5; step += 1) {
  const row = 21 + step;
  const previous = row - 1;
  summary.getRange(`J${row}`).values = [[step]];
  const negativeChoice = roommateSlots.map((index) => `IF(${col(14 + index)}${previous}<-0.01,$A${5 + index},`).join("") + '""' + ")".repeat(6);
  const positiveChoice = roommateSlots.map((index) => `IF(${col(14 + index)}${previous}>0.01,$A${5 + index},`).join("") + '""' + ")".repeat(6);
  summary.getRange(`K${row}`).formulas = [[`=IF($B$17<>"Ready: current positions balance to 0.00.","",${negativeChoice})`]];
  summary.getRange(`L${row}`).formulas = [[`=IF($B$17<>"Ready: current positions balance to 0.00.","",${positiveChoice})`]];
  const debtorAmount = roommateSlots.map((index) => `IF($K${row}=$A${5 + index},-${col(14 + index)}${previous},`).join("") + "0" + ")".repeat(6);
  const creditorAmount = roommateSlots.map((index) => `IF($L${row}=$A${5 + index},${col(14 + index)}${previous},`).join("") + "0" + ")".repeat(6);
  summary.getRange(`M${row}`).formulas = [[`=IF(OR(K${row}="",L${row}=""),"",MIN(${debtorAmount},${creditorAmount}))`]];
  roommateSlots.forEach((index) => {
    const stateCol = col(14 + index);
    const nameRow = 5 + index;
    summary.getRange(`${stateCol}${row}`).formulas = [[`=IF(${stateCol}${previous}="","",${stateCol}${previous}+IF($A${nameRow}=$K${row},$M${row},0)-IF($A${nameRow}=$L${row},$M${row},0))`]];
  });
}
styleDataArea(summary.getRange("J21:S26"));
summary.getRange("M21:S26").format.numberFormat = amountFormat;
setWidths(summary, { A: 23, B: 20, C: 22, D: 24, E: 20, F: 22, G: 20, H: 28, I: 4, J: 9, K: 20, L: 20, M: 16, N: 15, O: 15, P: 15, Q: 15, R: 15, S: 15 });
summary.freezePanes.freezeRows(4);
console.log("workbook: summary sheet ready");

// Example
titleBand(
  example,
  "A1:G1",
  "Completed example: Maya, Alex, and Sam",
  "A2:G2",
  "Three shared expenses split equally, followed by one partial repayment before the final settle-up.",
);
sectionBand(example, "A4:G4", "Expenses");
example.getRange("A5:G5").values = [["Date", "Expense", "Category", "Amount", "Paid by", "Included roommates", "Agreed share"]];
styleHeader(example.getRange("A5:G5"));
example.getRange("A6:G8").values = [
  [new Date("2026-05-01T00:00:00Z"), "Rent", "Rent", 1800, "Maya", "Maya, Alex, Sam", "$600 each"],
  [new Date("2026-05-05T00:00:00Z"), "Internet", "Internet", 60, "Alex", "Maya, Alex, Sam", "$20 each"],
  [new Date("2026-05-12T00:00:00Z"), "Groceries", "Groceries", 120, "Sam", "Maya, Alex, Sam", "$40 each"],
];
styleDataArea(example.getRange("A6:G8"));
example.getRange("A6:A8").format.numberFormat = dateFormat;
example.getRange("A6:A8").format.horizontalAlignment = "center";
example.getRange("D6:D8").format.numberFormat = amountFormat;
example.getRange("D6:D8").format.horizontalAlignment = "center";
sectionBand(example, "A10:G10", "Repayment recorded separately");
example.getRange("A11:E11").values = [["Date", "From", "To", "Amount", "Note"]];
styleHeader(example.getRange("A11:E11"));
example.getRange("A12:E12").values = [[new Date("2026-05-20T00:00:00Z"), "Alex", "Maya", 200, "Partial repayment before monthly review"]];
styleDataArea(example.getRange("A12:E12"));
example.getRange("A12").format.numberFormat = dateFormat;
example.getRange("A12").format.horizontalAlignment = "center";
example.getRange("D12").format.numberFormat = amountFormat;
example.getRange("D12").format.horizontalAlignment = "center";
sectionBand(example, "A14:G14", "Summary after the $200 repayment");
example.getRange("A15:F15").values = [["Roommate", "Paid toward expenses", "Assigned share", "Repayments sent", "Repayments received", "Current position"]];
styleHeader(example.getRange("A15:F15"));
example.getRange("A16:A18").values = [["Maya"], ["Alex"], ["Sam"]];
for (let row = 16; row <= 18; row += 1) {
  example.getRange(`B${row}`).formulas = [[`=SUMIF($E$6:$E$8,A${row},$D$6:$D$8)`]];
  example.getRange(`C${row}`).formulas = [["=SUM($D$6:$D$8)/3"]];
  example.getRange(`D${row}`).formulas = [[`=SUMIF($B$12:$B$12,A${row},$D$12:$D$12)`]];
  example.getRange(`E${row}`).formulas = [[`=SUMIF($C$12:$C$12,A${row},$D$12:$D$12)`]];
  example.getRange(`F${row}`).formulas = [[`=B${row}-C${row}+D${row}-E${row}`]];
}
styleDataArea(example.getRange("A16:F18"));
example.getRange("B16:F18").format.numberFormat = amountFormat;
example.getRange("F16:F18").format.font = { bold: true, color: COLORS.ink };
example.getRange("A20:B21").values = [["Shared expense total", null], ["Assigned share per roommate", null]];
example.getRange("B20").formulas = [["=SUM($D$6:$D$8)"]];
example.getRange("B21").formulas = [["=B20/3"]];
example.getRange("B20:B21").format.numberFormat = amountFormat;
example.getRange("A20:A21").format = { fill: COLORS.surfaceAlt, font: { bold: true, color: COLORS.ink } };
example.getRange("B20:B21").format.fill = COLORS.surface;
sectionBand(example, "A23:G23", "Suggested settlement transfers");
example.getRange("A24:C24").values = [["From", "To", "Amount"]];
styleHeader(example.getRange("A24:C24"));
example.getRange("A25:B26").values = [["Alex", "Maya"], ["Sam", "Maya"]];
example.getRange("C25").formulas = [["=-F17"]];
example.getRange("C26").formulas = [["=-F18"]];
styleDataArea(example.getRange("A25:C26"));
example.getRange("C25:C26").format.numberFormat = amountFormat;
example.getRange("E24:F24").values = [["Final total", null]];
example.getRange("F24").formulas = [["=SUM(F16:F18)"]];
example.getRange("F24").format.numberFormat = amountFormat;
example.getRange("E24:F24").format = { fill: COLORS.greenSoft, font: { bold: true, color: "#355428" }, borders: { preset: "all", style: "thin", color: COLORS.line } };
setWidths(example, { A: 28, B: 28, C: 22, D: 20, E: 24, F: 24, G: 21 });
example.freezePanes.freezeRows(5);
console.log("workbook: example sheet ready");

const sheetPreviewRanges = {
  "Start Here": "A1:H22",
  Setup: "A1:F22",
  Expenses: "A1:Z14",
  Repayments: "A1:F16",
  Summary: "A1:S30",
  Example: "A1:G26",
  Settings: "A1:D15",
};

const keyInspection = await workbook.inspect({
  kind: "table",
  sheetId: "Example",
  range: "A14:F26",
  include: "values,formulas",
  tableMaxRows: 20,
  tableMaxCols: 8,
  maxChars: 8000,
});
console.log(keyInspection.ndjson);
const formulaErrors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
  maxChars: 8000,
});
console.log(formulaErrors.ndjson);

if (previewDir) {
  await fs.mkdir(previewDir, { recursive: true });
  for (const [sheetName, range] of Object.entries(sheetPreviewRanges)) {
    const preview = await workbook.render({ sheetName, range, scale: sheetName === "Example" ? 2 : 1, format: "png" });
    const filename = `${sheetName.toLowerCase().replaceAll(" ", "-")}.png`;
    await fs.writeFile(path.join(previewDir, filename), new Uint8Array(await preview.arrayBuffer()));
  }
}

await fs.mkdir(path.dirname(outputPath), { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(`saved ${outputPath}`);
