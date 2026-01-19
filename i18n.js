const i18n = {
    zh: {
        meta: {
            title: "常轨磁悬浮技术 - 开启交通新纪元",
            description: "基于现有铁轨的磁悬浮技术方案，让交通更高效、更环保、更经济。"
        },
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
            desc: "我们的方案基于铁磁材料的简单特性。这意味着它可以在任何铁轨上运行，无需建造昂贵的专用基础设施。",
            passive: "被动悬浮",
            passiveDesc: "基于特殊排列的永磁体，无需外部电力即可实现物体悬浮。",
            active: "动态控制",
            activeDesc: "通过混合磁场动态主动控制，确保完美的中心对齐，即使轨道有微小瑕疵也能平稳运行。"
        },
        sim: {
            coilL: "左线圈电流",
            coilR: "右线圈电流",
            offset: "横向偏移",
            hint: "← 移动鼠标模拟轨道波动 →"
        },
        benefits: {
            title: "为什么选择常轨磁悬浮？",
            frictionless: "告别摩擦",
            frictionlessDesc: "悬浮消除物理接触，大幅提升效率，降低噪音与振动，适用于从城市轻轨到超级高铁的各种场景。",
            zerospeed: "高效调度",
            zerospeedDesc: "将时间自由度还给用户，而非列车时刻表。",
            eco: "经济环保",
            ecoDesc: "利用现有铁轨进行改造，无需电气化轨道。相比传统磁悬浮，建设与运营成本降低 60% 以上。"
        },
        apps: {
            title: "赋能未来城市交通",
            desc: "从轨道交通出行方式的扩展，到工业自动化物流，常轨磁悬浮技术为未来运输提供了无限可能。",
            item1: "自适应分布式运输体系",
            item2: "工业自动化集装箱运输",
            item3: "跨城市高速客运系统",
            videoFallback: "您的浏览器不支持视频播放。"
        },
        contact: {
            title: "联系我们",
            formTitle: "发送消息",
            name: "您的姓名",
            email: "您的邮箱",
            subject: "主题",
            message: "您的留言",
            submit: "发送消息",
            sending: "发送中...",
            success: "消息发送成功！",
            error: "发送失败，请稍后再试。",
            networkError: "发生错误，请检查网络连接。",
            infoDesc1: "MagTech 是一项极具颠覆性且极其灵活的创新，可应用于多个领域。",
            infoDesc2: "我们的团队随时为您解答疑问，并为您的业务研究最佳解决方案。",
            business: "业务咨询"
        },
        footer: {
            privacy: "隐私政策",
            cookie: "Cookie 政策",
            top: "回到顶部 ↑",
            copyright: "© 2026 magtech. All rights reserved."
        }
    },
    en: {
        meta: {
            title: "MagTech - New Era of Transportation",
            description: "Maglev technology based on existing rails, making transportation more efficient, eco-friendly, and economical."
        },
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
            desc: "Our solution relies on the simple properties of ferromagnetic materials. This means it works on any rail, without expensive dedicated infrastructure.",
            passive: "Passive Levitation",
            passiveDesc: "Specially arranged permanent magnets enable levitation without external power.",
            active: "Dynamic Control",
            activeDesc: "Hybrid magnetic field control ensures perfect alignment even on imperfect tracks."
        },
        sim: {
            coilL: "L-Coil Current",
            coilR: "R-Coil Current",
            offset: "Lateral Offset",
            hint: "← Move mouse to simulate rail fluctuation →"
        },
        benefits: {
            title: "Why Choose MagTech?",
            frictionless: "Frictionless",
            frictionlessDesc: "Levitation eliminates physical contact, drastically improving efficiency and reducing noise/vibration. Suitable for everything from light rail to hyperloops.",
            zerospeed: "Efficient Scheduling",
            zerospeedDesc: "Return the time dimension to users, not train schedules.",
            eco: "Economical & Eco-friendly",
            ecoDesc: "Retrofit existing rails without electrification. Reduces construction and operating costs by over 60% compared to traditional maglev."
        },
        apps: {
            title: "Empowering Future Urban Transport",
            desc: "From expanding rail transit options to industrial automated logistics, MagTech offers infinite possibilities for future transportation.",
            item1: "Adaptive Distributed Transport System",
            item2: "Industrial Automated Container Transport",
            item3: "Inter-city High-speed Passenger System",
            videoFallback: "Your browser does not support video playback."
        },
        contact: {
            title: "Contact Us",
            formTitle: "Send Message",
            name: "Your Name",
            email: "Your Email",
            subject: "Subject",
            message: "Your Message",
            submit: "Send Message",
            sending: "Sending...",
            success: "Message sent successfully!",
            error: "Failed to send, please try again later.",
            networkError: "An error occurred, please check your connection.",
            infoDesc1: "MagTech is a disruptive and extremely flexible innovation applicable to multiple fields.",
            infoDesc2: "Our team is ready to answer your questions and research the best solutions for your business.",
            business: "Business Inquiries"
        },
        footer: {
            privacy: "Privacy Policy",
            cookie: "Cookie Policy",
            top: "Back to Top ↑",
            copyright: "© 2026 magtech. All rights reserved."
        }
    }
};

let currentLang = localStorage.getItem("lang") || "zh";

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";

    // Update Title and Meta Description
    document.title = i18n[lang].meta.title;
    document.querySelector('meta[name="description"]').setAttribute("content", i18n[lang].meta.description);

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const keys = el.dataset.i18n.split(".");
        let text = i18n[lang];
        keys.forEach(k => text = text?.[k]);

        if (text) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = text;
            } else {
                el.innerHTML = text;
            }
        }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const keys = el.dataset.i18nPlaceholder.split(".");
        let text = i18n[currentLang];
        keys.forEach(k => text = text?.[k]);
        if (text) el.placeholder = text;
    });


    document.getElementById("lang-btn").innerText = lang === "zh" ? "EN" : "中文";
}

document.getElementById("lang-btn").addEventListener("click", () => {
    setLanguage(currentLang === "zh" ? "en" : "zh");
});

// 初始化
setLanguage(currentLang);
