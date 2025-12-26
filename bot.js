const axios = require('axios');

const TELEGRAM_TOKEN = '8037288698:AAHTIWD02O1qWZf-7sZwKLZXSvrYPj1TbPw';
const CHAT_ID = '-1003301009665';
const UMBRAL_ALERTA = -1.0; // Corregido: añadido el "="

async function monitorear() {
    console.log("🔍 Iniciando escaneo...");

    try {
        // Usamos fuentes ultra-estables que no bloquean a GitHub
        const [resBCV, resCryp] = await Promise.all([
            axios.get('https://ve.dolarapi.com/v1/dolares/oficial').then(r => r.data),
            axios.get('https://api.binance.com/api/v3/ticker/price?symbols=["BTCUSDT","ETHUSDT","SOLUSDT"]').then(r => r.data)
        ]);

        const bcvP = resBCV.promedio;
        const btcP = "$" + Math.round(resCryp[0].price).toLocaleString();
        const solP = "$" + parseFloat(resCryp[2].price).toFixed(2);

        // Simulación de Arbitraje con base en BCV para validar formato
        const compraSim = bcvP * 1.01;
        const ventaSim = bcvP * 1.03;
        const spread = ((ventaSim - compraSim) / compraSim) * 100;
        
        const fecha = new Date().toLocaleTimeString('es-VE', { timeZone: 'America/Caracas' });
        
        const mensaje = `🚀 <b>SISTEMA ONLINE ✅</b>\n\n` +
                      `🏛️ <b>BCV:</b> ${bcvP.toFixed(2)} BS\n` +
                      `🪙 <b>BTC:</b> ${btcP} | ☀️ <b>SOL:</b> ${solP}\n\n` +
                      `🛒 <b>Compra Sugerida:</b> ${compraSim.toFixed(2)} BS\n` +
                      `💰 <b>Venta Sugerida:</b> ${ventaSim.toFixed(2)} BS\n\n` +
                      `📊 <b>Spread:</b> ${spread.toFixed(2)}%\n` +
                      `🕒 <i>Vigilando el mercado: ${fecha}</i>\n\n` +
                      `✅ <i>La conexión con Telegram es exitosa.</i>`;

        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: mensaje,
            parse_mode: 'HTML'
        });

        console.log("✅ Reporte enviado a Telegram.");

    } catch (error) {
        console.error("❌ Error en el proceso:", error.message);
    }
}

monitorear();
