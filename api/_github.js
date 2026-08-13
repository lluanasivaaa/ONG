const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const branch = process.env.GITHUB_BRANCH || "main";
const token = process.env.GITHUB_TOKEN;
const adminPassword = process.env.ADMIN_PASSWORD;

const dataPath = "data/prestacao-contas.json";

const sendJson = (response, status, payload) => {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
};

const isConfigured = () => Boolean(owner && repo && token && adminPassword);

const requireAdmin = (request, response) => {
  const authorization = request.headers.authorization || "";
  const password = authorization.replace(/^Bearer\s+/i, "");

  if (!adminPassword || password !== adminPassword) {
    sendJson(response, 401, { error: "Acesso administrativo não autorizado." });
    return false;
  }

  return true;
};

const githubRequest = async (path, options = {}) => {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "Falha ao acessar o repositório.");
  }

  return payload;
};

const toBase64 = (content) => Buffer.from(content, "utf8").toString("base64");

const fromBase64 = (content) => Buffer.from(content || "", "base64").toString("utf8");

const readGithubFile = async (path) => {
  const payload = await githubRequest(`${path}?ref=${encodeURIComponent(branch)}`);
  return {
    content: fromBase64(payload.content),
    sha: payload.sha,
  };
};

const writeGithubFile = async (path, content, message, sha) =>
  githubRequest(path, {
    method: "PUT",
    body: JSON.stringify({
      branch,
      content,
      message,
      ...(sha ? { sha } : {}),
    }),
  });

const readRecords = async () => {
  try {
    const file = await readGithubFile(dataPath);
    const payload = JSON.parse(file.content);
    return {
      records: Array.isArray(payload.records) ? payload.records : [],
      sha: file.sha,
    };
  } catch (error) {
    if (/Not Found/i.test(error.message)) return { records: [], sha: null };
    throw error;
  }
};

const writeRecords = async (records, sha) =>
  writeGithubFile(
    dataPath,
    toBase64(`${JSON.stringify({ records }, null, 2)}\n`),
    "Atualiza prestação de contas",
    sha
  );

const parseRequestBody = async (request) => {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const body = Buffer.concat(chunks).toString("utf8");
  return body ? JSON.parse(body) : {};
};

module.exports = {
  branch,
  dataPath,
  githubRequest,
  isConfigured,
  parseRequestBody,
  readRecords,
  requireAdmin,
  sendJson,
  toBase64,
  writeGithubFile,
  writeRecords,
};
