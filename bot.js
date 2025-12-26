const axios = require('axios');

const TELEGRAM_TOKEN = '8037288698:AAHTIWD02O1qWZf-7sZwKLZXSvrYPj1TbPw';
const CHAT_ID = '-1003301009665';

async function pruebaSimple() {
    console.log("🚀 Iniciando prueba de envío a Telegram...");

    const mensaje = `🔔 <b>PRUEBA DE CONEXIÓN</b>\n\n` +
                  `✅ El bot está vivo.\n` +
                  `📡 Servidor: GitHub Actions\n` +
                  `🕒 Hora: ${new Date().toLocaleString('es-VE', { timeZone: 'America/Caracas' })}`;

    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: mensaje,
            parse_mode: 'HTML'
        });
        console.log("✅ ¡MENSAJE ENVIADO! Revisa tu grupo de Telegram.");
    } catch (error) {
        console.error("❌ Error al enviar:");
        if (error.response) {
            console.error("Código de error:", error.response.status);
            console.error("Detalle:", error.response.data.description);
        } else {
            console.error(error.message);
        }
    }
}

pruebaSimple();
