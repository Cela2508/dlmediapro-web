# Estructura y Estándares de Imágenes: DL Media Pro

Directorio centralizado para todos los recursos visuales del sitio web, optimizado bajo estándares **Web-to-App de Grado Industrial**.

---

## 1. Estructura de Carpetas

- **`img/icons/`**: Favicones vectoriales (`favicon.svg`), iconos de Apple Touch (`apple-touch-icon.png`), isotipos y logotipos horizontales en formatos ligeros.
- **`img/og/`**: Imagen de portada Open Graph para redes sociales y WhatsApp (`og-cover.jpg` de 1200×630 px, peso < 300 KB).
- **`img/portafolio/`**: Imágenes y portadas de casos de éxito, reels y proyectos de video.
- **`img/hero/`**: Elementos gráficos principales de cabecera y pósters de videos.

---

## 2. Reglas Obligatorias de Rendimiento (CLS = 0)

1. **Aspect-Ratio Obligatorio:**
   Toda imagen insertada en el HTML o referenciada en CSS debe reservar su espacio en el DOM para evitar Cumulative Layout Shift (CLS):
   - Formato vertical (Reels/TikToks): `aspect-[9/16]` o `aspect-[3/4]`
   - Formato estándar de video: `aspect-video` (16:9)
   - Avatares e iconos: `aspect-square` (1:1)
   - En HTML nativo, declarar siempre atributos intrínsecos `width` y `height`.

2. **Formatos Modernos:**
   - Fotografías y miniaturas: **WebP** o **AVIF** (80-85% calidad).
   - Logotipos e iconografía: **SVG** optimizado (sin metadatos redundantes).

3. **Carga Inteligente:**
   - Debajo del pliegue (below-the-fold): `loading="lazy"` y `decoding="async"`.
   - Elemento principal de héroe (LCP Candidate): `loading="eager"` y `fetchpriority="high"`.

4. **Ajuste de Encuadre:**
   - Usar `object-fit: cover` (`object-cover` en CSS) junto con `width: 100%; height: 100%` para evitar deformaciones.

---

## 3. Accesibilidad SEO: La Fórmula C-A-P-O para Atributos ALT

Basada en la guía nemotécnica de DL Media Pro (`docs/recursos-graficos/formula_capo_alt_portafolio.png`):
- **C (Contexto):** Qué producto o marca se está mostrando (ej. "Spot comercial para marca de ropa").
- **A (Acción):** Qué ocurre en la imagen (ej. "Avatar hiperrealista presentando una oferta").
- **P (Propósito):** El objetivo del contenido (ej. "Campaña de video para TikTok").
- **O (Optimización):** Inclusión natural de palabras clave locales (ej. "Lima, Perú").

*Ejemplo:* `alt="Avatar con IA presentando un reel de producto de moda en Lima, Perú - DL Media Pro"`
