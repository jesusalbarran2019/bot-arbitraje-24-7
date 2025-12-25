const axios = require('axios');

// ==========================================
// CONFIGURACIÓN DEL BOT
// ==========================================
const TELEGRAM_TOKEN = '8037288698:AAHTIWD02O1qWZf-7sZwKLZXSvrYPj1TbPw';
const CHAT_ID = '-1003301009665';
const UMBRAL_ALERTA = 0.50; // Se activa si el spread es mayor a 0.50%

async function monitorear() {
    console.log("🔍 Iniciando escaneo de mercado...");

    try {
        // 1. Obtención de datos en paralelo
        const [resP2P, resCryp, resBCV] = await Promise.all([
            axios.get('https://criptoya.com/api/usdt/ves').then(r => r.data),
            axios.get('https://api.binance.com/api/v3/ticker/price?symbols=["BTCUSDT","ETHUSDT","SOLUSDT"]').then(r => r.data),
            axios.get('https://ve.dolarapi.com/v1/dolares/oficial').then(r => r.data)
        ]);

        // Precios de referencia
        const bcvP = resBCV.promedio.toFixed(2);
        const btcP = "$" + Math.round(resCryp[0].price).toLocaleString();
        const ethP = "$" + Math.round(resCryp[1].price).toLocaleString();
        const solP = "$" + parseFloat(resCryp[2].price).toFixed(2);

        // 2. Lógica de Arbitraje P2P (Buscando el mejor Spread)
        let bBuy = { val: Infinity, name: "" }, bSell = { val: 0, name: "" };
        
        const excluidos = ["MEXCP2P", "SALDO", "PAYDECEP2P"];

        Object.keys(resP2P).forEach(ex => {
            const exchange = ex.toUpperCase();
            if (excluidos.includes(exchange) || !resP2P[ex].ask || !resP2P[ex].bid) return;
            
            if (resP2P[ex].ask < bBuy.val) bBuy = { val: resP2P[ex].ask, name: exchange };
            if (resP2P[ex].bid > bSell.val) bSell = { val: resP2P[ex].bid, name: exchange };
        });

        const nSpread = ((bSell.val - bBuy.val) / bBuy.val) * 100;
        const gananciaDolar = (100 * (nSpread / 100)).toFixed(2);

        console.log(`📊 Spread detectado: ${nSpread.toFixed(2)}%`);

        // 3. Condición de envío de Alerta
        if (nSpread >= UMBRAL_ALERTA) {
            const fecha = new Date().toLocaleTimeString('es-VE', { timeZone: 'America/Caracas' });
            
            const mensaje = `🚀 <b>OPORTUNIDAD DETECTADA 24/7</b>\n\n` +
                          `🏛️ <b>BCV:</b> ${bcvP} BS\n` +
                          `🪙 <b>BTC:</b> ${btcP} | ☀️ <b>SOL:</b> ${solP}\n\n` +
                          `🛒 <b>Compra:</b> ${bBuy.val.toFixed(2)} BS (${bBuy.name})\n` +
                          `💰 <b>Venta:</b> ${bSell.val.toFixed(2)} BS (${bSell.name})\n\n` +
                          `📊 <b>Spread:</b> ${nSpread.toFixed(2)}%\n` +
                          `💵 <b>Ganancia x $100:</b> $${gananciaDolar}\n\n` +
                          `🕒 <i>Actualizado: ${fecha} (Vzla)</i>`;

            await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
                chat_id: CHAT_ID,
                text: mensaje,
                parse_mode: 'HTML'
            });

            console.log("✅ Alerta enviada a Telegram exitosamente.");
        } else {
            console.log("⚠️ Spread insuficiente. No se envió alerta.");
        }

    } catch (error) {
        console.error("❌ Error obteniendo datos:", error.message);
    }
    
    console.log("💤 Ciclo finalizado.");
}

// Ejecutar la función una única vez por cada ciclo de GitHub Actions
monitorear();

