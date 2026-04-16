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
        // Usamos Mistral-7B-v0.3, que es excelente para respuestas cortas y directas
        const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3", {
            headers: { 
                Authorization: `Bearer ${HUGGINGFACE_TOKEN}`,
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({
                inputs: `<s>[INST] Eres Tarod, un místico de Medellín. Responde a ${usuario} de forma directa, breve (max 30 palabras) y con jerga paisa. Usa la carta "${cartaNombre}" (${cartaSignificado}). Pregunta: ${pregunta} [/INST]`,
                parameters: { 
                    max_new_tokens: 80, 
                    temperature: 0.7, 
                    wait_for_model: true 
                }
            }),
        });

        const result = await response.json();

        if (Array.isArray(result) && result[0]?.generated_text) {
            let texto = result[0].generated_text;
            // Limpiamos el rastro de la instrucción
            if (texto.includes('[/INST]')) {
                texto = texto.split('[/INST]')[1].trim();
            }
            return texto || "Las cartas están un poco nubladas, mijo. Intente de nuevo.";
        }

        throw new Error("API Limit o Error");
    } catch (e) {
        // RESPALDO DINÁMICO (Por si la IA no responde a tiempo)
        const frasesRespaldo = [
            `Vea ${usuario}, con la carta de ${cartaNombre} le digo: ${cartaSignificado}. Póngase las pilas y no deje que se le escape la suerte.`,
            `Escuche pues, la carta de ${cartaNombre} indica ${cartaSignificado}. Mi consejo es que confíe en usted y deje de buscar respuestas donde no las hay.`,
            `Con ${cartaNombre} en la mano, lo que veo es ${cartaSignificado}. Hágale sin miedo que el universo le está abriendo el camino.`
        ];
        return frasesRespaldo[Math.floor(Math.random() * frasesRespaldo.length)];
    }
}

client.once('ready', () => {
    console.log(`🚀 Tarod ONLINE | Listo para leer el destino`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('!tarot')) return;

    const pregunta = message.content.slice(7).trim();
    if (!pregunta) return message.reply("Dígame su duda pues, que yo no leo mentes gratis.");

    await message.channel.sendTyping();
    const carta = cartasTarot[Math.floor(Math.random() * cartasTarot.length)];
    const respuesta = await consultarIA(pregunta, message.author.username, carta.nombre, carta.significado);

    const embed = new EmbedBuilder()
        .setTitle(`🔮 Revelación: ${carta.nombre}`)
        .setDescription(respuesta)
        .setColor('#6a0dad')
        .setFooter({ text: 'Tarod Oráculo | Medellín' })
        .setTimestamp();

    message.reply({ embeds: [embed] });
});

client.login(DISCORD_TOKEN);

// Servidor de salud para Render
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Online');
}).listen(process.env.PORT || 3000);