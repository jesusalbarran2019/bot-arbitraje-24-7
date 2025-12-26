const axios = require('axios');

const TELEGRAM_TOKEN = '8037288698:AAHTIWD02O1qWZf-7sZwKLZXSvrYPj1TbPw';
const CHAT_ID = '-1003301009665';
const UMBRAL_ALERTA = -1.0; // Lo dejamos en negativo para que veas los datos de una vez

async function getBinanceP2P(tradeType) {
    const url = 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search';
    const payload = {
        "asset": "USDT",
        "fiat": "VES",
        "merchantCheck": false,
        "page": 1,
        "payTypes": [],
        "publisherType": null,
        "rows": 5,
        "tradeType": tradeType 
    };
    const res = await axios.post(url, payload);
    // Tomamos el primer precio de la lista
    return parseFloat(res.data.data[0].adv.price);
}

async function monitorear() {
    console.log("🔍 Obteniendo datos reales de Binance P2P...");

    try {
        // Obtenemos los precios directos (Fuentes que NO bloquean)
        const [p2pBuy, p2pSell, resCryp, resBCV] = await Promise.all([
            getBinanceP2P("BUY"),
            getBinanceP2P("SELL"),
            axios.get('https://api.binance.com/api/v3/ticker/price?symbols=["BTCUSDT","ETHUSDT","SOLUSDT"]').then(r => r.data),
            axios.get('https://ve.dolarapi.com/v1/dolares/oficial').then(r => r.data)
        ]);

        const bcvP = resBCV.promedio.toFixed(2);
        const btcP = "$" + Math.round(resCryp[0].price).toLocaleString();
        const solP = "$" + parseFloat(resCryp[2].price).toFixed(2);

        // En el P2P: 
        // El precio "BUY" de los anuncios es donde la gente vende (nosotros compramos)
        // El precio "SELL" de los anuncios es donde la gente compra (nosotros vendemos)
        const nSpread = ((p2pSell - p2pBuy) / p2pBuy) * 100;
        const ganancia = (100 * (nSpread / 100)).toFixed(2);
        const fecha = new Date().toLocaleTimeString('es-VE', { timeZone: 'America/Caracas' });
        
        const mensaje = `🚀 <b>SISTEMA DE ARBITRAJE BINANCE</b>\n\n` +
                      `🏛️ <b>BCV:</b> ${bcvP} BS\n` +
                      `🪙 <b>BTC:</b> ${btcP} | ☀️ <b>SOL:</b> ${solP}\n\n` +
                      `🛒 <b>Compra P2P:</b> ${p2pBuy.toFixed(2)} BS\n` +
                      `💰 <b>Venta P2P:</b> ${p2pSell.toFixed(2)} BS\n\n` +
                      `📊 <b>Spread:</b> ${nSpread.toFixed(2)}%\n` +
                      `💵 <b>Ganancia x $100:</b> $${ganancia}\n\n` +
                      `🕒 <i>Actualizado: ${fecha} (Vzla)</i>\n` +
                      `✅ <i>Datos directos sin intermediarios</i>`;

        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: mensaje,
            parse_mode: 'HTML'
        });

        console.log("✅ ¡Éxito! Reporte de Binance enviado.");

    } catch (error) {
        console.error("❌ Error obteniendo datos:", error.message);
    }
}

monitorear();
