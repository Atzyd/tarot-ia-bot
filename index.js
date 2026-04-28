require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GEMINI_KEY = process.env.GEMINI_KEY;

const cartasTarot = [
    { nombre: "El Loco", significado: "nuevos comienzos." },
    { nombre: "El Mago", significado: "poder personal." },
    { nombre: "La Sacerdotisa", significado: "intuición." },
    { nombre: "La Emperatriz", significado: "abundancia." },
    { nombre: "El Emperador", significado: "autoridad." },
    { nombre: "El Hierofante", significado: "sabiduría." },
    { nombre: "Los Enamorados", significado: "decisiones." },
    { nombre: "El Carro", significado: "victoria." },
    { nombre: "La Fuerza", significado: "coraje." },
    { nombre: "El Ermitaño", significado: "reflexión." },
    { nombre: "La Rueda de la Fortuna", significado: "cambio." },
    { nombre: "La Justicia", significado: "equilibrio." },
    { nombre: "El Colgado", significado: "pausa." },
    { nombre: "La Muerte", significado: "transformación." },
    { nombre: "La Templanza", significado: "paciencia." },
    { nombre: "El Diablo", significado: "tentación." },
    { nombre: "La Torre", significado: "caos." },
    { nombre: "La Estrella", significado: "esperanza." },
    { nombre: "La Luna", significado: "ilusión." },
    { nombre: "El Sol", significado: "éxito." },
    { nombre: "El Juicio", significado: "propósito." },
    { nombre: "El Mundo", significado: "plenitud." }
];

async function consultarIA(pregunta, usuario, cartaNombre, cartaSignificado) {
    try {
        // CAMBIO CLAVE: Usamos la v1 estable y el modelo específico
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
        
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{ 
                        text: `Eres Tarod, un oráculo místico de Medellín. El usuario ${usuario} pregunta: "${pregunta}". Responde usando la carta "${cartaNombre}" (${cartaSignificado}). REGLAS: Máximo 30 palabras, usa jerga paisa (mijo, hágale, vea pues), sé místico pero directo. No saludes.` 
                    }]
                }]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("DETALLE ERROR GOOGLE:", data.error.message);
            throw new Error(data.error.message);
        }

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            return data.candidates[0].content.parts[0].text.trim();
        }
        
        return "Vea mijo, las energías están cruzadas. Intente en un ratico.";

    } catch (e) {
        console.error("ERROR EN PETICIÓN:", e.message);
        return `Escuche pues ${usuario}, con ${cartaNombre} le digo: ${cartaSignificado}. Póngase las pilas que el destino no regala nada.`;
    }
}

// Usamos clientReady para evitar el DeprecationWarning
client.once('clientReady', (c) => {
    console.log(`🚀 Tarod ONLINE | Usuario: ${c.user.tag}`);
});

// Respaldo para versiones viejas de discord.js
client.once('ready', (c) => {
    if (!c) return;
    console.log(`🚀 Tarod ONLINE | Usuario: ${c.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('!tarot')) return;

    const pregunta = message.content.slice(7).trim();
    if (!pregunta) return message.reply("Suelte la duda pues, mijo. ¿Qué quiere saber?");

    await message.channel.sendTyping();
    const carta = cartasTarot[Math.floor(Math.random() * cartasTarot.length)];
    const respuesta = await consultarIA(pregunta, message.author.username, carta.nombre, carta.significado);

    const embed = new EmbedBuilder()
        .setTitle(`🔮 Revelación: ${carta.nombre}`)
        .setDescription(respuesta)
        .setColor('#6a0dad')
        .setFooter({ text: 'Tarod Oráculo | Medellín' });

    message.reply({ embeds: [embed] });
});

client.login(DISCORD_TOKEN);

// Servidor para Render
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Tarod Online');
}).listen(process.env.PORT || 3000);