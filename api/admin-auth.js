const { isConfigured, requireAdmin, sendJson } = require("./_github");

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

  return sendJson(response, 200, { ok: true });
};
