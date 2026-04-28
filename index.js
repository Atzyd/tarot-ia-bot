require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Librería oficial

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY); // Inicializamos Gemini

const cartasTarot = [
    { nombre: "El Loco", significado: "nuevos comienzos y fe." },
    { nombre: "El Mago", significado: "poder personal y acción." },
    { nombre: "La Sacerdotisa", significado: "intuición y misterio." },
    { nombre: "La Emperatriz", significado: "abundancia y creación." },
    { nombre: "El Emperador", significado: "estructura y autoridad." },
    { nombre: "El Hierofante", significado: "sabiduría y tradición." },
    { nombre: "Los Enamorados", significado: "amor y decisiones." },
    { nombre: "El Carro", significado: "victoria y determinación." },
    { nombre: "La Fuerza", significado: "coraje y paciencia." },
    { nombre: "El Ermitaño", significado: "reflexión y soledad." },
    { nombre: "La Rueda de la Fortuna", significado: "cambios del destino." },
    { nombre: "La Justicia", significado: "verdad y equilibrio." },
    { nombre: "El Colgado", significado: "pausa y perspectiva." },
    { nombre: "La Muerte", significado: "transformación y finales." },
    { nombre: "La Templanza", significado: "moderación y equilibrio." },
    { nombre: "El Diablo", significado: "tentación y ataduras." },
    { nombre: "La Torre", significado: "caos y revelación." },
    { nombre: "La Estrella", significado: "esperanza y renovación." },
    { nombre: "La Luna", significado: "miedo e ilusiones." },
    { nombre: "El Sol", significado: "éxito y alegría." },
    { nombre: "El Juicio", significado: "despertar y propósito." },
    { nombre: "El Mundo", significado: "plenitud y éxito total." }
];

async function consultarIA(pregunta, usuario, cartaNombre, cartaSignificado) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `Eres Tarod, un oráculo místico de Medellín. El usuario ${usuario} pregunta: "${pregunta}". 
        Responde basándote en la carta "${cartaNombre}" (${cartaSignificado}). 
        REGLAS: Máximo 40 palabras, usa jerga paisa, sé directo y místico. No saludes.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        return text.trim();

    } catch (e) {
        console.error("ERROR CRÍTICO GEMINI:", e);
        return `Vea mijo, con ${cartaNombre} le digo: ${cartaSignificado}. Hágale sin miedo, que el destino ya está trazado pero hay que camellarle.`;
    }
}

client.once('ready', (c) => {
    console.log(`🚀 Tarod ONLINE | Usuario: ${c.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('!tarot')) return;

    const pregunta = message.content.slice(7).trim();
    if (!pregunta) return message.reply("Diga pues qué quiere saber, mijo.");

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

// Servidor básico para Render
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Tarod Online');
}).listen(process.env.PORT || 3000);