// Real .docx export (no bundler — the `docx` package is loaded as an ESM
// module straight from a CDN, same as any other browser <script type=module>
// import). Builds a Word document from a material's already-resolved
// content object (real AI content for КСП, mock-template content for the
// rest — same shapes editor.js already renders in the browser).
//
// The КСП export follows Приложение 7 к приказу МОН РК №130 literally:
// шапка (Раздел/ФИО педагога/Дата/Класс/Тема/Цели) + "Ход урока" as a
// bordered 5-column table (Этап-Действия педагога-Действия ученика-
// Оценивание-Ресурсы) — these are the fields the order marks obязательные.
// Everything else (баллы, карточки, чек-лист) is rendered afterwards under
// a clearly labelled "Дополнительные элементы" section, since the order
// explicitly allows "педагог имеет право внести дополнительные элементы".

import { getProfile } from "../data/store.js";
import { buildMaterialContent } from "../data/mockContent.js";

const DOCX_CDN = "https://esm.sh/docx@9";

let docxModulePromise = null;
function loadDocx() {
  if (!docxModulePromise) docxModulePromise = import(DOCX_CDN);
  return docxModulePromise;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function safeFileName(name) {
  return name.replace(/[\\/:*?"<>|]+/g, " ").trim().slice(0, 120);
}

// GOST-style office document margins (cm, converted to twips: 1cm ≈ 567твип).
function cm(value) {
  return Math.round(value * 566.93);
}
const GOST_MARGINS = { top: cm(2), bottom: cm(2), left: cm(3), right: cm(1.5) };

const BORDER_LINE = { style: "single", size: 4, color: "000000" };
const TABLE_BORDERS = {
  top: BORDER_LINE,
  bottom: BORDER_LINE,
  left: BORDER_LINE,
  right: BORDER_LINE,
  insideHorizontal: BORDER_LINE,
  insideVertical: BORDER_LINE,
};

function buildKSPForm(docx, content) {
  const { Paragraph, Table, TableRow, TableCell, WidthType, AlignmentType, TextRun } = docx;

  const toParagraphs = (value) => (Array.isArray(value) ? value.map((v) => new Paragraph(v)) : [new Paragraph(value || "")]);
  const labelCell = (text, pct) =>
    new TableCell({ width: { size: pct, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })] });
  const valueCell = (value, pct) => new TableCell({ width: { size: pct, type: WidthType.PERCENTAGE }, children: toParagraphs(value) });
  const p = (text) => new Paragraph({ text: text || "—", spacing: { after: 100 } });
  const bullets = (items) => (items || []).map((t) => new Paragraph({ text: t, bullet: { level: 0 }, spacing: { after: 60 } }));
  const h = (text, spacing = { before: 160, after: 80 }) => new Paragraph({ children: [new TextRun({ text, bold: true })], spacing });

  const profile = getProfile();
  const today = new Date().toLocaleDateString("ru-RU");

  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: TABLE_BORDERS,
    rows: [
      new TableRow({ children: [labelCell("Раздел", 30), valueCell(content.section, 70)] }),
      new TableRow({ children: [labelCell("ФИО педагога", 30), valueCell(profile.name || "", 70)] }),
      new TableRow({ children: [labelCell("Дата", 30), valueCell(today, 70)] }),
      new TableRow({
        children: [
          labelCell("Класс", 30),
          valueCell(`${content.grade} класс     Количество присутствующих: _____     отсутствующих: _____`, 70),
        ],
      }),
      new TableRow({ children: [labelCell("Тема урока", 30), valueCell(content.topic, 70)] }),
      new TableRow({
        children: [
          labelCell("Цели обучения в соответствии с учебной программой", 30),
          valueCell(content.curriculumGoalCode ? `${content.curriculumGoalCode} — ${content.curriculumGoal}` : content.curriculumGoal, 70),
        ],
      }),
      new TableRow({ children: [labelCell("Цели урока", 30), valueCell(content.lessonObjectives.map((t) => `• ${t}`), 70)] }),
    ],
  });

  const stageRows = [];
  content.stages.forEach((stage) => {
    stage.activities.forEach((a) => {
      stageRows.push(
        new TableRow({
          children: [
            valueCell([stage.name, stage.time], 15),
            valueCell([a.title, a.teacherScript], 30),
            valueCell(a.studentActions, 20),
            valueCell(a.assessment, 20),
            valueCell((a.resources || []).join(", "), 15),
          ],
        })
      );
    });
  });

  const hodUrokaTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: TABLE_BORDERS,
    rows: [
      new TableRow({
        children: [
          labelCell("Этап урока / Время", 15),
          labelCell("Действия педагога", 30),
          labelCell("Действия ученика", 20),
          labelCell("Оценивание", 20),
          labelCell("Ресурсы", 15),
        ],
      }),
      ...stageRows,
    ],
  });

  const totalPoints = (content.assessmentCriteria || []).reduce((sum, c) => sum + (c.points || 0), 0);
  const assessTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: TABLE_BORDERS,
    rows: [
      new TableRow({ children: [labelCell("Критерий", 35), labelCell("Дескрипторы", 50), labelCell("Балл", 15)] }),
      ...content.assessmentCriteria.map(
        (c) => new TableRow({ children: [valueCell(c.criterion, 35), valueCell(c.descriptors, 50), valueCell(String(c.points), 15)] })
      ),
    ],
  });

  return [
    new Paragraph({ text: "_______________________________________________________", alignment: AlignmentType.CENTER }),
    new Paragraph({ text: "(наименование организации образования)", alignment: AlignmentType.CENTER, italics: true, spacing: { after: 240 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: "Поурочный план или краткосрочный план для педагога организаций среднего образования", bold: true })],
    }),
    new Paragraph({ text: `(${content.topic})`, alignment: AlignmentType.CENTER, italics: true, spacing: { after: 240 } }),
    headerTable,
    new Paragraph({ text: "", spacing: { before: 160 } }),
    h("Ход урока"),
    hodUrokaTable,
    new Paragraph({
      spacing: { before: 160, after: 320 },
      children: [
        new TextRun({
          text: "Данные пункты плана урока являются обязательными. Педагог имеет право внести дополнительные элементы с учетом особенностей предмета и потребностей учащихся.",
          italics: true,
          size: 20,
        }),
      ],
    }),
    h("Дополнительные элементы (по усмотрению педагога)"),
    h("Ценности", { before: 80, after: 40 }),
    ...bullets(content.values),
    p(`Межпредметные связи: ${content.crossCurricularLinks}`),
    p(`ИКТ / интерактив в уроке: ${content.ictElement}`),
    h("Дифференциация"),
    p(`Для учащихся с высоким уровнем освоения материала: ${content.differentiation.advanced}`),
    p(`Для испытывающих трудности: ${content.differentiation.struggling}`),
    h("Для учеников с ООП (по категориям)", { before: 80, after: 40 }),
    ...(content.differentiation.sen || []).map((s) => p(`${s.category}: ${s.support}`)),
    h(`Критерии оценивания за урок (${totalPoints} баллов)`),
    assessTable,
    h("Готовые задания", { before: 240, after: 80 }),
    ...content.printableTasks.flatMap((t) => [h(t.title, { before: 80, after: 20 }), p(t.goal), p(t.instruction)]),
    h("Чек-лист контроля качества"),
    ...bullets(content.qualityChecklist),
  ];
}

function buildMaterialSection(docx, material, content) {
  const { Paragraph, HeadingLevel, Table, TableRow, TableCell, WidthType } = docx;
  const h2 = (text) => new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 } });
  const h3 = (text) => new Paragraph({ text, heading: HeadingLevel.HEADING_3, spacing: { before: 160, after: 80 } });
  const p = (text) => new Paragraph({ text: text || "—", spacing: { after: 100 } });
  const bullets = (items) => (items || []).map((t) => new Paragraph({ text: t, bullet: { level: 0 }, spacing: { after: 60 } }));
  const cell = (text) => new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph(text || "")] });

  if (!content) {
    return [new Paragraph({ text: material.label, heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 160 } }), p("Материал ещё не готов.")];
  }

  if (material.key === "ksp") return buildKSPForm(docx, content);

  const out = [new Paragraph({ text: material.label, heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 160 } })];
  switch (material.key) {
    case "presentation":
      content.slides.forEach((s) => {
        out.push(h3(`Слайд ${s.index}: ${s.title}`));
        out.push(p(s.note));
      });
      break;
    case "worksheet":
      out.push(h2("Соотнеси понятия"), p(content.matching.instruction));
      out.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: content.matching.pairs.map(
            (pr) => new TableRow({ children: [cell(pr.term), cell(pr.definition)] })
          ),
        })
      );
      out.push(h2("Заполни пропуски"), p(content.fillIn.instruction));
      out.push(...content.fillIn.items.map((it, i) => p(`${i + 1}. ${it.sentence} (${it.answer})`)));
      out.push(h2("Таблица"), p(content.table.instruction));
      out.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [cell(content.table.columnA), cell(content.table.columnB)] }),
            ...content.table.rows.map((r) => new TableRow({ children: [cell(r.a), cell(r.b)] })),
          ],
        })
      );
      out.push(h2("Открытые вопросы"), p(content.openQuestions.instruction));
      content.openQuestions.items.forEach((q, i) => {
        out.push(h3(`${i + 1}. ${q.question}`));
        out.push(p(`Эталонный ответ: ${q.sampleAnswer}`));
      });
      break;
    case "tasks3":
      [content.levelA, content.levelB, content.levelC].forEach((lvl) => {
        out.push(h2(lvl.label), ...bullets(lvl.tasks));
      });
      break;
    case "quiz":
      content.questions.forEach((q, i) => {
        out.push(h3(`${i + 1}. ${q.question}`));
        out.push(p(`Ответ: ${q.answer}`));
      });
      break;
    case "reflection":
      out.push(...bullets(content.prompts));
      break;
    case "homework":
      out.push(...bullets(content.tasks));
      break;
    case "textDetective":
      out.push(...bullets(content.modes));
      break;
    case "cards":
      content.cards.forEach((c) => out.push(h3(c.front), p(c.back)));
      break;
    default:
      out.push(p(JSON.stringify(content)));
  }
  return out;
}

async function buildDoc(children) {
  const docx = await loadDocx();
  const { Document } = docx;
  const doc = new Document({
    styles: { default: { document: { run: { font: "Times New Roman", size: 24 } } } },
    sections: [{ properties: { page: { margin: GOST_MARGINS } }, children }],
  });
  return docx.Packer.toBlob(doc);
}

export async function exportMaterialToDocx(project, material, content) {
  const docx = await loadDocx();
  if (material.key === "ksp" && content) {
    const children = buildKSPForm(docx, content);
    const blob = await buildDoc(children);
    downloadBlob(blob, safeFileName(`${project.topic} — КСП.docx`));
    return;
  }
  const { Paragraph, HeadingLevel } = docx;
  const header = [
    new Paragraph({ text: project.topic, heading: HeadingLevel.TITLE }),
    new Paragraph({ text: `${project.subject} · ${project.grade} класс · ${project.duration} мин`, spacing: { after: 160 } }),
  ];
  const body = buildMaterialSection(docx, material, content);
  const blob = await buildDoc([...header, ...body]);
  downloadBlob(blob, safeFileName(`${project.topic} — ${material.label}.docx`));
}

export async function exportProjectToDocx(project) {
  const docx = await loadDocx();
  const { Paragraph, HeadingLevel } = docx;
  const header = [
    new Paragraph({ text: project.topic, heading: HeadingLevel.TITLE }),
    new Paragraph({ text: `${project.subject} · ${project.grade} класс · ${project.duration} мин`, spacing: { after: 240 } }),
  ];
  const readyMaterials = project.materials.filter((m) => m.status === "ready");
  const body = readyMaterials.flatMap((m) => buildMaterialSection(docx, m, m.content || buildMaterialContent(m.key, project)));
  const blob = await buildDoc([...header, ...body]);
  downloadBlob(blob, safeFileName(`${project.topic} — комплект материалов.docx`));
}
