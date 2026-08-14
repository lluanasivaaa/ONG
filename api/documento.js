const { branch, isConfigured, owner, repo, sendJson } = require("./_github");

module.exports = async (request, response) => {
  if (request.method !== "GET") {
    return sendJson(response, 405, { error: "Método não permitido." });
  }

  const { searchParams } = new URL(request.url, `https://${request.headers.host || "localhost"}`);
  const path = searchParams.get("path");

  if (!path) {
    return sendJson(response, 400, { error: "Caminho do documento não informado." });
  }

  if (!isConfigured()) {
    return sendJson(response, 500, { error: "API administrativa não configurada." });
  }

  try {
    const cleanPath = String(path).replace(/^\/+/, "");
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${encodeURI(cleanPath)}`;
    const fileResponse = await fetch(rawUrl, { cache: "no-store" });

    if (!fileResponse.ok) {
      throw new Error("Documento não encontrado.");
    }

    const fileBuffer = Buffer.from(await fileResponse.arrayBuffer());
    const extension = cleanPath.split(".").pop()?.toLowerCase();
    const contentType = (() => {
      if (extension === "pdf") return "application/pdf";
      if (["png", "webp"].includes(extension)) return `image/${extension}`;
      if (["jpg", "jpeg"].includes(extension)) return "image/jpeg";
      return "application/octet-stream";
    })();

    response.statusCode = 200;
    response.setHeader("Content-Type", contentType);
    response.setHeader("Content-Disposition", `inline; filename="${cleanPath.split('/').pop()}"`);
    response.setHeader("Cache-Control", "no-store");
    response.end(fileBuffer);
  } catch (error) {
    sendJson(response, 404, { error: "Documento não encontrado." });
  }
};
