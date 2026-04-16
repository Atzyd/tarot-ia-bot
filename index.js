require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

// 1. Configuración del Cliente de Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const HUGGINGFACE_TOKEN = process.env.HUGGINGFACE_TOKEN;

// 2. Diccionario de Arcanos Mayores
const cartasTarot = [
    { nombre: "El Loco", significado: "Nuevos comienzos, optimismo." },
    { nombre: "El Mago", significado: "Poder personal, acción." },
    { nombre: "La Sacerdotisa", significado: "Intuición, misterio." },
    { nombre: "La Emperatriz", significado: "Abundancia, creación." },
    { nombre: "El Emperador", significado: "Autoridad, estructura." },
    { nombre: "El Hierofante", significado: "Sabiduría, tradición." },
    { nombre: "Los Enamorados", significado: "Amor, decisiones." },
    { nombre: "El Carro", significado: "Victoria, determinación." },
    { nombre: "La Fuerza", significado: "Coraje, paciencia." },
    { nombre: "El Ermitaño", significado: "Soledad, reflexión." },
    { nombre: "La Rueda de la Fortuna", significado: "Cambio, destino." },
    { nombre: "La Justicia", significado: "Verdad, equilibrio." },
    { nombre: "El Colgado", significado: "Pausa, perspectiva." },
    { nombre: "La Muerte", significado: "Finales, transformación." },
    { nombre: "La Templanza", significado: "Moderación, paciencia." },
    { nombre: "El Diablo", significado: "Apego, tentación." },
    { nombre: "La Torre", significado: "Caos, revelación." },
    { nombre: "La Estrella", significado: "Esperanza, fe." },
    { nombre: "La Luna", significado: "Miedo, ilusión." },
    { nombre: "El Sol", significado: "Éxito, alegría." },
    { nombre: "El Juicio", significado: "Despertar, llamado." },
    { nombre: "El Mundo", significado: "Plenitud, éxito." }
];

// 3. Función de IA (Con "Plan B" para evitar errores de censura)
async function consultarIA(pregunta, usuario, cartaNombre, cartaSignificado) {
    try {
        const response = await fetch("https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct", {
            headers: { 
                Authorization: `Bearer ${HUGGINGFACE_TOKEN}`,
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({
                inputs: `<|begin_of_text|><|start_header_id|>system<|end_header_id|>
                Eres Tarod, el oráculo de Medellín. Eres brutalmente honesto y directo.
                REGLAS: Responde a ${usuario} usando "${cartaNombre}". MÁXIMO 60 PALABRAS.
                No saludes, no des introducciones. Tono místico paisa. Ve al grano.<|eot_id|><|start_header_id|>user<|end_header_id|>
                Pregunta: "${pregunta}"<|eot_id|><|start_header_id|>assistant<|end_header_id|>`,
                parameters: { 
                    max_new_tokens: 100, 
                    temperature: 0.8, // Mayor temperatura ayuda a evadir bloqueos rígidos
                    return_full_text: false 
                }
            }),
        });

        const result = await response.json();

        // Si la IA bloquea la respuesta o hay error, usamos el Plan B místico
        if (result.error || !result[0]?.generated_text) {
            console.log("IA Bloqueada o cargando. Usando respuesta de respaldo.");
            const respuestasMisticas = [
                `La carta de ${cartaNombre} dice que cada quien sigue su verdad y el destino no juzga, solo observa.`,
                `Vea, ${cartaNombre} sugiere que te enfoques en tu propio camino. Lo que otros hagan no cambia tu suerte.`,
                `El universo es muy grande para etiquetas. Con ${cartaNombre} te digo: vive y deja vivir, mijo.`,
                `Las cartas ven que te preocupas por cosas que no puedes cambiar. Suelta eso y verás la luz.`
            ];
            return respuestasMisticas[Math.floor(Math.random() * respuestasMisticas.length)];
        }

        const texto = result[0].generated_text.replace(/<\|.*?\|>/g, "").trim();
        return texto;

    } catch (error) {
        return "La energía está pesada y el canal se cerró. Intenta preguntar de otra forma.";
    }
}

// 4. Lógica de Discord
client.once('ready', () => {
    console.log(`🚀 Tarod ONLINE | Medellín Edition | ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('!tarot')) return;

    const pregunta = message.content.slice(7).trim();
    if (!pregunta) return message.reply("Dime qué quieres saber, no seas tímido.");

    await message.channel.sendTyping();

    // Selección aleatoria de carta
    const carta = cartasTarot[Math.floor(Math.random() * cartasTarot.length)];
    const respuestaIA = await consultarIA(pregunta, message.author.username, carta.nombre, carta.significado);

    const embed = new EmbedBuilder()
        .setTitle(`🔮 Revelación: ${carta.nombre}`)
        .setDescription(respuestaIA)
        .setColor('#6a0dad')
        .setFooter({ text: 'Tarod | Oráculo de la Montaña' })
        .setTimestamp();

    message.reply({ embeds: [embed] });
});

client.login(DISCORD_TOKEN);

// 5. Servidor de salud para Render (Mantiene el bot vivo)
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Tarod Bot está Online\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🌐 Servidor de salud escuchando en el puerto ${PORT}`);
});