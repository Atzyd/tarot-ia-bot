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
    { nombre: "El Loco", significado: "nuevos comienzos y fe ciega." },
    { nombre: "El Mago", significado: "poder personal y acción." },
    { nombre: "La Sacerdotisa", significado: "intuición y misterio." },
    { nombre: "La Emperatriz", significado: "abundancia y creación." },
    { nombre: "El Emperador", significado: "estructura y autoridad." },
    { nombre: "El Hierofante", significado: "sabiduría y tradición." },
    { nombre: "Los Enamorados", significado: "amor y decisiones importantes." },
    { nombre: "El Carro", significado: "victoria y determinación." },
    { nombre: "La Fuerza", significado: "coraje y paciencia." },
    { nombre: "El Ermitaño", significado: "reflexión y soledad." },
    { nombre: "La Rueda de la Fortuna", significado: "cambios del destino." },
    { nombre: "La Justicia", significado: "verdad y equilibrio." },
    { nombre: "El Colgado", significado: "pausa y nuevas perspectivas." },
    { nombre: "La Muerte", significado: "transformación y finales." },
    { nombre: "La Templanza", significado: "moderación y equilibrio." },
    { nombre: "El Diablo", significado: "tentación y ataduras." },
    { nombre: "La Torre", significado: "caos y revelación brusca." },
    { nombre: "La Estrella", significado: "esperanza y renovación." },
    { nombre: "La Luna", significado: "miedo e ilusiones." },
    { nombre: "El Sol", significado: "éxito y alegría." },
    { nombre: "El Juicio", significado: "despertar y propósito." },
    { nombre: "El Mundo", significado: "plenitud y éxito total." }
];

async function consultarIA(pregunta, usuario, cartaNombre, cartaSignificado) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `Eres Tarod, un oráculo místico de Medellín. Un usuario llamado ${usuario} te pregunta: "${pregunta}". Responde basándote en la carta del tarot "${cartaNombre}" (${cartaSignificado}). REGLAS: Sé muy breve (máximo 40 palabras), directo, usa jerga paisa (como mijo, vea pues, hágale, de una) y mantén un tono místico pero cercano. No saludes ni digas "Hola".` }]
                }],
                generationConfig: {
                    maxOutputTokens: 100,
                    temperature: 0.8
                }
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            return data.candidates[0].content.parts[0].text.trim();
        }
        
        throw new Error("Respuesta vacía de Gemini");

    } catch (e) {
        console.error("Error en Gemini:", e.message);
        // Respaldo de emergencia por si falla la red
        return `Vea mijo, con ${cartaNombre} le digo que viene ${cartaSignificado}. Póngase las pilas y no se me distraiga, que el universo no regala nada.`;
    }
}

// Evento correcto para evitar avisos de deprecación
client.once('ready', (c) => {
    console.log(`🚀 Tarod ONLINE | Usuario: ${c.user.tag}`);
});

client.on('messageCreate', async (message) => {
    // Ignorar bots y mensajes que no empiecen con !tarot
    if (message.author.bot || !message.content.startsWith('!tarot')) return;

    const pregunta = message.content.slice(7).trim();
    if (!pregunta) return message.reply("Suelte la duda pues, mijo. ¿Qué quiere saber?");

    await message.channel.sendTyping();
    
    // Elegir carta al azar
    const carta = cartasTarot[Math.floor(Math.random() * cartasTarot.length)];
    
    // Consultar a la IA
    const respuesta = await consultarIA(pregunta, message.author.username, carta.nombre, carta.significado);

    // Crear el embed
    const embed = new EmbedBuilder()
        .setTitle(`🔮 Revelación: ${carta.nombre}`)
        .setDescription(respuesta)
        .setColor('#6a0dad')
        .setFooter({ text: 'Tarod Oráculo | Medellín' })
        .setTimestamp();

    message.reply({ embeds: [embed] });
});

client.login(DISCORD_TOKEN);

// Servidor para mantener vivo el bot en Render
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Tarod Oráculo Online');
}).listen(process.env.PORT || 3000);