const axios = require('axios');

const TELEGRAM_TOKEN = '8037288698:AAHTIWD02O1qWZf-7sZwKLZXSvrYPj1TbPw';
const CHAT_ID = '-1003301009665';

async function monitorear() {
    console.log("🛰️ Usando ruta alternativa vía CoinGecko...");

    try {
        // CoinGecko rara vez bloquea a GitHub. Vamos a pedir BTC, ETH y SOL de una vez.
        const resCryp = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd');
        
        // Fuente de respaldo para el dólar (esta suele ser invisible para los bloqueos)
        const resDolar = await axios.get('https://open.er-api.com/v6/latest/USD');

        const btcP = "$" + resCryp.data.bitcoin.usd.toLocaleString();
        const solP = "$" + resCryp.data.solana.usd.toFixed(2);
        
        // El cambio oficial aproximado (o paralelo base)
        const tasaBase = resDolar.data.rates.VES;

        const fecha = new Date().toLocaleTimeString('es-VE', { timeZone: 'America/Caracas' });
        
        const mensaje = `💎 <b>MONITOR MULTI-FUENTE (ACTIVO)</b>\n\n` +
                      `🏛️ <b>Dólar Ref:</b> ${tasaBase.toFixed(2)} BS\n` +
                      `🪙 <b>BTC:</b> ${btcP}\n` +
                      `☀️ <b>SOL:</b> ${solP}\n\n` +
                      `✅ <b>Estado:</b> Datos recuperados con éxito\n` +
                      `🕒 <b>Hora:</b> ${fecha}\n\n` +
                      `🚀 <i>¡Hemos saltado el bloqueo legal!</i>`;

        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: mensaje,
            parse_mode: 'HTML'
        });

        console.log("✅ ¡POR FIN! Datos enviados sin error 451.");

    } catch (error) {
        console.error("❌ Fallo en ruta alternativa:", error.message);
        
        // Si incluso esto falla, el problema es la IP de salida de GitHub.
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: `🔴 <b>Error Crítico:</b> Las fuentes de datos siguen inaccesibles desde este servidor.`
        });
    }
}

monitorear();
