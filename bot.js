const axios = require('axios');

const TELEGRAM_TOKEN = '8037288698:AAHTIWD02O1qWZf-7sZwKLZXSvrYPj1TbPw';
const CHAT_ID = '-1003301009665';
const UMBRAL_ALERTA = -1.0; 

async function monitorear() {
    console.log("🔍 Conectando con los Exchanges P2P...");

    try {
        // Usamos un servicio de Proxy para saltar el bloqueo 451 de CriptoYa
        // Esto hace que la petición parezca venir de un origen aceptado
        const urlP2P = 'https://api.allorigins.win/get?url=' + encodeURIComponent('https://criptoya.com/api/usdt/ves');

        const [resProxy, resCryp, resBCV] = await Promise.all([
            axios.get(urlP2P).then(r => JSON.parse(r.data.contents)),
            axios.get('https://api.binance.com/api/v3/ticker/price?symbols=["BTCUSDT","ETHUSDT","SOLUSDT"]').then(r => r.data),
            axios.get('https://ve.dolarapi.com/v1/dolares/oficial').then(r => r.data)
        ]);

        const bcvP = resBCV.promedio.toFixed(2);
        const btcP = "$" + Math.round(resCryp[0].price).toLocaleString();
        const solP = "$" + parseFloat(resCryp[2].price).toFixed(2);

        // LÓGICA DE EXCHANGES (Binance, Bybit, Huobi, etc.)
        let bBuy = { val: Infinity, name: "" }, bSell = { val: 0, name: "" };
        const excluidos = ["MEXCP2P", "SALDO", "PAYDECEP2P"];

        Object.keys(resProxy).forEach(ex => {
            const exchange = ex.toUpperCase();
            if (excluidos.includes(exchange) || !resProxy[ex].ask || !resProxy[ex].bid) return;
            
            if (resProxy[ex].ask < bBuy.val) bBuy = { val: resProxy[ex].ask, name: exchange };
            if (resProxy[ex].bid > bSell.val) bSell = { val: resProxy[ex].bid, name: exchange };
        });

        const nSpread = ((bSell.val - bBuy.val) / bBuy.val) * 100;
        const ganancia = (100 * (nSpread / 100)).toFixed(2);
        const fecha = new Date().toLocaleTimeString('es-VE', { timeZone: 'America/Caracas' });
        
        const mensaje = `🚀 <b>OPORTUNIDAD DETECTADA 24/7</b>\n\n` +
                      `🏛️ <b>BCV:</b> ${bcvP} BS\n` +
                      `🪙 <b>BTC:</b> ${btcP} | ☀️ <b>SOL:</b> ${solP}\n\n` +
                      `🛒 <b>Compra:</b> ${bBuy.val.toFixed(2)} BS (${bBuy.name})\n` +
                      `💰 <b>Venta:</b> ${bSell.val.toFixed(2)} BS (${bSell.name})\n\n` +
                      `📊 <b>Spread:</b> ${nSpread.toFixed(2)}%\n` +
                      `💵 <b>Ganancia x $100:</b> $${ganancia}\n\n` +
                      `🕒 <i>Actualizado: ${fecha} (Vzla)</i>\n` +
                      `✅ <i>Datos de Exchanges P2P en tiempo real</i>`;

        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: mensaje,
            parse_mode: 'HTML'
        });

        console.log("✅ ¡Conexión exitosa! Datos de exchanges enviados.");

    } catch (error) {
        console.error("❌ Error en la conexión:", error.message);
    }
}

monitorear();
