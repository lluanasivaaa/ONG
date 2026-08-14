const loginPanel = document.querySelector("#login-panel");
const loginForm = document.querySelector("#login-form");
const loginMessage = document.querySelector("#login-message");
const workspace = document.querySelector("#admin-workspace");
const recordForm = document.querySelector("#record-form");
const formMessage = document.querySelector("#form-message");
const recordsTable = document.querySelector("#admin-records-table");
const yearFilter = document.querySelector("#admin-year-filter");
const periodFilter = document.querySelector("#admin-period-filter");
const clearFormButton = document.querySelector("#clear-form");
let adminPassword = "";
let records = [];

// Check sessionStorage for authentication state (persistent only during session)
const getStoredAuth = () => sessionStorage.getItem("adminAuthToken");
const setStoredAuth = (token) => sessionStorage.setItem("adminAuthToken", token);
const clearStoredAuth = () => sessionStorage.removeItem("adminAuthToken");

const setAdminView = (isAuthenticated) => {
  if (!loginPanel || !workspace) return;
  
  const blocker = document.getElementById("admin-auth-blocker");
  
  if (isAuthenticated) {
    // SHOW ADMIN WORKSPACE - Remove blocker completely
    loginPanel.hidden = true;
    loginPanel.style.display = "none";
    loginPanel.style.visibility = "hidden";
    loginPanel.setAttribute("aria-hidden", "true");
    
    workspace.hidden = false;
    workspace.style.display = "grid";
    workspace.style.visibility = "visible";
    workspace.setAttribute("aria-hidden", "false");
    
    // HIDE blocker using class
    if (blocker) {
      blocker.classList.add("hidden");
      blocker.style.cssText = "display: none !important; visibility: hidden !important; pointer-events: none !important; z-index: -999999 !important;";
    }
    
    // Allow scrolling
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";
  } else {
    // SHOW LOGIN PANEL ONLY - SHOW blocker
    loginPanel.hidden = false;
    loginPanel.style.display = "block";
    loginPanel.style.visibility = "visible";
    loginPanel.setAttribute("aria-hidden", "false");
    
    workspace.hidden = true;
    workspace.style.display = "none";
    workspace.style.visibility = "hidden";
    workspace.setAttribute("aria-hidden", "true");
    
    // SHOW blocker using class
    if (blocker) {
      blocker.classList.remove("hidden");
      blocker.style.cssText = "position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100vw !important; height: 100vh !important; background: #ffffff !important; z-index: 9999999 !important; display: flex !important; align-items: center !important; justify-content: center !important; pointer-events: auto !important;";
    }
    
    // Prevent scrolling
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    
    // Ensure no data leaks when not authenticated
    adminPassword = "";
    records = [];
    recordsTable.innerHTML = '<tr><td colspan="6">Nenhum registro informado até o momento.</td></tr>';
  }
};

const fields = {
  id: document.querySelector("#record-id"),
  year: document.querySelector("#record-year"),
  period: document.querySelector("#record-period"),
  source: document.querySelector("#record-source"),
  amount: document.querySelector("#record-amount"),
  description: document.querySelector("#record-description"),
  document: document.querySelector("#record-document"),
};

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatCurrency = (value) => {
  const digits = value.replace(/\D/g, "");
  const amount = Number(digits || 0) / 100;
  return amount.toLocaleString("pt-BR", { currency: "BRL", style: "currency" });
};

const apiFetch = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${adminPassword}`,
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Não foi possível concluir a operação.");
  return payload;
};

const sortRecords = (items) =>
  [...items].sort((first, second) => {
    const yearDiff = Number(second.year || 0) - Number(first.year || 0);
    if (yearDiff) return yearDiff;
    return String(first.period || "").localeCompare(String(second.period || ""), "pt-BR", { numeric: true });
  });

const resetForm = () => {
  recordForm.reset();
  fields.id.value = "";
  fields.year.value = new Date().getFullYear();
  formMessage.textContent = "";
};

const uploadDocument = async (file) => {
  if (!file) return "";

  const body = new FormData();
  body.append("document", file);
  const payload = await apiFetch("/api/upload-documento", { method: "POST", body });
  return payload.documentUrl;
};

const updateFilters = () => {
  const selectedYear = yearFilter.value;
  const selectedPeriod = periodFilter.value;
  const years = [...new Set(records.map((record) => String(record.year)).filter(Boolean))].sort(
    (first, second) => Number(second) - Number(first)
  );
  const periods = [...new Set(records.map((record) => record.period).filter(Boolean))].sort((first, second) =>
    first.localeCompare(second, "pt-BR", { numeric: true })
  );

  yearFilter.innerHTML = '<option value="">Todos</option>';
  years.forEach((year) => yearFilter.insertAdjacentHTML("beforeend", `<option value="${escapeHtml(year)}">${escapeHtml(year)}</option>`));

  periodFilter.innerHTML = '<option value="">Todos</option>';
  periods.forEach((period) =>
    periodFilter.insertAdjacentHTML("beforeend", `<option value="${escapeHtml(period)}">${escapeHtml(period)}</option>`)
  );

  yearFilter.value = years.includes(selectedYear) ? selectedYear : "";
  periodFilter.value = periods.includes(selectedPeriod) ? selectedPeriod : "";
};

const getVisibleRecords = () =>
  records.filter(
    (record) =>
      (!yearFilter.value || String(record.year) === yearFilter.value) &&
      (!periodFilter.value || record.period === periodFilter.value)
  );

const renderRecords = () => {
  const visibleRecords = getVisibleRecords();

  if (!visibleRecords.length) {
    recordsTable.innerHTML = '<tr><td colspan="6">Nenhum registro informado até o momento.</td></tr>';
    return;
  }

  recordsTable.innerHTML = visibleRecords
    .map(
      (record) => `
        <tr>
          <td>${escapeHtml(record.year)}</td>
          <td>${escapeHtml(record.period)}</td>
          <td>${escapeHtml(record.source)}</td>
          <td>${escapeHtml(record.amount)}</td>
          <td>${
            record.documentUrl
              ? `<a class="document-link" href="/api/documento?path=${encodeURIComponent(record.documentUrl)}" target="_blank" rel="noopener">Abrir</a>`
              : "Não informado"
          }</td>
          <td class="admin-actions">
            <button type="button" class="btn-icon" data-action="edit" data-id="${escapeHtml(record.id)}" aria-label="Editar"><i class="fa-solid fa-pen"></i></button>
            <button type="button" class="btn-icon danger" data-action="delete" data-id="${escapeHtml(record.id)}" aria-label="Excluir"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
      `
    )
    .join("");
};

const loadRecords = async () => {
  const payload = await apiFetch("/api/prestacoes");
  records = sortRecords(Array.isArray(payload.records) ? payload.records : []);
  updateFilters();
  renderRecords();
};

const showWorkspace = async () => {
  setAdminView(true);
  resetForm();
  await loadRecords();
};

// SEMPRE mostrar a tela de login ao acessar a página
// Nunca validar automaticamente um token anterior
setAdminView(false);

// Adicionar garantia CRÍTICA: se o blocker desaparecer sem autenticação, trazer de volta
setInterval(() => {
  const blocker = document.getElementById("admin-auth-blocker");
  const isLoggedIn = adminPassword && adminPassword.trim() !== "";
  
  if (!isLoggedIn && blocker) {
    // Se não está autenticado, blocker DEVE estar visível
    if (!blocker.classList.contains("hidden")) {
      blocker.classList.remove("hidden");
      blocker.style.cssText = "position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100vw !important; height: 100vh !important; background: #ffffff !important; z-index: 9999999 !important; display: flex !important; align-items: center !important; justify-content: center !important; pointer-events: auto !important; overflow: hidden !important;";
    }
    // Garantir que workspace está escondido
    if (workspace && (workspace.style.display !== "none" || workspace.hidden === false)) {
      workspace.style.display = "none";
      workspace.hidden = true;
    }
  }
}, 100);

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  adminPassword = document.querySelector("#admin-password").value;
  loginMessage.textContent = "Validando acesso...";

  try {
    await apiFetch("/api/admin-auth", { method: "POST" });
    loginMessage.textContent = "";
    
    // Store auth token in sessionStorage (survives page refresh but not closing the tab)
    setStoredAuth(adminPassword);
    
    await showWorkspace();
    
    // Double check: remove blocker immediately
    const blocker = document.getElementById("admin-auth-blocker");
    if (blocker) {
      blocker.classList.add("hidden");
      blocker.style.cssText = "display: none !important; visibility: hidden !important; pointer-events: none !important; z-index: -999999 !important;";
    }
  } catch (error) {
    adminPassword = "";
    clearStoredAuth();
    loginMessage.textContent = error.message;
    
    // Double check: ensure blocker is visible on error
    const blocker = document.getElementById("admin-auth-blocker");
    if (blocker) {
      blocker.classList.remove("hidden");
      blocker.style.cssText = "position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100vw !important; height: 100vh !important; background: #ffffff !important; z-index: 9999999 !important; display: flex !important; align-items: center !important; justify-content: center !important; pointer-events: auto !important; overflow: hidden !important;";
    }
  }
});

recordForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  formMessage.textContent = "Salvando registro...";

  try {
    const existingRecord = records.find((record) => record.id === fields.id.value);
    const documentUrl = fields.document.files[0] ? await uploadDocument(fields.document.files[0]) : existingRecord?.documentUrl || "";
    const record = {
      amount: fields.amount.value,
      description: fields.description.value.trim(),
      documentUrl,
      id: fields.id.value,
      period: fields.period.value,
      source: fields.source.value,
      year: fields.year.value,
    };

    const method = record.id ? "PUT" : "POST";
    const payload = await apiFetch("/api/prestacoes", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });

    records = sortRecords(payload.records);
    updateFilters();
    renderRecords();
    resetForm();
    formMessage.textContent = "Registro salvo com sucesso.";
  } catch (error) {
    formMessage.textContent = error.message;
  }
});

recordsTable.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const record = records.find((item) => item.id === button.dataset.id);
  if (!record) return;

  if (button.dataset.action === "edit") {
    fields.id.value = record.id;
    fields.year.value = record.year;
    fields.period.value = record.period;
    fields.source.value = record.source;
    fields.amount.value = record.amount;
    fields.description.value = record.description || "";
    fields.document.value = "";
    formMessage.textContent = "Editando registro selecionado.";
    recordForm.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (button.dataset.action === "delete" && confirm("Excluir esta prestação de contas?")) {
    const payload = await apiFetch(`/api/prestacoes?id=${encodeURIComponent(record.id)}`, { method: "DELETE" });
    records = sortRecords(payload.records);
    updateFilters();
    renderRecords();
  }
});

[yearFilter, periodFilter].forEach((filter) => filter.addEventListener("change", renderRecords));

clearFormButton.addEventListener("click", resetForm);

fields.amount.addEventListener("input", () => {
  fields.amount.value = formatCurrency(fields.amount.value);
});

// Logout functionality
const logoutBtn = document.querySelector("#logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    clearStoredAuth();
    adminPassword = "";
    records = [];
    
    // Garantir que blocker fica visível
    const blocker = document.getElementById("admin-auth-blocker");
    if (blocker) {
      blocker.classList.remove("hidden");
      blocker.style.cssText = "position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100vw !important; height: 100vh !important; background: #ffffff !important; z-index: 9999999 !important; display: flex !important; align-items: center !important; justify-content: center !important; pointer-events: auto !important; overflow: hidden !important;";
    }
    
    setAdminView(false);
    document.querySelector("#admin-password").value = "";
    loginMessage.textContent = "Desconectado com sucesso.";
  });
}
