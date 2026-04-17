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
const HUGGINGFACE_TOKEN = process.env.HUGGINGFACE_TOKEN;

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
    { nombre: "El Colgado", significado: "perspectiva." },
    { nombre: "La Muerte", significado: "transformación." },
    { nombre: "La Templanza", significado: "paciencia." },
    { nombre: "El Diablo", significado: "tentación." },
    { nombre: "La Torre", significado: "revelación." },
    { nombre: "La Estrella", significado: "esperanza." },
    { nombre: "La Luna", significado: "ilusión." },
    { nombre: "El Sol", significado: "éxito." },
    { nombre: "El Juicio", significado: "propósito." },
    { nombre: "El Mundo", significado: "plenitud." }
];

async function consultarIA(pregunta, usuario, cartaNombre, cartaSignificado) {
    try {
        // Cambiamos al modelo Mistral-Nemo, que es más robusto ante saturación
        const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-Nemo-Instruct-2407", {
            headers: { 
                Authorization: `Bearer ${HUGGINGFACE_TOKEN}`,
                "Content-Type": "application/json",
                "x-use-cache": "false" // Forzamos a que no use caché para evitar errores de HTML
            },
            method: "POST",
            body: JSON.stringify({
                inputs: `[INST] Eres Tarod de Medellín. Responde a ${usuario} sobre "${pregunta}" usando la carta "${cartaNombre}" (${cartaSignificado}). Sé breve, directo y místico paisa. [/INST]`,
                parameters: { max_new_tokens: 70, temperature: 0.7, wait_for_model: true }
            }),
        });

        const contentType = response.headers.get("content-type");
        
        // Si no es JSON, probablemente es el error 404/503 de Hugging Face
        if (!contentType || !contentType.includes("application/json")) {
            console.error("DEBUG: Hugging Face rechazó la conexión con HTML.");
            throw new Error("Servicio saturado");
        }

        const result = await response.json();

        if (Array.isArray(result) && result[0]?.generated_text) {
            let res = result[0].generated_text;
            if (res.includes('[/INST]')) res = res.split('[/INST]')[1].trim();
            return res;
        } 
        
        throw new Error("Respuesta inválida");

    } catch (e) {
        console.error("Fallo real en IA:", e.message);
        // RESPALDO DINÁMICO QUE SIEMPRE FUNCIONA
        const respaldos = [
            `Vea ${usuario}, con ${cartaNombre} le digo: ${cartaSignificado}. Hágale sin miedo pero con los pies en la tierra.`,
            `Escuche pues, ${cartaNombre} marca ${cartaSignificado}. Si se pone las pilas y no se distrae, le va a ir de una.`,
            `Mijo, esa carta de ${cartaNombre} es pura energía de ${cartaSignificado}. Deje de pensar tanto y empiece a actuar.`
        ];
        return respaldos[Math.floor(Math.random() * respaldos.length)];
    }
}

// Evento corregido para v14/v15
client.once('ready', (readyClient) => {
    console.log(`🚀 Tarod ONLINE | Usuario: ${readyClient.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('!tarot')) return;

    const pregunta = message.content.slice(7).trim();
    if (!pregunta) return message.reply("Hable pues, mijo. ¿Qué quiere saber?");

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
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Online');
}).listen(process.env.PORT || 3000);