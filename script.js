/* ==========================================================
   DL MEDIA PRO — Interactividad, Mandi IA Chat y Usabilidad
   ========================================================== */
const CONFIG = {
  // Número de WhatsApp con código de país (Perú +51)
  whatsapp: "51936372861",
  brand: "DL Media Pro",
  buddyIdleMessage: "¡Hola! Soy Mandi 🍊 Tócame para chatear o ayudarte a redactar tu cotización.",
};

document.addEventListener("DOMContentLoaded", () => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const waLink = (text) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;

  /* ---------- 1. Año dinámico en footer ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 2. Menú móvil accesible ---------- */
  const menuToggle = $("#menu-toggle");
  const mainNav = $("#main-nav");
  const menuIcon = $("#menu-icon-state");

  const setMenu = (open) => {
    if (!mainNav || !menuToggle) return;
    mainNav.classList.toggle("nav-open", open);
    menuIcon?.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Cerrar menú de navegación" : "Abrir menú de navegación");
  };

  menuToggle?.addEventListener("click", () => setMenu(!mainNav.classList.contains("nav-open")));
  $$("a", mainNav || document.createElement("div")).forEach((l) => {
    l.addEventListener("click", () => setMenu(false));
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });

  /* ---------- 3. Aparición suave de elementos al hacer scroll ---------- */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    const groups = new Map();
    reveals.forEach((el) => {
      const key = el.parentElement;
      const i = groups.get(key) || 0;
      groups.set(key, i + 1);
      el.style.transitionDelay = `${Math.min(i, 5) * 60}ms`;
      io.observe(el);
    });
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ---------- 4. Scroll: barra de progreso, header y parallax ---------- */
  const header = $("#site-header");
  const progress = $("#scroll-progress");
  const parallaxEls = $$("[data-speed]");
  const rotateEls = $$("[data-rotate]");

  const updateScroll = () => {
    const y = window.scrollY;
    const h = window.innerHeight;
    const max = document.documentElement.scrollHeight - h;
    const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;

    if (progress) progress.style.transform = `scaleX(${p})`;
    header?.classList.toggle("is-scrolled", y > 20);

    // Parallax ambiental sutil
    if (!reduceMotion) {
      const factor = window.innerWidth < 700 ? 0.4 : 1;
      parallaxEls.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > h + 200) return;
        const offset = (h / 2 - (r.top + r.height / 2)) * parseFloat(el.dataset.speed) * factor;
        el.style.translate = `0 ${offset.toFixed(1)}px`;
      });
      rotateEls.forEach((el) => {
        el.style.rotate = `${(y * parseFloat(el.dataset.rotate)).toFixed(1)}deg`;
      });
    }
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateScroll();
      ticking = false;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateScroll();

  /* ---------- 5. Mandi: Mascota con burbuja y control de visibilidad ---------- */
  const buddyWrapper = $("#buddy-wrapper");
  const buddyBubble = $("#buddy-bubble");
  const buddyBtn = $("#buddy");
  const buddyHideBtn = $("#buddy-hide-btn");
  const buddyReopenBtn = $("#buddy-reopen-btn");
  const sections = $$("section[data-buddy]");
  let currentSection = null;
  let bubbleTimer = null;

  const sayMandi = (text, ms = 4200) => {
    if (!buddyBubble || !text || buddyWrapper?.classList.contains("is-hidden")) return;
    buddyBubble.textContent = text;
    buddyBubble.classList.add("show");
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => buddyBubble.classList.remove("show"), ms);
  };

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.dataset.buddy) {
          if (entry.target !== currentSection) {
            currentSection = entry.target;
            sayMandi(entry.target.dataset.buddy);
          }
        }
      });
    }, { threshold: 0.35 });

    sections.forEach((s) => sectionObserver.observe(s));
  }

  // Ocultar mascota
  buddyHideBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (buddyWrapper) buddyWrapper.classList.add("is-hidden");
    if (buddyReopenBtn) buddyReopenBtn.hidden = false;
    sessionStorage.setItem("dl_mandi_hidden", "1");
  });

  // Reabrir mascota o abrir chat
  buddyReopenBtn?.addEventListener("click", () => {
    if (buddyWrapper) buddyWrapper.classList.remove("is-hidden");
    if (buddyReopenBtn) buddyReopenBtn.hidden = true;
    sessionStorage.removeItem("dl_mandi_hidden");
    openChat();
  });

  if (sessionStorage.getItem("dl_mandi_hidden") === "1") {
    if (buddyWrapper) buddyWrapper.classList.add("is-hidden");
    if (buddyReopenBtn) buddyReopenBtn.hidden = false;
  } else {
    setTimeout(() => sayMandi(CONFIG.buddyIdleMessage, 5000), 2200);
  }

  /* ---------- 6. Mandi IA: Chatbot Interactivo y Generador de Briefs ---------- */
  const chatWidget = $("#mandi-chat-widget");
  const chatCloseBtn = $("#chat-close-btn");
  const chatMessages = $("#chat-messages");
  const chatForm = $("#chat-form");
  const chatInput = $("#chat-input");
  const chatTyping = $("#chat-typing");
  const chatBody = $("#chat-body");

  const openChat = () => {
    if (!chatWidget) return;
    chatWidget.classList.add("is-open");
    chatWidget.setAttribute("aria-hidden", "false");
    setTimeout(() => chatInput?.focus(), 250);
  };

  const closeChat = () => {
    if (!chatWidget) return;
    chatWidget.classList.remove("is-open");
    chatWidget.setAttribute("aria-hidden", "true");
  };

  buddyBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    openChat();
  });

  chatCloseBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    closeChat();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && chatWidget?.classList.contains("is-open")) {
      closeChat();
    }
  });

  const scrollChatBottom = () => {
    if (chatBody) {
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  };

  const addUserMessage = (text) => {
    const msg = document.createElement("div");
    msg.className = "chat-msg user";
    msg.innerHTML = `<div class="msg-bubble"><p>${escapeHtml(text)}</p></div>`;
    chatMessages?.appendChild(msg);
    scrollChatBottom();
  };

  const addBotMessage = (htmlContent) => {
    const msg = document.createElement("div");
    msg.className = "chat-msg bot";
    msg.innerHTML = `
      <div class="msg-avatar">🍊</div>
      <div class="msg-bubble">${htmlContent}</div>
    `;
    chatMessages?.appendChild(msg);
    scrollChatBottom();
  };

  const escapeHtml = (str) => {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  // Motor conversacional con la voz de DL Media Pro y Generador de Briefs
  const processMandiAI = (userInput) => {
    const raw = userInput.trim();
    const q = raw.toLowerCase();

    // 1. Detección de intención: Redacción de Brief o idea de negocio
    const isBriefRequest =
      q.includes("redact") ||
      q.includes("brief") ||
      q.includes("idea") ||
      q.includes("vendo") ||
      q.includes("tengo un") ||
      q.includes("tengo una") ||
      q.includes("mi negocio") ||
      q.includes("soy ") ||
      q.includes("tienda") ||
      q.includes("clinica") ||
      q.includes("clínica") ||
      q.includes("inmobiliari") ||
      q.includes("asesor") ||
      q.includes("marca") ||
      q.includes("producto") ||
      q.includes("servicio") ||
      q.includes("restaurante") ||
      q.includes("ropa");

    if (isBriefRequest) {
      // Si solo pidió ayuda genérica sin dar detalles de su negocio
      if (q === "✨ ayúdame a redactar mi idea para cotizar" || q === "redactar mi brief" || q === "ayúdame a redactar") {
        return `
          <p>¡Claro que sí! 🚀 Cuéntame en una frase:</p>
          <p><strong>¿Qué producto o servicio vendes y cuál es tu meta?</strong></p>
          <p><em>(Por ejemplo: "Vendo ropa femenina en Surco y quiero vender por TikTok" o "Soy dentista y busco pacientes para implantes").</em></p>
          <p>Con eso te estructuro el requerimiento comercial ideal listo para pegar en tu cotización.</p>
        `;
      }

      // Estructuración automática del Brief Comercial
      const detectedTopic = raw.length > 50 ? raw.slice(0, 80) + "..." : raw;
      const formattedBrief = `Negocio/Rubro: ${raw}\nMeta comercial: Aumentar ventas y retención de clientes con videos de alto impacto.\nEstrategia recomendada por DL Media Pro: Paquete de 7 a 15 videos (Reels dinámicos + Creadores UGC con IA).\nInversión sugerida: Paquete básico desde S/ 850 con guiones aprobados en 48 horas.`;

      const briefWaLink = waLink(`Hola DL Media Pro 👋, Mandi me ayudó a armar este brief para mi cotización:\n\n${formattedBrief}`);

      return `
        <p>¡Excelente! Con base en lo que me cuentas, he estructurado tu <strong>brief comercial ideal</strong> para que el equipo de <strong>DL Media Pro</strong> te arme la propuesta exacta:</p>
        
        <div class="brief-card">
          <h5>📋 Propuesta de Requerimiento:</h5>
          <ul>
            <li><strong>Tu negocio:</strong> ${escapeHtml(detectedTopic)}</li>
            <li><strong>Estrategia recomendada:</strong> Paquete mensual de 7 a 15 videos con ganchos comerciales.</li>
            <li><strong>Formatos clave:</strong> Creadores UGC con IA (reseñas creíbles) + Reels de alta retención.</li>
            <li><strong>Meta:</strong> Detener el scroll en redes, generar confianza y convertir en ventas.</li>
            <li><strong>Inversión estimada:</strong> Desde S/ 850 mensuales (guiones y estilo en 48 h).</li>
          </ul>
          <div class="brief-actions">
            <button type="button" class="btn-paste-form" data-brief="${escapeHtml(formattedBrief)}">
              📋 Pegar en mi Formulario de Cotización
            </button>
            <a class="btn btn-wa btn-brief-wa" href="${briefWaLink}" target="_blank" rel="noopener noreferrer">
              <svg><use href="#i-wa"/></svg> Enviar directamente por WhatsApp
            </a>
          </div>
        </div>
      `;
    }

    // 2. ¿Qué es UGC con IA?
    if (q.includes("ugc") || q.includes("creador virtual") || q.includes("creadores virtuales") || q.includes("selfie") || q.includes("reseña") || q.includes("testimonio")) {
      return `
        <p>El <strong>UGC (User Generated Content) con IA</strong> son videos estilo selfie donde <strong>Creadores Virtuales hiperrealistas</strong> recomiendan tu producto o servicio con un lenguaje cercano y creíble, pensado para TikTok y Meta Ads.</p>
        <p>💡 <strong>La diferencia con DL Media Pro:</strong> No usamos plantillas genéricas ni voces robóticas. Estructuramos guiones con ganchos psicológicos que detienen el scroll en los primeros 3 segundos y sincronización labial exacta en español. Así escalas tu contenido sin los costos ni la lentitud de contratar actores presenciales.</p>
        <p><em>¿Quieres que te preparemos un paquete de 7 a 15 videos UGC para tu producto?</em></p>
        <div class="chat-quick-chips">
          <button type="button" class="chat-chip chip-highlight" data-question="Ayúdame a redactar mi idea para cotizar">✨ Redactar mi brief UGC</button>
          <a class="chat-chip" href="${waLink("Hola DL Media Pro 👋, quiero cotizar videos UGC con creadores IA.")}" target="_blank" rel="noopener noreferrer">💬 Cotizar por WhatsApp</a>
        </div>
      `;
    }

    // 3. Avatares con IA / ¿Se ven reales?
    if (q.includes("avatar") || q.includes("avatares") || q.includes("presentador") || q.includes("rostro") || q.includes("falso") || q.includes("real")) {
      return `
        <p>Nuestros <strong>Avatares con IA</strong> son presentadores digitales hiperrealistas para educar, comunicar y vender en nombre de tu marca, sin que tú o tu equipo pasen horas frente a una cámara.</p>
        <p>💡 <strong>En DL Media Pro:</strong> Cuidamos la iluminación, la gesticulación natural y la entonación con acento en español neutro o peruano de alta credibilidad. Además, <strong>revisas y apruebas el estilo de tu avatar y los guiones en solo 48 horas</strong> antes de producir el paquete final.</p>
        <div class="chat-quick-chips">
          <button type="button" class="chat-chip chip-highlight" data-question="Ayúdame a redactar mi idea para cotizar">✨ Armar requerimiento de Avatar</button>
          <a class="chat-chip" href="${waLink("Hola DL Media Pro 👋, me interesan los Avatares con IA. ¿Me pueden enviar una muestra?")}" target="_blank" rel="noopener noreferrer">💬 Pedir demo por WhatsApp</a>
        </div>
      `;
    }

    // 4. Meta Ads, TikTok Ads y Google Ads
    if (q.includes("meta") || q.includes("ads") || q.includes("facebook") || q.includes("instagram") || q.includes("tiktok") || q.includes("google") || q.includes("publicidad") || q.includes("pauta") || q.includes("anuncio")) {
      return `
        <p>En publicidad digital moderna, <strong>el video creativo representa el 80% del éxito de tus campañas en Meta, TikTok y Google Ads</strong>.</p>
        <p>💡 <strong>Por qué con DL Media Pro vendes más:</strong> Los algoritmos castigan los anuncios repetitivos (fatiga publicitaria). Con nuestros paquetes de <strong>7 a 15 videos mensuales</strong> testeamos múltiples ganchos y ángulos de venta para bajar tu costo por cliente y hacer crecer tu negocio de forma rentable.</p>
        <div class="chat-quick-chips">
          <button type="button" class="chat-chip chip-highlight" data-question="Ayúdame a redactar mi idea para cotizar">✨ Redactar brief para Ads</button>
          <a class="chat-chip" href="${waLink("Hola DL Media Pro 👋, quiero videos de alta retención para mis campañas de Ads.")}" target="_blank" rel="noopener noreferrer">💬 Consultar por WhatsApp</a>
        </div>
      `;
    }

    // 5. Edición de video profesional
    if (q.includes("edicion") || q.includes("edición") || q.includes("editar") || q.includes("subtitulo") || q.includes("subtítulo") || q.includes("ritmo")) {
      return `
        <p>La <strong>edición de video profesional</strong> en DL Media Pro aplica ingeniería de retención: ganchos en los primeros 3 segundos, subtítulos cinemáticos modernos, ritmo dinámico y diseño de sonido que convierte visitas en clientes.</p>
        <p>💡 Editamos piezas para TikTok, Reels y YouTube Shorts asegurando que tu marca se vea 100% profesional y memorable.</p>
        <div class="chat-quick-chips">
          <button type="button" class="chat-chip" data-question="¿Cuánto cuesta el paquete básico de videos?">Ver precios</button>
          <a class="chat-chip" href="${waLink("Hola DL Media Pro 👋, tengo videos y quiero cotizar edición profesional.")}" target="_blank" rel="noopener noreferrer">💬 Cotizar edición</a>
        </div>
      `;
    }

    // 6. Precios, costos y tiempos de entrega
    if (q.includes("precio") || q.includes("costo") || q.includes("cuanto") || q.includes("cuánto") || q.includes("850") || q.includes("tiempo") || q.includes("demora") || q.includes("dias") || q.includes("días") || q.includes("paquete")) {
      return `
        <p>En <strong>DL Media Pro</strong> ofrecemos opciones transparentes y accesibles:</p>
        <p>💰 <strong>Paquete Básico:</strong> Inicia desde <strong>S/ 850 mensuales</strong>.<br>
        🎬 <strong>Volumen:</strong> Planes recomendados de <strong>7 a 15 videos al mes</strong>.<br>
        ⚡ <strong>Guiones y estilo:</strong> Aprobados en <strong>48 horas</strong>.<br>
        🚀 <strong>Entrega final:</strong> Listos para publicar en <strong>5 a 7 días hábiles</strong>.</p>
        <p>Atendemos Lima y todo el Perú 100% remoto con trato directo por WhatsApp.</p>
        <div class="chat-quick-chips">
          <button type="button" class="chat-chip chip-highlight" data-question="Ayúdame a redactar mi idea para cotizar">✨ Redactar mi cotización</button>
          <a class="chat-chip" href="${waLink("Hola DL Media Pro 👋, me interesa el paquete básico desde S/ 850. ¿Me envían la propuesta?")}" target="_blank" rel="noopener noreferrer">💬 Cotizar paquete S/ 850</a>
        </div>
      `;
    }

    // 7. Respuesta por defecto orientada a conversión
    return `
      <p>En <strong>DL Media Pro</strong> ayudamos a tu negocio a vender más combinando <strong>estrategia creativa, videos de alto impacto, Avatares con IA y Creadores UGC</strong>.</p>
      <p>💡 Cada pieza se diseña para que tu marca se vea profesional y aumente su facturación.</p>
      <p>Dime: <strong>¿Qué producto o servicio vendes?</strong> y te redacto una propuesta a tu medida en segundos.</p>
      <div class="chat-quick-chips">
        <button type="button" class="chat-chip" data-question="¿Qué es UGC con IA?">¿Qué es UGC con IA?</button>
        <button type="button" class="chat-chip" data-question="¿Cuánto cuesta el paquete básico de videos?">Precios y tiempos</button>
        <button type="button" class="chat-chip chip-highlight" data-question="Ayúdame a redactar mi idea para cotizar">✨ Redactar mi brief</button>
      </div>
    `;
  };

  const handleUserSubmission = (text) => {
    if (!text.trim()) return;
    addUserMessage(text);
    if (chatInput) chatInput.value = "";

    // Simular escritura de Mandi
    if (chatTyping) chatTyping.style.display = "flex";
    scrollChatBottom();

    setTimeout(() => {
      if (chatTyping) chatTyping.style.display = "none";
      const reply = processMandiAI(text);
      addBotMessage(reply);
    }, 750);
  };

  chatForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (chatInput && chatInput.value.trim()) {
      handleUserSubmission(chatInput.value);
    }
  });

  // Delegación de clics en chips del chat y botón para pegar en el formulario
  chatMessages?.addEventListener("click", (e) => {
    // 1. Clic en chip de pregunta rápida
    const chip = e.target.closest(".chat-chip");
    if (chip && chip.dataset.question) {
      e.preventDefault();
      handleUserSubmission(chip.dataset.question);
      return;
    }

    // 2. Clic en "Pegar en mi Formulario de Cotización"
    const pasteBtn = e.target.closest(".btn-paste-form");
    if (pasteBtn && pasteBtn.dataset.brief) {
      e.preventDefault();
      const briefContent = pasteBtn.dataset.brief;
      const messageField = $("#field-message");
      const serviceSelect = $("#field-service");
      const contactSection = $("#contacto");

      if (messageField) {
        messageField.value = briefContent;
        messageField.classList.remove("invalid");
        const err = $("#err-message");
        if (err) err.textContent = "";
      }

      if (serviceSelect) {
        if (briefContent.toLowerCase().includes("ugc")) {
          serviceSelect.value = "UGC con avatar IA";
        } else {
          serviceSelect.value = "Paquete básico de videos (S/ 850 - 7 a 15 videos)";
        }
        serviceSelect.classList.remove("invalid");
      }

      closeChat();

      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(() => {
          messageField?.focus();
          messageField?.classList.add("highlight-pulse");
          setTimeout(() => messageField?.classList.remove("highlight-pulse"), 1300);
        }, 450);
      }

      sayMandi("¡Listo! Ya pegué tu brief en el formulario abajo 👇", 4500);
    }
  });

  /* ---------- 7. Control de Video en Hero & Sonido ---------- */
  const heroScreen = $("#hero-screen");
  const heroVideo = $("#hero-video");
  const soundToggleBtn = $("#hero-sound-toggle");
  const iconMute = soundToggleBtn ? $(".icon-mute", soundToggleBtn) : null;
  const iconVolume = soundToggleBtn ? $(".icon-volume", soundToggleBtn) : null;

  if (heroVideo) {
    heroVideo.addEventListener("playing", () => heroScreen?.classList.add("has-video"));
    heroVideo.addEventListener("loadeddata", () => {
      if (heroVideo.readyState >= 2) heroScreen?.classList.add("has-video");
    });

    soundToggleBtn?.addEventListener("click", () => {
      if (!heroVideo) return;
      heroVideo.muted = !heroVideo.muted;
      const isMuted = heroVideo.muted;
      if (iconMute) iconMute.style.display = isMuted ? "block" : "none";
      if (iconVolume) iconVolume.style.display = isMuted ? "none" : "block";
      soundToggleBtn.setAttribute("aria-label", isMuted ? "Activar sonido del video" : "Silenciar video");
    });
  }

  /* ---------- 8. Videos de Formatos (preview al hover/focus) ---------- */
  $$(".project-media").forEach((card) => {
    const video = card.querySelector(".format-video");
    if (!video) return;

    video.addEventListener("loadeddata", () => {
      if (video.readyState >= 2) card.classList.add("has-video");
    });

    card.addEventListener("mouseenter", () => {
      if (video.src && video.readyState >= 2) {
        video.play().catch(() => {});
      }
    });
    card.addEventListener("mouseleave", () => {
      if (!video.paused) video.pause();
    });
  });

  /* ---------- 9. Selección interactiva de Servicios ---------- */
  const serviceSelect = $("#field-service");
  const contactSection = $("#contacto");

  const selectServiceAndScroll = (serviceName) => {
    if (!serviceSelect) return;

    const options = [...serviceSelect.options];
    const match = options.find((opt) =>
      opt.value.toLowerCase().includes(serviceName.toLowerCase()) ||
      opt.text.toLowerCase().includes(serviceName.toLowerCase())
    );

    if (match) {
      serviceSelect.value = match.value;
      serviceSelect.classList.remove("invalid");
      const err = $("#err-service");
      if (err) err.textContent = "";
    }

    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        serviceSelect.focus();
        serviceSelect.classList.add("highlight-pulse");
        setTimeout(() => serviceSelect.classList.remove("highlight-pulse"), 1200);
      }, 450);
    }
  };

  $$("[data-service-select]").forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      const serviceName = trigger.dataset.serviceSelect;
      if (serviceName) selectServiceAndScroll(serviceName);
    });
  });

  /* ---------- 10. Chips de Cobertura interactivos ---------- */
  const messageField = $("#field-message");
  $$(".chip-clickable").forEach((chip) => {
    chip.addEventListener("click", () => {
      const location = chip.dataset.location || chip.textContent.trim();
      if (messageField) {
        const currentVal = messageField.value.trim();
        const locNote = `[Ubicación: ${location}]`;
        if (!currentVal.includes(locNote)) {
          messageField.value = currentVal ? `${currentVal}\n${locNote} ` : `${locNote} `;
        }
        messageField.classList.remove("invalid");
        const err = $("#err-message");
        if (err) err.textContent = "";
      }

      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(() => messageField?.focus(), 450);
      }
    });
  });

  /* ---------- 11. Formulario: Validación Atómica & Captura Segura de Leads ---------- */
  const form = $("#contact-form");
  const successBox = $("#success-msg");
  const generalErrorBox = $("#error-msg");
  const manualWaBtn = $("#manual-wa-btn");

  const clearError = (fieldName) => {
    const field = form?.elements[fieldName];
    const errSpan = $(`#err-${fieldName}`);
    field?.classList.remove("invalid");
    if (errSpan) errSpan.textContent = "";
    if (generalErrorBox) generalErrorBox.hidden = true;
  };

  ["name", "phone", "service", "message"].forEach((fieldName) => {
    const field = form?.elements[fieldName];
    field?.addEventListener("input", () => clearError(fieldName));
    field?.addEventListener("change", () => clearError(fieldName));
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (successBox) successBox.hidden = true;
    if (generalErrorBox) generalErrorBox.hidden = true;

    // Validación Antispam Honeypot
    const honeypot = $("#company_website_url");
    if (honeypot && honeypot.value.trim() !== "") {
      if (successBox) successBox.hidden = false;
      return;
    }

    const data = new FormData(form);
    const name = (data.get("name") || "").toString().trim();
    const phone = (data.get("phone") || "").toString().trim();
    const brand = (data.get("brand") || "").toString().trim();
    const service = (data.get("service") || "").toString().trim();
    const message = (data.get("message") || "").toString().trim();

    let firstInvalid = null;

    if (!name) {
      const el = form.elements["name"];
      el.classList.add("invalid");
      const err = $("#err-name");
      if (err) err.textContent = "Por favor, ingresa tu nombre.";
      if (!firstInvalid) firstInvalid = el;
    } else {
      clearError("name");
    }

    const phoneDigits = phone.replace(/\D/g, "");
    if (!phone || phoneDigits.length < 7) {
      const el = form.elements["phone"];
      el.classList.add("invalid");
      const err = $("#err-phone");
      if (err) err.textContent = "Ingresa un número de WhatsApp o teléfono válido (mínimo 7 dígitos).";
      if (!firstInvalid) firstInvalid = el;
    } else {
      clearError("phone");
    }

    if (!service) {
      const el = form.elements["service"];
      el.classList.add("invalid");
      const err = $("#err-service");
      if (err) err.textContent = "Por favor, selecciona qué servicio o paquete deseas cotizar.";
      if (!firstInvalid) firstInvalid = el;
    } else {
      clearError("service");
    }

    if (!message || message.length < 5) {
      const el = form.elements["message"];
      el.classList.add("invalid");
      const err = $("#err-message");
      if (err) err.textContent = "Cuéntanos brevemente qué buscas impulsar para armarte la propuesta.";
      if (!firstInvalid) firstInvalid = el;
    } else {
      clearError("message");
    }

    if (firstInvalid) {
      firstInvalid.focus();
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const lines = [
      `Hola ${CONFIG.brand} 👋`,
      `Quiero cotizar una propuesta para mi marca:`,
      `• Nombre: ${name}`,
      `• Teléfono/WhatsApp: ${phone}`,
      brand ? `• Marca/Empresa: ${brand}` : null,
      `• Servicio/Paquete: ${service}`,
      `• Objetivo: ${message}`,
      ``,
      `¿Me pueden enviar los detalles y disponibilidad? Gracias.`
    ].filter(Boolean);

    const fullUrl = waLink(lines.join("\n"));

    if (manualWaBtn) manualWaBtn.href = fullUrl;
    if (successBox) successBox.hidden = false;

    const win = window.open(fullUrl, "_blank", "noopener,noreferrer");
    if (!win || win.closed || typeof win.closed === "undefined") {
      console.warn("Ventana emergente bloqueada. Utilizando enlace manual.");
    }
  });

  /* ---------- 12. Libro de Reclamaciones Virtual (INDECOPI - Ley N° 29571) ---------- */
  const modalLibro = $("#modal-libro");
  const openLibroBtn = $("#open-libro-btn");
  const openLibroLink = $("#open-libro-link");
  const closeLibroBtn = $("#close-libro-btn");
  const cancelLibroBtn = $("#btn-cancel-libro");
  const closeConstanciaBtn = $("#btn-close-constancia");
  const printConstanciaBtn = $("#btn-print-constancia");
  const libroForm = $("#libro-form");
  const libroFormView = $("#libro-form-view");
  const libroSuccessView = $("#libro-success-view");
  const recEsMenor = $("#rec-es-menor");
  const menorFields = $("#rec-menor-fields");
  const sheetDateEl = $("#libro-sheet-date");
  const sheetCodeEl = $("#libro-sheet-code");

  // Formato de fecha actual en Perú (DD/MM/AAAA)
  const getPeruDateFormatted = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const d = pad(now.getDate());
    const m = pad(now.getMonth() + 1);
    const y = now.getFullYear();
    const hh = pad(now.getHours());
    const mm = pad(now.getMinutes());
    return {
      dateOnly: `${d}/${m}/${y}`,
      fullDateTime: `${d}/${m}/${y} a las ${hh}:${mm} hrs`
    };
  };

  // Generador de folio correlativo único
  const getNextFolio = () => {
    const currentYear = new Date().getFullYear();
    const count = parseInt(localStorage.getItem("dl_libro_count") || "0", 10) + 1;
    const padded = String(count).padStart(4, "0");
    return `REC-${currentYear}-${padded}`;
  };

  const openLibroModal = () => {
    if (!modalLibro) return;
    const dates = getPeruDateFormatted();
    if (sheetDateEl) sheetDateEl.textContent = `Fecha: ${dates.dateOnly}`;
    
    // Vista inicial
    if (libroFormView) libroFormView.style.display = "block";
    if (libroSuccessView) libroSuccessView.style.display = "none";

    const nextFolio = getNextFolio();
    if (sheetCodeEl) sheetCodeEl.textContent = `N° ${nextFolio.replace("REC-", "")}`;

    modalLibro.hidden = false;
    document.body.style.overflow = "hidden";

    // Auto-focus en el primer campo
    setTimeout(() => {
      $("#rec-nombre")?.focus();
    }, 150);
  };

  const closeLibroModal = () => {
    if (!modalLibro) return;
    modalLibro.hidden = true;
    document.body.style.overflow = "";
    if (window.location.hash === "#libro-reclamaciones") {
      history.replaceState(null, "", window.location.pathname);
    }
  };

  openLibroBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    openLibroModal();
  });

  openLibroLink?.addEventListener("click", (e) => {
    e.preventDefault();
    openLibroModal();
  });

  closeLibroBtn?.addEventListener("click", closeLibroModal);
  cancelLibroBtn?.addEventListener("click", closeLibroModal);
  closeConstanciaBtn?.addEventListener("click", closeLibroModal);

  modalLibro?.addEventListener("click", (e) => {
    if (e.target === modalLibro) closeLibroModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalLibro && !modalLibro.hidden) {
      closeLibroModal();
    }
  });

  // Apertura directa vía enlace/hash #libro-reclamaciones
  if (window.location.hash === "#libro-reclamaciones") {
    setTimeout(openLibroModal, 300);
  }
  window.addEventListener("hashchange", () => {
    if (window.location.hash === "#libro-reclamaciones") {
      openLibroModal();
    }
  });

  // Toggle de campos para menor de edad
  recEsMenor?.addEventListener("change", () => {
    if (menorFields) {
      menorFields.style.display = recEsMenor.checked ? "grid" : "none";
    }
  });

  // Validación atómica y limpieza de errores en tiempo real
  const clearRecError = (fieldId) => {
    const input = $(`#${fieldId}`);
    const errSpan = $(`#err-${fieldId}`);
    input?.classList.remove("invalid");
    if (errSpan) errSpan.textContent = "";
  };

  [
    "rec-nombre",
    "rec-num-doc",
    "rec-telefono",
    "rec-email",
    "rec-direccion",
    "rec-servicio",
    "rec-detalle",
    "rec-pedido",
    "rec-veracidad"
  ].forEach((id) => {
    const el = $(`#${id}`);
    el?.addEventListener("input", () => clearRecError(id));
    el?.addEventListener("change", () => clearRecError(id));
  });

  // Registro del Reclamo / Queja
  libroForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = $("#rec-nombre")?.value.trim() || "";
    const tipoDoc = $("#rec-tipo-doc")?.value || "DNI";
    const numDoc = $("#rec-num-doc")?.value.trim() || "";
    const telefono = $("#rec-telefono")?.value.trim() || "";
    const email = $("#rec-email")?.value.trim() || "";
    const direccion = $("#rec-direccion")?.value.trim() || "";
    const esMenor = $("#rec-es-menor")?.checked || false;
    const tutorNombre = $("#rec-tutor-nombre")?.value.trim() || "";
    const tutorDni = $("#rec-tutor-dni")?.value.trim() || "";

    const bienTipo = libroForm.elements["rec_bien_tipo"]?.value || "Servicio";
    const monto = $("#rec-monto")?.value.trim() || "No especificado";
    const servicio = $("#rec-servicio")?.value.trim() || "";
    const bienDesc = $("#rec-bien-desc")?.value.trim() || "";

    const tipoAfectacion = libroForm.elements["rec_tipo_afectacion"]?.value || "Reclamo";
    const detalle = $("#rec-detalle")?.value.trim() || "";
    const pedido = $("#rec-pedido")?.value.trim() || "";
    const veracidad = $("#rec-veracidad")?.checked || false;

    let firstInvalid = null;

    if (!nombre) {
      const el = $("#rec-nombre");
      el?.classList.add("invalid");
      $("#err-rec-nombre").textContent = "Ingresa tu nombre completo o razón social.";
      if (!firstInvalid) firstInvalid = el;
    }

    if (!numDoc || numDoc.length < 5) {
      const el = $("#rec-num-doc");
      el?.classList.add("invalid");
      $("#err-rec-num-doc").textContent = "Ingresa un número de documento válido.";
      if (!firstInvalid) firstInvalid = el;
    }

    if (!telefono || telefono.length < 7) {
      const el = $("#rec-telefono");
      el?.classList.add("invalid");
      $("#err-rec-telefono").textContent = "Ingresa un teléfono o WhatsApp de contacto válido.";
      if (!firstInvalid) firstInvalid = el;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      const el = $("#rec-email");
      el?.classList.add("invalid");
      $("#err-rec-email").textContent = "Ingresa un correo electrónico válido para recibir tu constancia y respuesta.";
      if (!firstInvalid) firstInvalid = el;
    }

    if (!direccion || direccion.length < 5) {
      const el = $("#rec-direccion");
      el?.classList.add("invalid");
      $("#err-rec-direccion").textContent = "Ingresa tu dirección, distrito y ciudad de residencia.";
      if (!firstInvalid) firstInvalid = el;
    }

    if (!servicio) {
      const el = $("#rec-servicio");
      el?.classList.add("invalid");
      $("#err-rec-servicio").textContent = "Indica el servicio o producto relacionado.";
      if (!firstInvalid) firstInvalid = el;
    }

    if (!detalle || detalle.length < 10) {
      const el = $("#rec-detalle");
      el?.classList.add("invalid");
      $("#err-rec-detalle").textContent = "Explica los hechos o el motivo de tu reclamo/queja (mínimo 10 caracteres).";
      if (!firstInvalid) firstInvalid = el;
    }

    if (!pedido || pedido.length < 5) {
      const el = $("#rec-pedido");
      el?.classList.add("invalid");
      $("#err-rec-pedido").textContent = "Detalla tu pedido o solución solicitada.";
      if (!firstInvalid) firstInvalid = el;
    }

    if (!veracidad) {
      const el = $("#rec-veracidad");
      $("#err-rec-veracidad").textContent = "Debes confirmar la declaración de veracidad conforme a ley.";
      if (!firstInvalid) firstInvalid = el;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Incrementar y generar folio oficial
    const nextSeq = parseInt(localStorage.getItem("dl_libro_count") || "0", 10) + 1;
    localStorage.setItem("dl_libro_count", nextSeq.toString());
    const currentYear = new Date().getFullYear();
    const folioCode = `REC-${currentYear}-${String(nextSeq).padStart(4, "0")}`;
    const dateData = getPeruDateFormatted();

    const record = {
      folio: folioCode,
      fecha: dateData.fullDateTime,
      nombre,
      tipoDoc,
      numDoc,
      telefono,
      email,
      direccion,
      esMenor,
      tutorNombre,
      tutorDni,
      bienTipo,
      monto,
      servicio,
      bienDesc,
      tipoAfectacion,
      detalle,
      pedido,
      createdAt: new Date().toISOString()
    };

    // Guardar en almacenamiento local
    try {
      localStorage.setItem(`dl_reclamo_${folioCode}`, JSON.stringify(record));
    } catch (e) {
      console.warn("No se pudo almacenar en localStorage", e);
    }

    // Poblar Constancia Oficial
    $("#c-folio").textContent = folioCode;
    $("#c-fecha").textContent = dateData.fullDateTime;
    $("#c-nombre").textContent = nombre;
    $("#c-doc").textContent = `${tipoDoc}: ${numDoc}${esMenor ? ` (Tutor: ${tutorNombre} - DNI ${tutorDni})` : ""}`;
    $("#c-telefono").textContent = telefono;
    $("#c-email").textContent = email;
    $("#c-direccion").textContent = direccion;
    $("#c-bien-tipo").textContent = bienTipo;
    $("#c-monto").textContent = monto;
    $("#c-servicio").textContent = servicio + (bienDesc ? ` (${bienDesc})` : "");
    $("#c-tipo-afectacion").textContent = `${tipoAfectacion.toUpperCase()} (Ley N° 29571)`;
    $("#c-detalle").textContent = detalle;
    $("#c-pedido").textContent = pedido;

    // Enlace de notificación inmediata a WhatsApp de DL Media Pro
    const waNoticeText = [
      `Hola ${CONFIG.brand} 👋`,
      `Acabo de registrar una Hoja de Reclamación Virtual con los siguientes datos:`,
      `• Folio: ${folioCode}`,
      `• Tipo: ${tipoAfectacion.toUpperCase()}`,
      `• Reclamante: ${nombre}`,
      `• Documento: ${tipoDoc} ${numDoc}`,
      `• Teléfono: ${telefono}`,
      `• Correo: ${email}`,
      `• Servicio: ${servicio}`,
      `• Pedido: ${pedido}`,
      ``,
      `Agradezco su atención conforme al plazo legal de INDECOPI (15 días hábiles).`
    ].join("\n");

    const waNoticeUrl = waLink(waNoticeText);
    const btnWaConstancia = $("#btn-wa-constancia");
    if (btnWaConstancia) btnWaConstancia.href = waNoticeUrl;

    // Cambiar a vista de constancia
    if (libroFormView) libroFormView.style.display = "none";
    if (libroSuccessView) libroSuccessView.style.display = "block";

    // Scroll al tope del modal
    $(".modal-libro-container")?.scrollTo({ top: 0, behavior: "smooth" });

    // Mensaje sonoro de Mandi
    sayMandi(`Tu hoja de reclamación ${folioCode} ha sido registrada conforme a ley.`, 6000);
  });

  // Imprimir constancia
  printConstanciaBtn?.addEventListener("click", () => {
    window.print();
  });

  /* ---------- 13. Banner de Cookies con Persistencia en LocalStorage ---------- */
  const cookieBanner = $("#cookie-banner");
  const acceptCookiesBtn = $("#accept-cookies-btn");
  const rejectCookiesBtn = $("#reject-cookies-btn");

  try {
    const cookieChoice = localStorage.getItem("dl_cookies_preference");
    if (!cookieChoice && cookieBanner) {
      cookieBanner.hidden = false;
      requestAnimationFrame(() => cookieBanner.classList.add("is-visible"));
    }
  } catch (e) {
    if (cookieBanner) cookieBanner.hidden = false;
  }

  const handleCookieConsent = (type) => {
    try {
      localStorage.setItem("dl_cookies_preference", type);
    } catch (e) {
      // Silencioso ante bloqueo de storage en modos de incógnito extremos
    }
    if (cookieBanner) {
      cookieBanner.classList.remove("is-visible");
      setTimeout(() => {
        cookieBanner.hidden = true;
      }, 350);
    }
  };

  acceptCookiesBtn?.addEventListener("click", () => handleCookieConsent("all"));
  rejectCookiesBtn?.addEventListener("click", () => handleCookieConsent("necessary"));
});
