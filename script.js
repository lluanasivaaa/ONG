const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const backToTop = document.querySelector(".back-to-top");
const fadeElements = document.querySelectorAll(".fade-in");
const copyPixButton = document.querySelector(".copy-pix");
const contactButton = document.querySelector(".contact-form button");
const transparencyTable = document.querySelector("#transparency-table");
const transparencyYearFilter = document.querySelector("#transparency-year-filter");
const transparencyPeriodFilter = document.querySelector("#transparency-period-filter");
const transparencyDataSources = ["/api/prestacoes", "data/prestacao-contas.json"];
let transparencyRecords = [];

// Controla o menu hamburguer no mobile.
if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("active");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

// Fecha o menu depois que um link é escolhido.
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks?.classList.remove("active");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

// Revela elementos com fade-in ao entrar na área visível.
const revealOnScroll = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealOnScroll.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

fadeElements.forEach((element) => revealOnScroll.observe(element));

// Exibe o botão de voltar ao topo após rolagem.
if (backToTop) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 520) {
      backToTop.classList.add("show");
    } else {
      backToTop.classList.remove("show");
    }
  });

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

if (copyPixButton) {
  copyPixButton.addEventListener("click", async () => {
    const pixKey = copyPixButton.dataset.pix;

    try {
      await navigator.clipboard.writeText(pixKey);
    } catch {
      const tempInput = document.createElement("input");
      tempInput.value = pixKey;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      tempInput.remove();
    }

    copyPixButton.innerHTML = '<i class="fa-solid fa-check"></i> PIX copiado';
    setTimeout(() => {
      copyPixButton.innerHTML = '<i class="fa-solid fa-copy"></i> Copiar PIX';
    }, 2600);
  });
}

if (contactButton) {
  contactButton.addEventListener("click", () => {
    alert("Formulário demonstrativo. Entre em contato pelo WhatsApp para falar com a ONG.");
  });
}

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const normalizeTransparencyRecords = (payload) => {
  const records = Array.isArray(payload) ? payload : payload.records;
  return Array.isArray(records) ? records : [];
};

const getRecordYear = (record) => String(record.year || record.ano || "");

const getRecordPeriod = (record) => record.period || record.bimestre || "";

const getRecordSource = (record) => record.source || record.origem || "";

const getRecordAmount = (record) => record.amount || record.valor || "";

const getRecordDescription = (record) => record.description || record.descricao || "Sem descrição informada.";

const getRecordDocument = (record) => record.documentUrl || record.documentoUrl || record.document || "";

const sortTransparencyRecords = (records) =>
  [...records].sort((first, second) => {
    const yearDiff = Number(getRecordYear(second) || 0) - Number(getRecordYear(first) || 0);
    if (yearDiff) return yearDiff;

    return getRecordPeriod(first).localeCompare(getRecordPeriod(second), "pt-BR", { numeric: true });
  });

const loadTransparencyRecords = async () => {
  for (const source of transparencyDataSources) {
    try {
      const response = await fetch(source, { cache: "no-store" });
      if (!response.ok) continue;

      const payload = await response.json();
      return normalizeTransparencyRecords(payload);
    } catch {
      // Tenta a próxima origem configurada.
    }
  }

  return [];
};

const updateTransparencyFilters = () => {
  if (!transparencyYearFilter || !transparencyPeriodFilter) return;

  const selectedYear = transparencyYearFilter.value;
  const selectedPeriod = transparencyPeriodFilter.value;
  const years = [...new Set(transparencyRecords.map(getRecordYear).filter(Boolean))].sort(
    (first, second) => Number(second) - Number(first)
  );
  const periods = [...new Set(transparencyRecords.map(getRecordPeriod).filter(Boolean))].sort((first, second) =>
    first.localeCompare(second, "pt-BR", { numeric: true })
  );

  transparencyYearFilter.innerHTML = '<option value="">Todos os anos</option>';
  years.forEach((year) => {
    transparencyYearFilter.insertAdjacentHTML("beforeend", `<option value="${escapeHtml(year)}">${escapeHtml(year)}</option>`);
  });

  transparencyPeriodFilter.innerHTML = '<option value="">Todos os bimestres</option>';
  periods.forEach((period) => {
    transparencyPeriodFilter.insertAdjacentHTML("beforeend", `<option value="${escapeHtml(period)}">${escapeHtml(period)}</option>`);
  });

  transparencyYearFilter.value = years.includes(selectedYear) ? selectedYear : "";
  transparencyPeriodFilter.value = periods.includes(selectedPeriod) ? selectedPeriod : "";
};

const getFilteredTransparencyRecords = () =>
  transparencyRecords.filter((record) => {
    const year = getRecordYear(record);
    const period = getRecordPeriod(record);

    return (
      (!transparencyYearFilter?.value || year === transparencyYearFilter.value) &&
      (!transparencyPeriodFilter?.value || period === transparencyPeriodFilter.value)
    );
  });

const renderTransparencyRecords = () => {
  if (!transparencyTable) return;

  const records = getFilteredTransparencyRecords();

  if (!records.length) {
    transparencyTable.innerHTML = '<tr><td colspan="6">Nenhum registro informado até o momento.</td></tr>';
    return;
  }

  transparencyTable.innerHTML = records
    .map((record) => {
      const documentUrl = getRecordDocument(record);
      const documentLink = documentUrl
        ? `<a class="document-link" href="${escapeHtml(documentUrl)}" target="_blank" rel="noopener"><i class="fa-solid fa-file-lines"></i> Abrir</a>`
        : "Não informado";

      return `
        <tr>
          <td>${escapeHtml(getRecordYear(record))}</td>
          <td>${escapeHtml(getRecordPeriod(record))}</td>
          <td>${escapeHtml(getRecordSource(record))}</td>
          <td>${escapeHtml(getRecordAmount(record))}</td>
          <td>${escapeHtml(getRecordDescription(record))}</td>
          <td>${documentLink}</td>
        </tr>
      `;
    })
    .join("");
};

if (transparencyTable) {
  [transparencyYearFilter, transparencyPeriodFilter].forEach((filter) => {
    filter?.addEventListener("change", renderTransparencyRecords);
  });

  loadTransparencyRecords().then((records) => {
    transparencyRecords = sortTransparencyRecords(records);
    updateTransparencyFilters();
    renderTransparencyRecords();
  });
}
