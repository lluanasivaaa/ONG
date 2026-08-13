const {
  isConfigured,
  parseRequestBody,
  readRecords,
  requireAdmin,
  sendJson,
  writeRecords,
} = require("./_github");

const localData = require("../data/prestacao-contas.json");

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const normalizeRecord = (record) => ({
  amount: String(record.amount || "").trim(),
  description: String(record.description || "").trim(),
  documentUrl: String(record.documentUrl || "").trim(),
  id: String(record.id || createId()),
  period: String(record.period || "").trim(),
  source: String(record.source || "").trim(),
  year: String(record.year || "").trim(),
});

const validateRecord = (record) => {
  if (!record.year || !record.period || !record.source || !record.amount) {
    return "Informe ano, bimestre, origem e valor.";
  }

  if (!/^\d{4}$/.test(record.year)) {
    return "Informe um ano válido com quatro dígitos.";
  }

  return "";
};

module.exports = async (request, response) => {
  if (request.method === "GET") {
    if (!isConfigured()) {
      return sendJson(response, 200, { records: Array.isArray(localData.records) ? localData.records : [] });
    }

    try {
      const { records } = await readRecords();
      return sendJson(response, 200, { records });
    } catch {
      return sendJson(response, 200, { records: Array.isArray(localData.records) ? localData.records : [] });
    }
  }

  if (!isConfigured()) {
    return sendJson(response, 500, {
      error: "API administrativa não configurada. Defina ADMIN_PASSWORD, GITHUB_TOKEN, GITHUB_OWNER e GITHUB_REPO no deploy.",
    });
  }

  if (!requireAdmin(request, response)) return;

  const state = await readRecords();
  let records = state.records;

  if (request.method === "POST" || request.method === "PUT") {
    const record = normalizeRecord(await parseRequestBody(request));
    const validationError = validateRecord(record);
    if (validationError) return sendJson(response, 400, { error: validationError });

    if (request.method === "POST") {
      records = [record, ...records];
    } else {
      records = records.map((item) => (item.id === record.id ? record : item));
      if (!records.some((item) => item.id === record.id)) records.unshift(record);
    }

    await writeRecords(records, state.sha);
    return sendJson(response, 200, { records });
  }

  if (request.method === "DELETE") {
    const id = new URL(request.url, `https://${request.headers.host}`).searchParams.get("id");
    records = records.filter((record) => record.id !== id);
    await writeRecords(records, state.sha);
    return sendJson(response, 200, { records });
  }

  return sendJson(response, 405, { error: "Método não permitido." });
};
