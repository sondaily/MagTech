const i18n = {
    zh: {
        nav: {
            home: "首页",
            tech: "技术原理",
            benefits: "核心优势",
            apps: "应用场景",
            contact: "联系我们"
        },
        hero: {
            title: "让磁悬浮<br><span style='color: var(--primary)'>在现有轨道</span>上飞驰",
            desc: "无需电力，无需新建轨道，在普通铁轨上实现静默、无摩擦的悬浮运输。",
            button: "了解技术细节"
        },
        tech: {
            title: "磁悬浮，从此简单高效",
            passive: "被动悬浮",
            passiveDesc: "基于特殊排列的永磁体，无需外部电力即可实现物体悬浮。",
            active: "动态控制",
            activeDesc: "通过混合磁场动态主动控制，确保完美的中心对齐。"
        },
        contact: {
            title: "联系我们",
            send: "发送消息",
            name: "您的姓名",
            email: "您的邮箱",
            subject: "主题",
            message: "您的留言",
            submit: "发送消息"
        }
    },
    en: {
        nav: {
            home: "Home",
            tech: "Technology",
            benefits: "Advantages",
            apps: "Applications",
            contact: "Contact"
        },
        hero: {
            title: "Maglev<br><span style='color: var(--primary)'>on Existing Railways</span>",
            desc: "No power supply, no new tracks. Silent, frictionless levitation on standard rails.",
            button: "Explore the Technology"
        },
        tech: {
            title: "Maglev Made Simple and Efficient",
            passive: "Passive Levitation",
            passiveDesc: "Specially arranged permanent magnets enable levitation without external power.",
            active: "Dynamic Control",
            activeDesc: "Hybrid magnetic field control ensures perfect alignment even on imperfect tracks."
        },
        contact: {
            title: "Contact Us",
            send: "Send Message",
            name: "Your Name",
            email: "Your Email",
            subject: "Subject",
            message: "Your Message",
            submit: "Send"
        }
    }
};

let currentLang = localStorage.getItem("lang") || "zh";

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const keys = el.dataset.i18n.split(".");
        let text = i18n[lang];
        keys.forEach(k => text = text?.[k]);

        if (text) el.innerHTML = text;
    });

    document.getElementById("lang-btn").innerText = lang === "zh" ? "EN" : "中文";
}

document.getElementById("lang-btn").addEventListener("click", () => {
    setLanguage(currentLang === "zh" ? "en" : "zh");
});

// 初始化
setLanguage(currentLang);
