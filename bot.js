const axios = require('axios');

// CONFIGURACIÓN (Tus mismos datos)
const TELEGRAM_TOKEN = '8037288698:AAHTIWD02O1qWZf-7sZwKLZXSvrYPj1TbPw';
const CHAT_ID = '-1003301009665';
const UMBRAL_ALERTA = 0.50; // Puedes cambiarlo aquí
const COOLDOWN_MINUTOS = 10;

let lastAlertTime = 0;
let historialBot = [];

console.log("🚀 Motor MASTER PRO V6 iniciado 24/7...");

async function monitorear() {
    try {
        // 1. Obtener datos de P2P, Criptos y BCV
        const [resP2P, resCryp, resBCV] = await Promise.all([
            axios.get('https://criptoya.com/api/usdt/ves').then(r => r.data),
            axios.get('https://api.binance.com/api/v3/ticker/price?symbols=["BTCUSDT","ETHUSDT","SOLUSDT"]').then(r => r.data),
            axios.get('https://ve.dolarapi.com/v1/dolares/oficial').then(r => r.data)
        ]);

        const bcvP = resBCV.promedio.toFixed(2);
        const btcP = "$" + Math.round(resCryp[0].price).toLocaleString();
        const ethP = "$" + Math.round(resCryp[1].price).toLocaleString();
        const solP = "$" + parseFloat(resCryp[2].price).toFixed(2);

        // 2. Buscar mejores precios (Lógica AUTO)
        let bBuy = { val: Infinity, name: "" }, bSell = { val: 0, name: "" };
        
        Object.keys(resP2P).forEach(ex => {
            if (["MEXCP2P", "SALDO", "PAYDECEP2P"].includes(ex.toUpperCase()) || !resP2P[ex].ask) return;
            if (resP2P[ex].ask < bBuy.val) bBuy = { val: resP2P[ex].ask, name: ex };
            if (resP2P[ex].bid > bSell.val) bSell = { val: resP2P[ex].bid, name: ex };
        });

        const nSpread = ((bSell.val - bBuy.val) / bBuy.val) * 100;
        const pUSD = (100 * (nSpread / 100)).toFixed(2);

        // 3. Verificar Alerta y Cooldown
        const ahora = Date.now();
        if (nSpread >= UMBRAL_ALERTA && (ahora - lastAlertTime > COOLDOWN_MINUTOS * 60000)) {
            
            const move = `${new Date().toLocaleTimeString()} | ${bBuy.name.toUpperCase()}➔${bSell.name.toUpperCase()} | +${nSpread.toFixed(2)}%`;
            historialBot.unshift(move); if(historialBot.length > 5) historialBot.pop();

            const msg = `🚀 <b>Oportunidad 24/7 Detectada</b>\n\n` +
                        `🏛️ <b>BCV: ${bcvP}</b>\n` +
                        `🪙 <b>BTC: ${btcP}</b> | 🔹 <b>ETH: ${ethP}</b> | ☀️ <b>SOL: ${solP}</b>\n\n` +
                        `🛒 <b>Compra:</b> ${bBuy.val.toFixed(2)} BS (${bBuy.name.toUpperCase()})\n` +
                        `💰 <b>Venta:</b> ${bSell.val.toFixed(2)} BS (${bSell.name.toUpperCase()})\n\n` +
                        `📊 <b>Spread:</b> ${nSpread.toFixed(2)}%\n` +
                        `💵 <b>Ganancia x $100:</b> $${pUSD}\n\n` +
                        `⏳ <b>ÚLTIMOS 5:</b>\n<code>${historialBot.join('\n')}</code>`;

            await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
                chat_id: CHAT_ID,
                text: msg,
                parse_mode: 'HTML'
            });

            console.log(`✅ Alerta enviada: ${nSpread.toFixed(2)}%`);
            lastAlertTime = ahora;
        }

    } catch (error) {
        console.error("❌ Error en monitoreo:", error.message);
    }
}

// Ejecutar cada 15 segundos para no saturar las APIs
setInterval(monitorear, 15000);
