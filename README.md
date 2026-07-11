# enrykez.com — Sitio profesional de Emanuel Téllez Enríquez

Sitio estático bilingüe (EN principal / ES) para GitHub Pages, diseñado para posicionamiento como líder tecnológico STEM: arquitectura de software empresarial, tecnología de cumplimiento fiscal (CFDI) y transformación digital.

## Estructura

```
/
├── index.html          # Sitio completo (HTML + CSS + JS autocontenido)
├── CNAME               # Dominio personalizado enrykez.com
└── assets/
    ├── emanuel-hero.jpg     # Foto formal (traje azul) — hero
    ├── emanuel-about.jpg    # Foto B/N — sección About
    └── emanuel-contact.jpg  # Foto casual — reserva (no usada aún)
```

## Despliegue en GitHub Pages

1. Subir todos los archivos a la raíz del repositorio `etellez/etellez.github.io` (rama `main`), reemplazando el `index.html` actual.
2. En Settings → Pages, verificar Source = `main` / root.
3. Configurar el dominio: en Settings → Pages → Custom domain, escribir `enrykez.com` (el archivo CNAME ya lo fija). Activar "Enforce HTTPS" cuando el certificado esté listo.
4. En el proveedor DNS de enrykez.com:
   - Registros A del apex (`enrykez.com`) → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
   - CNAME de `www` → `etellez.github.io`

## Reglas de contenido (NO modificar sin cotejar con la conciliación vigente)

- Los clientes de SW sapien permanecen **anónimos** ("Fortune 500 / Global 500, electronics · automotive · retail"). Cuando el NDA lo permita, los nombres se agregan en el Case 01.
- El cliente de MPM **nunca** se nombra en este sitio (cláusula de confidencialidad). Por eso el proyecto MPM no aparece como caso individual.
- "CITI (Value in Real Time)" no se menciona por nombre en el sitio (el caso ASE Coahuila se presenta por el cliente gubernamental, no por la consultora) — evita cualquier confusión con Citigroup ante un revisor.
- El rol TecNM ("invited instructor / course facilitator") no se incluye en el sitio; vive en LinkedIn y el CV.
- El Trimestre Fiscal No. 96 se presenta explícitamente como "documented by third parties — not an authored publication".
- Toda cifra (18 años, 99.9%, ~200%) proviene del CV calibrado contra evidencia documental.

## Fase 2 — Materiales por recopilar (slots ya preparados en el HTML como comentarios `EVIDENCE SLOT`)

**Case 01 — CFDI (SW sapien):** diagrama de arquitectura cloud (genérico, sin datos de cliente) · captura de métricas de disponibilidad · carta de Valeri Herrera · nombres de clientes cuando el NDA lo permita.

**Case 02 — Paysafe/Mphasis:** diagrama de contexto ISO 8583 (genérico) · carta de Baiju Edachali.

**Case 03 — ASE Coahuila:** capturas públicas de las plataformas Cuenta Pública/Auditor · registro patronal "technical leader and accountant" · carta de contacto en la ASE.

**Case 04 — Puebla/Iqia:** extracto escaneado del Trimestre Fiscal No. 96 (pp. 91–107) · carta 2014 del Ing. Rafael B. Vega González.

**Case 05 — Chiapas:** nombramiento oficial · descripción del sistema de integración bancaria.

**Case 06 — Zurich:** carta de asignación vía Porto Mx.

**Generales:** logotipos oficiales SVG de tecnologías (hoy son chips tipográficos — más seguros legalmente; si se desean logos, verificar guidelines de marca de cada fabricante) · video de presentación (opcional) · testimonios con permiso escrito.

## Notas técnicas

- Selector de idioma EN/ES con persistencia (localStorage con try/catch).
- SEO: meta description, Open Graph, canonical, JSON-LD schema.org/Person con sameAs hacia ORCID, IEEE, Scholar, LinkedIn y GitHub.
- Accesibilidad: foco visible, `prefers-reduced-motion` respetado, contraste AA, alt text en fotos.
- Responsive mobile-first; menú hamburguesa < 980px.
- Sin dependencias externas salvo Google Fonts (Archivo, IBM Plex Sans, IBM Plex Mono).
