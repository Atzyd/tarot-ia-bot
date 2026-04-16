require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
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
        // Cambiamos a Phi-3-mini, es extremadamente rápido y eficiente
        const response = await fetch("https://api-inference.huggingface.co/models/microsoft/Phi-3-mini-4k-instruct", {
            headers: { 
                Authorization: `Bearer ${HUGGINGFACE_TOKEN}`,
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({
                inputs: `<|user|>\nEres Tarod de Medellín. Responde a ${usuario} sobre su pregunta: "${pregunta}" usando la carta ${cartaNombre} (${cartaSignificado}). Sé breve, directo y usa jerga paisa. Max 30 palabras.<|end|>\n<|assistant|>`,
                parameters: { max_new_tokens: 60, temperature: 0.7, wait_for_model: true }
            }),
        });

        const result = await response.json();

        if (Array.isArray(result) && result[0]?.generated_text) {
            const texto = result[0].generated_text;
            return texto.split('<|assistant|>')[1]?.trim() || texto.trim();
        }
        
        throw new Error("API Offline");
    } catch (e) {
        // Respaldo dinámico mejorado
        return `Vea mijo, con la carta de ${cartaNombre} le digo: viene ${cartaSignificado}. Póngase las pilas y no se me distraiga, que el examen se gana es estudiando y con la mente clara.`;
    }
}

client.once('ready', () => console.log(`🚀 Tarod ONLINE`));

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('!tarot')) return;

    const pregunta = message.content.slice(7).trim();
    if (!pregunta) return message.reply("Hable pues, mijo.");

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