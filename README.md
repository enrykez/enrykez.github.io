# enrykez.com — Sitio profesional de Emanuel Téllez Enríquez

Sitio estático bilingüe (EN principal / ES) publicado con GitHub Pages. Posiciona a Emanuel como Enterprise Software Architect: arquitectura de software empresarial, tecnología de cumplimiento fiscal (CFDI) y modernización digital.

## Estructura

```
/
├── index.html               # Sitio completo (HTML + CSS + JS autocontenido)
├── 404.html                 # Página de error de GitHub Pages
├── robots.txt · sitemap.xml # Indexado
├── CNAME                    # Dominio personalizado enrykez.com — NO modificar
├── .gitattributes           # Normaliza finales de línea (LF) entre Windows y Linux
└── assets/
    ├── emanuel-hero-600.webp · emanuel-hero-1086.webp  # Foto hero (WebP responsivo)
    ├── emanuel-hero.png         # Respaldo del hero para navegadores sin WebP
    ├── emanuel-about-casual.webp · .jpg  # Foto About (tono atenuado hacia la paleta)
    ├── emanuel-about.jpg        # Foto B/N formal — reserva (no usada)
    ├── og-enrykez.jpg           # Imagen para compartir (Open Graph 1200×630)
    ├── enrykez-symbol-*.png     # Símbolo de marca (white / brand / gray)
    ├── favicon.ico · favicon-32.png · apple-touch-icon.png
    ├── google-genai-badge.png · smc-badge.png   # Badges de certificación
    └── emanuel-hero.jpg · emanuel-contact.jpg   # Reserva (no usadas)
```

## Flujo de trabajo

GitHub Pages publica desde `main` / raíz: **cada push a `main` sale en vivo**.

1. `git pull` antes de empezar.
2. Previsualizar localmente: `python -m http.server 8000` → http://localhost:8000
3. Commits con mensaje descriptivo (`feat:`, `fix:`, `perf:`, `docs:`).
4. `git push` → publicación en 1–2 minutos.

## Despliegue y dominio

- Repositorio: `enrykez/enrykez.github.io`, rama `main`, carpeta raíz.
- Settings → Pages → Custom domain: `enrykez.com`, con **Enforce HTTPS** activo.
- DNS:
  - Registros A del apex (`enrykez.com`) → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
  - CNAME de `www` → `enrykez.github.io`

## Reglas de contenido (NO modificar sin cotejar con la conciliación vigente)

- Los clientes de SW sapien permanecen **anónimos** ("Fortune 500 / Global 500, electronics · automotive · retail"). Cuando el NDA lo permita, los nombres se agregan en el Case 01.
- El cliente de MPM **nunca** se nombra en este sitio (cláusula de confidencialidad). Por eso el proyecto MPM no aparece como caso individual.
- "CITI (Value in Real Time)" no se menciona por nombre en el sitio (el caso ASE Coahuila se presenta por el cliente gubernamental, no por la consultora) — evita cualquier confusión con Citigroup ante un revisor.
- El rol TecNM ("invited instructor / course facilitator") no se incluye en el sitio; vive en LinkedIn y el CV.
- El Trimestre Fiscal No. 96 se presenta explícitamente como "documented by third parties — not an authored publication".
- Toda cifra (18 años, 99.9%, ~200%) proviene del CV calibrado contra evidencia documental. Las frases de antigüedad usan "nearly two decades / casi dos décadas", nunca "two decades".
- Cada badge corresponde exactamente a su credencial; si no hay badge oficial, no se muestra ninguno.

## Fase 2 — Materiales por recopilar (slots preparados en el HTML como comentarios `EVIDENCE SLOT`)

**Case 01 — CFDI (SW sapien):** diagrama de arquitectura cloud (genérico, sin datos de cliente) · captura de métricas de disponibilidad · carta de Valeri Herrera · nombres de clientes cuando el NDA lo permita.

**Case 02 — Paysafe/Mphasis:** diagrama de contexto ISO 8583 (genérico) · carta de Baiju Edachali.

**Case 03 — ASE Coahuila:** capturas públicas de las plataformas Cuenta Pública/Auditor · registro patronal "technical leader and accountant" · carta de contacto en la ASE.

**Case 04 — Puebla/Iqia:** extracto escaneado del Trimestre Fiscal No. 96 (pp. 91–107) · carta 2014 del Ing. Rafael B. Vega González.

**Case 05 — Chiapas:** nombramiento oficial · descripción del sistema de integración bancaria.

**Case 06 — Zurich:** carta de asignación vía Porto Mx.

**Generales:** logotipos oficiales SVG de tecnologías (hoy son chips tipográficos — más seguros legalmente; si se desean logos, verificar guidelines de marca de cada fabricante) · video de presentación (opcional) · testimonios con permiso escrito · badge oficial de Scrum Fundamentals Certified (SFC).

## Notas técnicas

- Tipografía: Exo 2 (display) y Prompt (texto) vía Google Fonts — única dependencia externa.
- Selector de idioma EN/ES con persistencia (`localStorage` con try/catch); el idioma guardado se aplica al inicio del `<body>` para evitar el parpadeo EN→ES.
- SEO: meta description, Open Graph con imagen dedicada 1200×630, Twitter card, canonical, JSON-LD schema.org/Person con `sameAs` hacia ORCID, IEEE, Scholar, LinkedIn y GitHub; `robots.txt` y `sitemap.xml`.
- Rendimiento: hero en WebP responsivo (`<picture>` + `srcset`) con `preload` y `fetchpriority="high"`; respaldo PNG optimizado. Al agregar imágenes: WebP + respaldo, ancho máximo = 2× el tamaño mostrado.
- Accesibilidad: foco visible, `prefers-reduced-motion` respetado, contraste AA, alt text en fotos, SVG decorativos con `aria-hidden`.
- Responsive mobile-first; menú hamburguesa < 1000px.

## Guiños personales (intencionalmente discretos)

No son decoración genérica: cada uno refiere a algo de Emanuel. Mantenerlos sutiles (opacidad baja, sin texto explicativo visible).

- **Constelación de Acuario** en el fondo del hero (geometría de la figura clásica) y glifo ♒ en el footer.
- **Caballo de ajedrez** como marca de agua en *Selected Work*.
- **Hormigas** sobre una línea de feromona en la tarjeta del artículo IEEE (*An Ant System with Steps Counter*); caminan al pasar el cursor.
- **Mensaje en la consola** del navegador para quien inspeccione el sitio.
