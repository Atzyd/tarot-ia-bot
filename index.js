require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
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
        // CAMBIO MAESTRO: Usamos 'gemini-pro' que es el nombre más compatible globalmente
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_KEY}`;
        
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{ 
                        text: `Actúa como Tarod, un oráculo de Medellín. El usuario ${usuario} pregunta: "${pregunta}". La carta del día es "${cartaNombre}" (${cartaSignificado}). Responde en menos de 30 palabras con jerga paisa y misticismo.` 
                    }]
                }]
            })
        });

        const data = await response.json();

        // Si este modelo tampoco responde, intentamos el flash con el nombre largo
        if (data.error) {
            console.error("LOG DE ERROR:", data.error.message);
            throw new Error(data.error.message);
        }

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            return data.candidates[0].content.parts[0].text.trim();
        }
        
        return "Vea mijo, el universo está haciendo un 'parche' y no me deja ver nada. Intente luego.";

    } catch (e) {
        return `Oiga ${usuario}, con ${cartaNombre} le digo: ${cartaSignificado}. Hágale que pa' luego es tarde.`;
    }
}

// Corregimos el evento para evitar el warning
client.once('ready', (c) => {
    console.log(`🚀 Tarod ONLINE | Usuario: ${c.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('!tarot')) return;

    const pregunta = message.content.slice(7).trim();
    if (!pregunta) return message.reply("Suelte el chisme pues mijo, ¿qué quiere saber?");

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

const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Tarod Online');
}).listen(process.env.PORT || 3000);