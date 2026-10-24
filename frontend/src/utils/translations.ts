/**
 * App translations, Spanish and English.
 *
 * Add a key here and use it anywhere with the useT() hook.
 * Keys are grouped by feature/section.
 */

export type AppLanguage = "es" | "en";

const translations = {
  en: {
    // Sidebar
    sidebar_title: "AI Debug",
    sidebar_subtitle: "Assistant",
    sidebar_level_label: "Explanation Level",
    sidebar_powered_by: "Powered by Claude Sonnet",
    nav_home: "Home",
    nav_explain: "Explain Code",
    nav_debug: "Debug Helper",
    nav_analyze: "Analyze File",
    nav_github: "GitHub URL",
    nav_history: "History",
    level_junior: "Junior",
    level_mid: "Mid",
    level_senior: "Senior",

    // Home
    home_badge: "Powered by Claude Sonnet",
    home_title_1: "Your Personal Code",
    home_title_2: "Tutor",
    home_subtitle: "Understand any code, at your level. From junior to senior, AI-powered explanations that grow with you.",
    home_notice: "This is an open-source portfolio project. Usage is limited to 10 requests/min and 20 requests/day per IP to keep it free for everyone.",
    home_explain_title: "Explain Code",
    home_explain_desc: "Paste any code and get a clear explanation adapted to your level. Includes line-by-line annotations.",
    home_debug_title: "Debug Helper",
    home_debug_desc: "Paste your error message and code. Get the root cause, the fix, and an explanation of what went wrong.",
    home_analyze_title: "Analyze File",
    home_analyze_desc: "Upload a source file or PDF. Get a structured analysis: summary, key components, and suggestions.",
    home_github_title: "GitHub URL",
    home_github_desc: "Paste a GitHub file URL and get an instant analysis without leaving the app.",

    // Examples
    examples_try: "Try an example:",

    // Explain page
    explain_title: "Explain Code",
    explain_subtitle: "Paste code and get an explanation at your current level",
    explain_level_hint: "Level: (change in sidebar)",
    explain_placeholder: "# Paste your code here...",
    explain_submit: "Explain this code",
    explain_submitting: "Explaining...",
    explain_language_mismatch: "Language mismatch detected",
    explain_mismatch_msg: (selected: string, detected: string) =>
      `You selected "${selected}" but the code looks like "${detected}". Continue anyway or fix the language selector.`,

    // Debug page
    debug_title: "Debug Helper",
    debug_subtitle: "Paste your error and code to get a step-by-step diagnosis",
    debug_error_label: "Error Message",
    debug_error_placeholder: "TypeError: 'NoneType' object is not subscriptable\n  File 'app.py', line 42...",
    debug_code_label: "Your Code",
    debug_code_placeholder: "# Paste the code that's causing the error...",
    debug_submit: "Debug this error",
    debug_submitting: "Analyzing...",

    // Analyze page
    analyze_title: "Analyze File",
    analyze_subtitle: "Upload a code file or PDF to get a structured analysis",
    analyze_drop: "Drop a file here or click to browse",
    analyze_drop_hint: "Supports: .py .js .ts .go .rs .java .html .css .json .md .txt .pdf",
    analyze_submit: "Analyze file",
    analyze_submitting: "Analyzing...",

    // GitHub page
    github_title: "GitHub URL",
    github_subtitle: "Paste a GitHub file URL to analyze it directly",
    github_url_label: "GitHub File URL",
    github_url_placeholder: "https://github.com/owner/repo/blob/main/src/utils.py",
    github_url_error: "URL must be a GitHub file URL like: https://github.com/owner/repo/blob/branch/path/file.py",
    github_submit: "Analyze file",
    github_submitting: "Fetching & analyzing...",

    // History page
    history_title: "History",
    history_subtitle: "Your past conversations",
    history_empty: "No conversations yet. Start explaining or debugging some code!",

    // Response
    response_generating: "Generating...",
    response_label: "Response",
    response_copy: "Copy",
    response_copied: "Copied!",
  },

  es: {
    // Sidebar
    sidebar_title: "AI Debug",
    sidebar_subtitle: "Asistente",
    sidebar_level_label: "Nivel de explicación",
    sidebar_powered_by: "Funciona con Claude Sonnet",
    nav_home: "Inicio",
    nav_explain: "Explicar código",
    nav_debug: "Depurar error",
    nav_analyze: "Analizar archivo",
    nav_github: "URL de GitHub",
    nav_history: "Historial",
    level_junior: "Junior",
    level_mid: "Mid",
    level_senior: "Senior",

    // Home
    home_badge: "Funciona con Claude Sonnet",
    home_title_1: "Tu tutor personal de",
    home_title_2: "código",
    home_subtitle: "Entiende cualquier código a tu nivel. De junior a senior, explicaciones con IA que crecen contigo.",
    home_notice: "Este es un proyecto de portfolio de código abierto. El uso está limitado a 10 solicitudes/min y 20 solicitudes/día por IP para mantenerlo gratuito para todos.",
    home_explain_title: "Explicar código",
    home_explain_desc: "Pega cualquier código y obtén una explicación adaptada a tu nivel. Incluye anotaciones por línea.",
    home_debug_title: "Depurar error",
    home_debug_desc: "Pega tu mensaje de error y el código. Obtén la causa raíz, la solución y una explicación de qué falló.",
    home_analyze_title: "Analizar archivo",
    home_analyze_desc: "Sube un archivo de código o PDF. Obtén un análisis estructurado: resumen, componentes clave y sugerencias.",
    home_github_title: "URL de GitHub",
    home_github_desc: "Pega una URL de GitHub y analiza el archivo directamente sin salir de la app.",

    // Examples
    examples_try: "Prueba un ejemplo:",

    // Explain page
    explain_title: "Explicar código",
    explain_subtitle: "Pega código y obtén una explicación según tu nivel actual",
    explain_level_hint: "Nivel: (cámbialo en el menú lateral)",
    explain_placeholder: "# Pega tu código aquí...",
    explain_submit: "Explicar este código",
    explain_submitting: "Explicando...",
    explain_language_mismatch: "Lenguaje incorrecto detectado",
    explain_mismatch_msg: (selected: string, detected: string) =>
      `Seleccionaste "${selected}" pero el código parece "${detected}". Puedes continuar igual o corregir el selector de lenguaje.`,

    // Debug page
    debug_title: "Depurar error",
    debug_subtitle: "Pega tu error y el código para obtener un diagnóstico paso a paso",
    debug_error_label: "Mensaje de error",
    debug_error_placeholder: "TypeError: 'NoneType' object is not subscriptable\n  File 'app.py', línea 42...",
    debug_code_label: "Tu código",
    debug_code_placeholder: "# Pega el código que está causando el error...",
    debug_submit: "Depurar este error",
    debug_submitting: "Analizando...",

    // Analyze page
    analyze_title: "Analizar archivo",
    analyze_subtitle: "Sube un archivo de código o PDF para obtener un análisis estructurado",
    analyze_drop: "Arrastra un archivo aquí o haz clic para buscar",
    analyze_drop_hint: "Soporta: .py .js .ts .go .rs .java .html .css .json .md .txt .pdf",
    analyze_submit: "Analizar archivo",
    analyze_submitting: "Analizando...",

    // GitHub page
    github_title: "URL de GitHub",
    github_subtitle: "Pega una URL de GitHub para analizar el archivo directamente",
    github_url_label: "URL del archivo en GitHub",
    github_url_placeholder: "https://github.com/owner/repo/blob/main/src/utils.py",
    github_url_error: "La URL debe ser de un archivo de GitHub: https://github.com/owner/repo/blob/rama/ruta/archivo.py",
    github_submit: "Analizar archivo",
    github_submitting: "Obteniendo y analizando...",

    // History page
    history_title: "Historial",
    history_subtitle: "Tus conversaciones anteriores",
    history_empty: "Sin conversaciones todavía. ¡Empieza explicando o depurando código!",

    // Response
    response_generating: "Generando...",
    response_label: "Respuesta",
    response_copy: "Copiar",
    response_copied: "¡Copiado!",
  },
} as const;

export type TranslationKeys = keyof typeof translations.en;
export type Translations = typeof translations.en;

export function getTranslations(lang: AppLanguage) {
  return translations[lang];
}
