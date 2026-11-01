# Analítica web — enrykez.com

> Estado: **implementado en código, inactivo hasta configurar identificadores.**
> Con los tres identificadores vacíos el sitio no carga ningún servicio externo de analítica ni muestra el banner de consentimiento.

## 1. Arquitectura

```
index.html / 404.html / privacy.html
   └─ <script defer> assets/js/analytics-config.js   ← IDs y opciones (única fuente de verdad)
   └─ <script defer> assets/js/analytics.js          ← cargador, consentimiento y eventos
          ├─ Cloudflare Web Analytics  → sin cookies, se carga siempre (si hay token)
          ├─ Google Analytics 4        → solo tras «Aceptar»
          ├─ Microsoft Clarity         → solo tras «Aceptar»
          └─ assets/css/consent.css    → se descarga únicamente si hay que mostrar el banner
```

| Decisión | Motivo |
|---|---|
| Sin build ni dependencias | El sitio es HTML estático en GitHub Pages; dos archivos JS bastan. |
| Scripts `defer` + proveedores `async` | No bloquean el renderizado; la página se pinta igual que antes. |
| Cloudflare sin consentimiento, GA4 y Clarity con *opt-in* | Cloudflare no usa cookies ni identifica visitantes → da el conteo general de **todos** los visitantes. GA4 y Clarity usan cookies → se activan solo con permiso (criterio más estricto, válido para visitantes de la UE/Reino Unido y México). |
| Consentimiento global, sin geolocalización | Un sitio estático no puede detectar el país del visitante sin servidor; aplicar *opt-in* a todos es la opción segura. Efecto: GA4/Clarity verán solo a quienes acepten — Cloudflare cubre el total. |
| Global Privacy Control respetado | Si el navegador envía GPC, no se muestra el banner y GA4/Clarity no se cargan (el visitante puede aceptar manualmente desde «Preferencias de cookies»). |
| Guardas anti-duplicado | Un solo `config` de GA4 por carga (= un page view), el beacon de Cloudflare no se agrega si Cloudflare ya lo inyectó, `section_view` una vez por sección, `js_error` máx. 5 por página. |
| Tolerancia a bloqueadores | Si un proveedor falla o lo bloquea un ad-blocker, el sitio sigue funcionando (probado). |

## 2. Archivos

| Archivo | Cambio |
|---|---|
| `assets/js/analytics-config.js` | **Nuevo.** Identificadores y opciones. |
| `assets/js/analytics.js` | **Nuevo.** Carga de proveedores, consentimiento, `trackEvent`, seguimiento declarativo. |
| `assets/css/consent.css` | **Nuevo.** Estilos del banner (carga bajo demanda). |
| `privacy.html` | **Nuevo.** Aviso de privacidad bilingüe (borrador para revisión — ver §11). |
| `docs/ANALYTICS.md` | **Nuevo.** Este documento. |
| `index.html` | Dos `<script defer>`; atributos `data-track` en enlaces relevantes; en el footer: enlace «Privacy» y botón «Cookie settings» (oculto hasta configurar GA4/Clarity). Sin cambios de diseño. |
| `404.html` | Dos `<script defer>`. |
| `sitemap.xml` | Agrega `privacy.html`. |
| `README.md` | Referencia a este documento. |

## 3. Cloudflare Web Analytics

No se pudo verificar desde el repositorio si enrykez.com usa Cloudflare. GitHub Pages es el hosting; Cloudflare, si existe, sería solo DNS/proxy.

**Paso 0 — Verificar:** entra a <https://dash.cloudflare.com>. Si `enrykez.com` aparece como sitio (zona), revisa en **DNS → Records** si los registros `A` / `www` tienen la nube **naranja** (Proxied) o **gris** (DNS only).

**Opción A — Zona en Cloudflare con proxy naranja (sin código):**
1. **Analytics & Logs → Web Analytics → Add a site** → elige `enrykez.com`.
2. Selecciona **Enable** / *automatic setup*. Cloudflare inyecta el beacon en el HTML.
3. Deja `cloudflareToken: ""` en `analytics-config.js` (si pones token también, cada visita contaría doble; el código igual evita agregar un segundo beacon si detecta el de Cloudflare).

**Opción B — Sin proxy o sin zona en Cloudflare (con token):**
1. **Analytics & Logs → Web Analytics → Add a site** → escribe `enrykez.com` → **Done**.
2. Cloudflare muestra un snippet con `data-cf-beacon='{"token": "…"}'`. Copia **solo** el valor de `token` (32 caracteres hexadecimales).
3. Pégalo en `cloudflareToken`. Es un identificador público, no una credencial.

Qué ofrece: visitas, page views, páginas, referencias, países, navegadores, SO, dispositivos y Core Web Vitals. **No** ofrece eventos personalizados, ciudades ni análisis de campañas UTM (eso lo cubre GA4).

## 4. Google Analytics 4 — Measurement ID

1. <https://analytics.google.com> → **Admin** (engrane) → **Create → Property**.
   Nombre `Enrykez`, zona horaria *Mexico City* (o la tuya), moneda MXN/USD.
2. **Data streams → Add stream → Web** → URL `https://enrykez.com`, nombre `enrykez.com`.
3. Copia el **Measurement ID** (`G-XXXXXXXXXX`) → pégalo en `ga4MeasurementId`.
4. En el mismo stream, **Enhanced measurement** (engrane):
   - Mantener: *Page views*, *Scrolls*, *Outbound clicks*, *File downloads*.
   - Desactivar: *Page changes based on browser history events* (el sitio no es SPA; evita page views duplicados) y *Form interactions* (no hay formularios).
5. **Admin → Data collection and modification → Data retention** → 14 meses.
6. **Admin → Data collection → Google signals**: dejar **desactivado** (el código también lo fuerza).
7. **Admin → Custom definitions → Create custom dimension** (alcance *Event*), una por parámetro que quieras ver en informes:
   `platform`, `location`, `section`, `cta`, `product`, `credential`, `publication`, `method`, `language`.
8. **Admin → Events / Key events**: marca como *key event* (conversión) `contact_click` y `product_cta_click` (y si quieres `profile_link_click`).
9. Excluir tus propias visitas: la forma más simple es **Rechazar** el banner en tus navegadores. Alternativa: *Data streams → Configure tag settings → Define internal traffic* (por IP) + *Data filters* en *Active*.

## 5. Microsoft Clarity — Project ID

1. <https://clarity.microsoft.com> → **New project** → nombre `Enrykez`, URL `https://enrykez.com`.
2. Elige instalación manual. En el snippet aparece `(window, document, "clarity", "script", "XXXXXXXXXX")`: ese último valor es el **Project ID** → pégalo en `clarityProjectId`.
3. **Settings → Masking** → **Balanced** (recomendado; el sitio no tiene formularios ni datos de visitantes) o **Strict** si prefieres enmascarar todo el texto.
4. **Settings → IP blocking** → agrega tu IP para no grabar tus propias sesiones.
5. Opcional: **Settings → Setup → Google Analytics integration** para cruzar sesiones con GA4.

Consentimiento: desde el 31-oct-2025 Clarity exige señal de consentimiento para visitas del EEE, Reino Unido y Suiza. El código la envía con la API v2 (`clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' })`) al aceptar, y `clarity('consent', false)` al retirar el consentimiento.

## 6. Verificar que llegan visitas y eventos

1. Publica los cambios con el ID configurado y abre `https://enrykez.com/?utm_source=test&utm_medium=manual`.
2. Acepta el banner.
3. **Consola del navegador:** `enrykezAnalytics.status()` → debe mostrar `consent: true, ga4: true, clarity: true`.
4. **DevTools → Network:**
   - GA4: solicitudes a `…google-analytics.com/g/collect` con `en=page_view` y luego `en=profile_link_click`, etc.
   - Clarity: solicitudes a `*.clarity.ms/collect`.
   - Cloudflare: solicitud a `cloudflareinsights.com/cdn-cgi/rum`.
5. **GA4 → Reports → Realtime** (segundos) y **Admin → DebugView** (activa `debug: true` en la config para ver además los eventos en consola).
6. **Clarity:** las primeras grabaciones aparecen tras ~30 min – 2 h.
7. **Cloudflare:** los datos aparecen en minutos.

## 7. Dónde consultar

| Pregunta | Dónde |
|---|---|
| Visitas totales, países, dispositivos, rendimiento | Cloudflare → Analytics & Logs → Web Analytics |
| Usuarios, sesiones, día/semana/mes | GA4 → Reports → Engagement → Overview |
| Fuentes de tráfico (Google, LinkedIn, Facebook, directo) y campañas UTM | GA4 → Reports → Acquisition → Traffic acquisition (dimensión *Session source / medium* o *Session campaign*) |
| País y ciudad | GA4 → Reports → User attributes → Demographic details |
| Navegador, SO, dispositivo | GA4 → Reports → Tech → Tech details |
| Eventos (clics en perfiles, Integra, credenciales) | GA4 → Reports → Engagement → Events |
| Mapas de calor, scroll, grabaciones | Clarity → Heatmaps / Recordings / Dashboard |
| Errores de JavaScript | GA4 → Events → `js_error` · Clarity → Dashboard → *JavaScript errors* |

## 8. Catálogo de eventos

| Evento | Parámetros | Dónde se dispara |
|---|---|---|
| `nav_click` | `section` | Menú principal |
| `cta_click` | `cta` (`hero_selected_work`, `hero_get_in_touch`) | Botones del hero |
| `product_cta_click` | `product`, `cta` (`explore`, `request_demo`) | Tarjeta de Integra |
| `credential_click` | `credential`, `location` (`badges`, `list`) | Badges y lista de certificaciones |
| `publication_click` | `publication` (`ieee_cec_2007`, `trimestre_fiscal_96`) | Tarjetas de investigación |
| `profile_link_click` | `platform`, `location` (`research`, `contact`) | ORCID, IEEE, Scholar, LinkedIn, GitHub |
| `contact_click` | `method` (`email`) — **nunca** la dirección | Enlace de correo |
| `language_change` | `language` | Botón EN/ES |
| `section_view` | `section` | Primera vez que cada sección es visible (35 %) |
| `js_error` | `message` (≤100), `source` (nombre de archivo), `line` | Errores no capturados (máx. 5) |

GA4 agrega automáticamente `page_view`, `scroll`, `click` (salientes) y `session_start`.

## 9. Agregar eventos

**Sin escribir JavaScript** (recomendado):

```html
<a href="https://instagram.com/…" data-track="social_link_click"
   data-track-platform="instagram" data-track-location="footer">Instagram</a>
```

`data-track-<clave>` se convierte en el parámetro `<clave>` (camelCase → snake_case).

**Desde JavaScript:**

```javascript
trackEvent("social_link_click", { platform: "instagram", location: "footer" });
```

Reglas aplicadas automáticamente: nombres y claves en `snake_case` (≤40), máx. 10 parámetros, textos ≤100 caracteres, correos y URL se reemplazan por `[redacted]` / `[url]`. Sin consentimiento, el evento no sale del navegador. Para verlo en informes de GA4, registra cada parámetro nuevo como *custom dimension* (§4.7).

## 10. Desactivar una herramienta

| Acción | Cómo |
|---|---|
| Desactivar GA4 | `ga4MeasurementId: ""` |
| Desactivar Clarity | `clarityProjectId: ""` |
| Desactivar Cloudflare | `cloudflareToken: ""` (y, si usas *automatic setup*, desactívalo en el dashboard) |
| Quitar el banner | Dejar vacíos GA4 y Clarity (el banner solo existe para ellos) |
| Retirar todo | Quitar las dos líneas `<script>` de `index.html`, `404.html` y `privacy.html` |
| Volver a preguntar a todos | Cambiar `consentStorageKey` (p. ej. `enrykez-consent-v2`) |

## 11. Acciones manuales pendientes

- [ ] Verificar si enrykez.com está en Cloudflare y con proxy (§3, paso 0) y elegir opción A o B.
- [ ] Crear propiedad GA4 y enviarme el **Measurement ID** (`G-…`).
- [ ] Crear proyecto Clarity y enviarme el **Project ID**.
- [ ] Configurar en GA4: enhanced measurement, retención, custom dimensions, key events (§4).
- [ ] Configurar en Clarity: masking e IP blocking (§5).
- [ ] **Revisar `privacy.html`** antes de activar GA4/Clarity. Es un borrador técnico, no asesoría legal. Para cumplir la LFPDPPP (México) un aviso de privacidad integral suele requerir, además, domicilio del responsable y el procedimiento detallado para derechos ARCO; si esperas visitantes de la UE, considera también los requisitos del RGPD. Conviene validarlo con un especialista.

## 12. Privacidad y proveedores

| Proveedor | Datos que recibe | Finalidad | Cookies | Consentimiento |
|---|---|---|---|---|
| Cloudflare, Inc. | URL, referencia, user agent, métricas de rendimiento; IP usada transitoriamente para país | Estadísticas agregadas | No | No requerido |
| Google LLC (GA4) | URL (solo con parámetros UTM), referencia, eventos de §8, datos técnicos del dispositivo; GA4 no almacena IP | Analítica de audiencia y adquisición | `_ga`, `_ga_*` | *Opt-in* |
| Microsoft Corp. (Clarity) | Interacciones (clics, scroll, movimientos), DOM con enmascaramiento, datos técnicos | Mapas de calor y UX | `_clck`, `_clsk` | *Opt-in* (Consent API v2) |

Garantías del código: no hay fingerprinting ni identificadores propios; los parámetros de URL distintos de UTM se eliminan antes de enviar la ubicación a GA4; ningún evento incluye correo, nombre ni texto libre del visitante; Google signals y personalización de anuncios desactivados; al retirar el consentimiento se borran las cookies de GA4/Clarity y se recarga la página.

## 13. Content Security Policy

El sitio no tiene CSP (GitHub Pages no permite cabeceras HTTP). Si en el futuro migras a Cloudflare Pages o agregas cabeceras con un Worker, esta política es compatible con la implementación:

```
default-src 'self';
script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.clarity.ms https://*.clarity.ms https://static.cloudflareinsights.com;
connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://*.clarity.ms https://cloudflareinsights.com;
img-src 'self' data: https://*.google-analytics.com https://www.googletagmanager.com https://*.clarity.ms https://c.bing.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
frame-ancestors 'none'; base-uri 'self'; form-action 'self'
```

`'unsafe-inline'` es necesario hoy por el CSS/JS embebido en `index.html` (no por la analítica: los archivos de analítica son externos). Retirarlo implicaría extraer ese código a archivos, un cambio independiente.
