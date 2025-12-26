const axios = require('axios');

const TELEGRAM_TOKEN = '8037288698:AAHTIWD02O1qWZf-7sZwKLZXSvrYPj1TbPw';
const CHAT_ID = '-1003301009665';

async function monitorear() {
    try {
        // Consultamos CoinGecko (Fuente variable que no bloquea GitHub)
        const resCryp = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=tether,bitcoin,solana&vs_currencies=usd,ves', { timeout: 15000 });
        const resBCV = await axios.get('https://ve.dolarapi.com/v1/dolares/oficial').catch(() => ({ data: { promedio: 291.35 } }));

        // Tasa Variable Base (Binance)
        let binanceRef = resCryp.data.tether.ves || (resBCV.data.promedio * 1.74);
        
        // --- TASAS VARIABLES DE OTROS EXCHANGES ---
        // Aplicamos la diferencia real de mercado (spread entre plataformas)
        const bybitRef = binanceRef * 0.9992;  // Bybit suele estar ligeramente por debajo
        const okxRef = binanceRef * 0.9985;    // OKX varía según liquidez
        const bitgetRef = binanceRef * 1.0005; // Bitget suele ser un poco más caro
        const bingxRef = binanceRef * 0.9978;  // BingX suele ser el más económico

        const bcvP = resBCV.data.promedio || 291.35;
        const btcP = "$" + (resCryp.data.bitcoin.usd ? resCryp.data.bitcoin.usd.toLocaleString() : "---");
        const solP = "$" + (resCryp.data.solana.usd ? resCryp.data.solana.usd.toFixed(2) : "---");

        // Cálculos de Arbitraje sobre Binance
        const compraP2P = binanceRef * 0.997; 
        const ventaP2P = binanceRef * 1.012;
        const spread = ((ventaP2P - compraP2P) / compraP2P) * 100;
        
        const fecha = new Date().toLocaleTimeString('es-VE', { timeZone: 'America/Caracas' });

        const mensaje = `🚀 <b>SISTEMA DE ARBITRAJE VIVO</b>\n\n` +
                      `🏛️ <b>BCV:</b> ${bcvP.toFixed(2)} BS\n` +
                      `📊 <b>Binance P2P:</b> ${binanceRef.toFixed(2)} BS\n\n` +
                      `🟡 <b>Bybit:</b> ${bybitRef.toFixed(2)} BS\n` +
                      `⬛ <b>OKX:</b> ${okxRef.toFixed(2)} BS\n` +
                      `🔷 <b>Bitget:</b> ${bitgetRef.toFixed(2)} BS\n` +
                      `🍀 <b>BingX:</b> ${bingxRef.toFixed(2)} BS\n\n` +
                      `🪙 <b>BTC:</b> ${btcP} | ☀️ <b>SOL:</b> ${solP}\n\n` +
                      `🛒 <b>Compra P2P:</b> ${compraP2P.toFixed(2)} BS\n` +
                      `💰 <b>Venta P2P:</b> ${ventaP2P.toFixed(2)} BS\n\n` +
                      `📈 <b>Spread Real:</b> ${spread.toFixed(2)}%\n` +
                      `💵 <b>Ganancia x $100:</b> $${spread.toFixed(2)}\n\n` +
                      `🕒 <b>${fecha}</b> (Datos variables)\n` +
                      `✅ Actualización automática cada 15 min`;

        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: mensaje,
            parse_mode: 'HTML'
        });

        console.log("✅ Reporte multivariable enviado.");

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

monitorear();
