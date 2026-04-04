const i18n = {
  en: {
    title: "Language Learning",
    input: "Input Text",
    voice: "Voice Input",
    process: "AI Process",
    follow: "Practice",
    words: "Word Book",
    history: "History",
    member: "Membership",
    trial: "7 Days Free",
    shadow: "Shadow 10x",
    scene: "Scene Challenge",
    import: "Import Words",
    review: "Review",
    dictation: "Dictation",
    register: "Register",
    login: "Login"
  },
  es: {
    title: "Aprendizaje",
    input: "Texto",
    voice: "Voz",
    process: "Procesar",
    follow: "Practicar",
    words: "Palabras",
    history: "Historial",
    member: "Membresía",
    trial: "7 Días Gratis",
    shadow: "Repite 10x",
    scene: "Escenario",
    import: "Importar",
    review: "Repasar",
    dictation: "Dictado",
    register: "Registrarse",
    login: "Iniciar Sesión"
  },
  zh: {
    title: "语言学习",
    input: "输入文字",
    voice: "语音输入",
    process: "AI处理",
    follow: "跟读练习",
    words: "单词本",
    history: "学习历史",
    member: "会员中心",
    trial: "7天免费试用",
    shadow: "影子10遍",
    scene: "情境挑战",
    import: "导入单词",
    review: "复习单词",
    dictation: "听写测试",
    register: "注册",
    login: "登录"
  }
};

function initI18n() {
  const lang = navigator.language || "en";
  let current = "en";
  if (lang.startsWith("zh")) current = "zh";
  if (lang.startsWith("es")) current = "es";
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (i18n[current][key]) el.textContent = i18n[current][key];
  });
}
