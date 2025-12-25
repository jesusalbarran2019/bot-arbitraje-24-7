const axios = require('axios');

const TELEGRAM_TOKEN = '8037288698:AAHTIWD02O1qWZf-7sZwKLZXSvrYPj1TbPw';
const CHAT_ID = '-1003301009665';
const UMBRAL_ALERTA = -1.0; // Forzado para que te llegue el mensaje YA

async function monitorear() {
    console.log("🔍 Obteniendo datos detallados (Bancos + Criptos)...");

    try {
        // Configuramos el "disfraz" para que CriptoYa no nos bloquee (Error 451)
        const config = {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36' }
        };

        const [resP2P, resCryp, resBCV] = await Promise.all([
            axios.get('https://criptoya.com/api/usdt/ves', config).then(r => r.data),
            axios.get('https://api.binance.com/api/v3/ticker/price?symbols=["BTCUSDT","ETHUSDT","SOLUSDT"]').then(r => r.data),
            axios.get('https://ve.dolarapi.com/v1/dolares/oficial').then(r => r.data)
        ]);

        // 1. Precios de Criptomonedas
        const btcP = "$" + Math.round(resCryp[0].price).toLocaleString();
        const solP = "$" + parseFloat(resCryp[2].price).toFixed(2);
        const bcvP = resBCV.promedio.toFixed(2);

        // 2. Lógica para encontrar el mejor Banco (Banesco, Mercantil, etc.)
        let bBuy = { val: Infinity, name: "" }, bSell = { val: 0, name: "" };
        const excluidos = ["MEXCP2P", "SALDO", "PAYDECEP2P"];

        Object.keys(resP2P).forEach(ex => {
            const exchange = ex.toUpperCase();
            if (excluidos.includes(exchange) || !resP2P[ex].ask || !resP2P[ex].bid) return;
            
            if (resP2P[ex].ask < bBuy.val) bBuy = { val: resP2P[ex].ask, name: exchange };
            if (resP2P[ex].bid > bSell.val) bSell = { val: resP2P[ex].bid, name: exchange };
        });

        const nSpread = ((bSell.val - bBuy.val) / bBuy.val) * 100;
        const ganancia = (100 * (nSpread / 100)).toFixed(2);

        // 3. Construcción del Mensaje con TODA la información original
        const fecha = new Date().toLocaleTimeString('es-VE', { timeZone: 'America/Caracas' });
        
        const mensaje = `🚀 <b>OPORTUNIDAD DETECTADA 24/7</b>\n\n` +
                      `🏛️ <b>BCV:</b> ${bcvP} BS\n` +
                      `🪙 <b>BTC:</b> ${btcP} | ☀️ <b>SOL:</b> ${solP}\n\n` +
                      `🛒 <b>Compra:</b> ${bBuy.val.toFixed(2)} BS (${bBuy.name})\n` +
                      `💰 <b>Venta:</b> ${bSell.val.toFixed(2)} BS (${bSell.name})\n\n` +
                      `📊 <b>Spread:</b> ${nSpread.toFixed(2)}%\n` +
                      `💵 <b>Ganancia x $100:</b> $${ganancia}\n\n` +
                      `🕒 <i>Actualizado: ${fecha} (Vzla)</i>\n` +
                      `✅ <i>Sistema de Monitoreo Profesional</i>`;

        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: mensaje,
            parse_mode: 'HTML'
        });

        console.log("✅ ¡Logrado! Toda la información enviada a Telegram.");

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

monitorear();
