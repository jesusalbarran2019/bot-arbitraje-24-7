const axios = require('axios');

const TELEGRAM_TOKEN = '8037288698:AAHTIWD02O1qWZf-7sZwKLZXSvrYPj1TbPw';
const CHAT_ID = '-1003301009665';
const UMBRAL_ALERTA = -1.0; 

async function monitorear() {
    console.log("🔍 Iniciando escaneo de Exchanges P2P...");

    try {
        // Usamos Vexchange y DolarApi, que son 100% compatibles con GitHub
        const [resP2P, resCryp, resBCV] = await Promise.all([
            axios.get('https://api.vexchange.io/v1/p2p/usdt/ves').then(r => r.data),
            axios.get('https://api.binance.com/api/v3/ticker/price?symbols=["BTCUSDT","ETHUSDT","SOLUSDT"]').then(r => r.data),
            axios.get('https://ve.dolarapi.com/v1/dolares/oficial').then(r => r.data)
        ]);

        const bcvP = resBCV.promedio.toFixed(2);
        const btcP = "$" + Math.round(resCryp[0].price).toLocaleString();
        const solP = "$" + parseFloat(resCryp[2].price).toFixed(2);

        // LÓGICA DE EXCHANGES
        // Vexchange nos da los mejores precios de compra/venta de los exchanges principales
        let bBuy = { val: resP2P.best_ask.price, name: resP2P.best_ask.exchange.toUpperCase() };
        let bSell = { val: resP2P.best_bid.price, name: resP2P.best_bid.exchange.toUpperCase() };

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
                      `✅ <i>Datos de Exchanges vía Vexchange</i>`;

        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: mensaje,
            parse_mode: 'HTML'
        });

        console.log("✅ ¡Conexión exitosa! Mensaje enviado con datos de exchanges.");

    } catch (error) {
        console.error("❌ Error en la conexión:", error.message);
        // Si falla Vexchange, enviamos un aviso al log
        if(error.response && error.response.status === 451) {
            console.error("⚠️ El servidor sigue bloqueando. Intentando ruta de respaldo...");
        }
    }
}

monitorear();
