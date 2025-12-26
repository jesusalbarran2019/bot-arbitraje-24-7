const axios = require('axios');

// Configuración de credenciales
const TELEGRAM_TOKEN = '8037288698:AAHTIWD02O1qWZf-7sZwKLZXSvrYPj1TbPw';
const CHAT_ID = '-1003301009665';

async function monitorear() {
    console.log("🚀 Iniciando Escaneo Multivariable de Exchanges...");

    try {
        // 1. Obtenemos datos de Cripto Global (BTC/SOL)
        // 2. Obtenemos la tasa BCV oficial
        // 3. Obtenemos la data de Exchanges vía Vexchange (No bloqueado por GitHub)
        const [resCryp, resBCV, resEx] = await Promise.all([
            axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,solana&vs_currencies=usd'),
            axios.get('https://ve.dolarapi.com/v1/dolares/oficial'),
            axios.get('https://api.vexchange.io/v1/p2p/usdt/ves')
        ]);

        // Datos de Criptos
        const btc = "$" + resCryp.data.bitcoin.usd.toLocaleString();
        const sol = "$" + resCryp.data.solana.usd.toFixed(2);
        
        // Datos de BCV
        const bcv = resBCV.data.promedio;

        // Datos de Exchanges (Variables y Reales)
        const listaEx = resEx.data; // Es un array de objetos con los precios actuales
        
        // Función para extraer el precio de un exchange específico del array
        const findEx = (name) => {
            const found = listaEx.find(e => e.exchange.toLowerCase() === name.toLowerCase());
            // Si no lo encuentra (ej. mantenimiento), devuelve un aproximado basado en el mercado
            return found ? found.price : (listaEx[0].price); 
        };

        const precios = {
            binance: findEx('binance'),
            bybit: findEx('bybit'),
            okx: findEx('okx'),
            bitget: findEx('bitget'),
            bingx: findEx('bingx')
        };

        const fecha = new Date().toLocaleTimeString('es-VE', { timeZone: 'America/Caracas' });

        // Construcción del mensaje profesional
        const mensaje = `🚀 <b>SISTEMA DE ARBITRAJE PROFESIONAL</b>\n\n` +
                      `🏛️ <b>Tasa BCV:</b> ${bcv.toFixed(2)} BS\n\n` +
                      `🔶 <b>BINANCE:</b> ${precios.binance.toFixed(2)} BS\n` +
                      `🟡 <b>BYBIT:</b> ${precios.bybit.toFixed(2)} BS\n` +
                      `⬛ <b>OKX:</b> ${precios.okx.toFixed(2)} BS\n` +
                      `🔷 <b>BITGET:</b> ${precios.bitget.toFixed(2)} BS\n` +
                      `🍀 <b>BINGX:</b> ${precios.bingx.toFixed(2)} BS\n\n` +
                      `🪙 <b>BTC:</b> ${btc} | ☀️ <b>SOL:</b> ${sol}\n\n` +
                      `📊 <b>Spread P2P:</b> ${(((precios.binance / bcv) - 1) * 100).toFixed(2)}%\n` +
                      `🕒 <b>Actualizado:</b> ${fecha}\n\n` +
                      `✅ <b>Monitoreo Multi-Fuente Activo</b>`;

        // Envío a Telegram
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: mensaje,
            parse_mode: 'HTML'
        });

        console.log("✅ Reporte consolidado enviado con éxito.");

    } catch (error) {
        console.error("❌ Error en la ejecución:", error.message);
        
        // Intento de aviso por Telegram si hay un fallo crítico
        try {
            await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
                chat_id: CHAT_ID,
                text: `⚠️ <b>Aviso:</b> Error de conexión con los Exchanges. Reintentando en la próxima ejecución.`
            });
        } catch (tErr) {
            console.log("No se pudo enviar el error a Telegram.");
        }
    }
}

// Ejecutar la función
monitorear();
