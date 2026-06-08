const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const backToTop = document.querySelector(".back-to-top");
const fadeElements = document.querySelectorAll(".fade-in");
const copyPixButton = document.querySelector(".copy-pix");
const contactButton = document.querySelector(".contact-form button");

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
