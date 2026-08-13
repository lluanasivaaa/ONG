const { branch, isConfigured, requireAdmin, sendJson, toBase64, writeGithubFile } = require("./_github");

const allowedTypes = new Map([
  ["application/pdf", "pdf"],
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

const sanitizeName = (name) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

module.exports = async (request, response) => {
  if (request.method !== "POST") {
    return sendJson(response, 405, { error: "Método não permitido." });
  }

  if (!isConfigured()) {
    return sendJson(response, 500, {
      error: "API administrativa não configurada. Defina ADMIN_PASSWORD, GITHUB_TOKEN, GITHUB_OWNER e GITHUB_REPO no deploy.",
    });
  }

  if (!requireAdmin(request, response)) return;

  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const requestBuffer = Buffer.concat(chunks);
  const contentType = request.headers["content-type"] || "";
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  const boundary = boundaryMatch?.[1] || boundaryMatch?.[2];

  if (!boundary) return sendJson(response, 400, { error: "Documento não enviado." });

  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const boundaryIndex = requestBuffer.indexOf(boundaryBuffer);
  const headerStart = requestBuffer.indexOf(Buffer.from("\r\n"), boundaryIndex) + 2;
  const headerEnd = requestBuffer.indexOf(Buffer.from("\r\n\r\n"), headerStart);
  const headers = requestBuffer.slice(headerStart, headerEnd).toString("utf8");
  const fileStart = headerEnd + 4;
  const fileEnd = requestBuffer.indexOf(Buffer.from(`\r\n--${boundary}`), fileStart);
  const fileBuffer = requestBuffer.slice(fileStart, fileEnd);
  const filename = headers.match(/filename="([^"]+)"/i)?.[1] || "documento";
  const fileType = headers.match(/content-type:\s*([^\r\n]+)/i)?.[1]?.trim().toLowerCase() || "";
  const extension = allowedTypes.get(fileType);

  if (!extension) {
    return sendJson(response, 400, { error: "Envie um documento PDF, JPG, PNG ou WEBP." });
  }

  if (fileBuffer.length > 4 * 1024 * 1024) {
    return sendJson(response, 400, { error: "O documento deve ter no máximo 4 MB." });
  }

  const baseName = sanitizeName(filename.replace(/\.[^.]+$/, "")) || "documento";
  const path = `documents/prestacao-contas/${Date.now()}-${baseName}.${extension}`;

  await writeGithubFile(
    path,
    fileBuffer.toString("base64"),
    "Adiciona documento de prestação de contas",
    null
  );

  return sendJson(response, 200, { branch, documentUrl: path });
};
