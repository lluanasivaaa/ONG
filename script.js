const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const backToTop = document.querySelector(".back-to-top");
const fadeElements = document.querySelectorAll(".fade-in");
const copyPixButton = document.querySelector(".copy-pix");
const contactButton = document.querySelector(".contact-form button");
const transparencyForm = document.querySelector(".transparency-form");
const transparencyTable = document.querySelector("#transparency-table");
const transparencyStorageKey = "ong-transparency-records";

// Controla o menu hamburguer no mobile.
menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("active");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

// Fecha o menu depois que um link é escolhido.
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
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

const formatCurrency = (value) => {
  const digits = value.replace(/\D/g, "");
  const amount = Number(digits || 0) / 100;

  return amount.toLocaleString("pt-BR", {
    currency: "BRL",
    style: "currency",
  });
};

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const getTransparencyRecords = () => {
  try {
    return JSON.parse(localStorage.getItem(transparencyStorageKey)) || [];
  } catch {
    return [];
  }
};

const renderTransparencyRecords = () => {
  if (!transparencyTable) return;

  const records = getTransparencyRecords();

  if (!records.length) {
    transparencyTable.innerHTML = '<tr><td colspan="5">Nenhum registro informado até o momento.</td></tr>';
    return;
  }

  transparencyTable.innerHTML = records
    .map(
      (record) => `
        <tr>
          <td>${escapeHtml(record.period)}</td>
          <td>${escapeHtml(record.year)}</td>
          <td>${escapeHtml(record.source)}</td>
          <td>${escapeHtml(record.amount)}</td>
          <td>${escapeHtml(record.description || "Sem descrição informada.")}</td>
        </tr>
      `
    )
    .join("");
};

if (transparencyForm) {
  const amountInput = transparencyForm.querySelector("#transparency-amount");

  amountInput.addEventListener("input", () => {
    amountInput.value = formatCurrency(amountInput.value);
  });

  transparencyForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const records = getTransparencyRecords();
    records.unshift({
      amount: transparencyForm.querySelector("#transparency-amount").value,
      description: transparencyForm.querySelector("#transparency-description").value.trim(),
      period: transparencyForm.querySelector("#transparency-period").value,
      source: transparencyForm.querySelector("#transparency-source").value,
      year: transparencyForm.querySelector("#transparency-year").value,
    });

    localStorage.setItem(transparencyStorageKey, JSON.stringify(records));
    transparencyForm.reset();
    transparencyForm.querySelector("#transparency-year").value = new Date().getFullYear();
    renderTransparencyRecords();
  });

  renderTransparencyRecords();
}
