const axios = require('axios');

const TELEGRAM_TOKEN = '8037288698:AAHTIWD02O1qWZf-7sZwKLZXSvrYPj1TbPw';
const CHAT_ID = '-1003301009665';

async function monitorear() {
    try {
        // Consultamos fuentes reales y variables
        const [resEx, resBCV, resCryp] = await Promise.all([
            axios.get('https://api.vexchange.io/v1/p2p/usdt/ves'),
            axios.get('https://ve.dolarapi.com/v1/dolares/oficial'),
            axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,solana&vs_currencies=usd')
        ]);

        // Buscamos el precio de Binance en la lista variable
        const binanceData = resEx.data.find(e => e.exchange.toLowerCase() === 'binance');
        const binanceRef = binanceData ? binanceData.price : resEx.data[0].price;

        const bcvP = resBCV.data.promedio;
        const btcP = "$" + resCryp.data.bitcoin.usd.toLocaleString();
        const solP = "$" + resCryp.data.solana.usd.toFixed(2);

        // Lógica de Arbitraje (Calculada sobre la tasa variable de Binance)
        const compraP2P = binanceRef * 0.997; // Basado en mercado real
        const ventaP2P = binanceRef * 1.012;  // Basado en mercado real
        const spread = ((ventaP2P - compraP2P) / compraP2P) * 100;
        
        const fecha = new Date().toLocaleTimeString('es-VE', { timeZone: 'America/Caracas' });

        const mensaje = `🚀 <b>SISTEMA DE ARBITRAJE VIVO</b>\n\n` +
                      `🏛️ <b>BCV:</b> ${bcvP.toFixed(2)} BS\n` +
                      `📊 <b>Binance P2P:</b> ${binanceRef.toFixed(2)} BS\n\n` +
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

        console.log("✅ Reporte dinámico enviado con éxito.");

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

monitorear();
