const axios = require('axios');

const TELEGRAM_TOKEN = '8037288698:AAHTIWD02O1qWZf-7sZwKLZXSvrYPj1TbPw';
const CHAT_ID = '-1003301009665';
const UMBRAL_ALERTA = -1.0;

// Configuración de "disfraz" para saltar el error 451
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'es-ES,es;q=0.9',
    'Referer': 'https://google.com'
};

async function monitorear() {
    console.log("🔍 Iniciando escaneo con modo incógnito...");

    try {
        // Probamos con una sola fuente ultra-segura primero
        const resBCV = await axios.get('https://ve.dolarapi.com/v1/dolares/oficial', { headers });
        const resCryp = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT', { headers });

        const bcvP = resBCV.data.promedio;
        const btcP = "$" + Math.round(resCryp.data.price).toLocaleString();

        const fecha = new Date().toLocaleTimeString('es-VE', { timeZone: 'America/Caracas' });
        
        const mensaje = `🛡️ <b>REPORTE ANTI-BLOQUEO ✅</b>\n\n` +
                      `🏛️ <b>BCV:</b> ${bcvP.toFixed(2)} BS\n` +
                      `🪙 <b>BTC:</b> ${btcP}\n\n` +
                      `📊 <b>Estado:</b> Conexión Estable\n` +
                      `🕒 <b>Hora:</b> ${fecha}\n\n` +
                      `🚀 <i>El sistema saltó la restricción 451.</i>`;

        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: mensaje,
            parse_mode: 'HTML'
        });

        console.log("✅ ¡LOGRADO! El mensaje llegó a Telegram.");

    } catch (error) {
        console.error("❌ Sigue el bloqueo 451. Intentando reporte de emergencia...");
        
        // Si todo falla, enviamos un mensaje de "Estoy Vivo" para confirmar Telegram
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: `⚠️ <b>Aviso del Sistema</b>\n\nGitHub sigue bloqueando las fuentes de datos (451), pero la conexión con Telegram está 100% ACTIVA.`
        });
    }
}

monitorear();
