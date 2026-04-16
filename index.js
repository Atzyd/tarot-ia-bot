require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

// 1. Configuración del Cliente
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const HUGGINGFACE_TOKEN = process.env.HUGGINGFACE_TOKEN;

// 2. Diccionario de Arcanos
const cartasTarot = [
    { nombre: "El Loco", significado: "Nuevos comienzos, saltos de fe." },
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
    { nombre: "La Muerte", significado: "Transformación, finales." },
    { nombre: "La Templanza", significado: "Moderación, paciencia." },
    { nombre: "El Diablo", significado: "Apego, tentación." },
    { nombre: "La Torre", significado: "Caos, revelación." },
    { nombre: "La Estrella", significado: "Esperanza, fe." },
    { nombre: "La Luna", significado: "Miedo, ilusión." },
    { nombre: "El Sol", significado: "Éxito, alegría." },
    { nombre: "El Juicio", significado: "Despertar, llamado." },
    { nombre: "El Mundo", significado: "Plenitud, éxito." }
];

// 3. Función de IA con "Resistencia Mística"
async function consultarIA(pregunta, usuario, cartaNombre, cartaSignificado) {
    try {
        const response = await fetch("https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct", {
            headers: { 
                Authorization: `Bearer ${HUGGINGFACE_TOKEN}`,
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({
                inputs: `<|begin_of_text|><|start_header_id|>system<|end_header_id|>Eres Tarod, oráculo directo de Medellín. Responde a ${usuario} usando "${cartaNombre}" (${cartaSignificado}). REGLA: Sé directo, sin introducciones, máximo 50 palabras, tono paisa.<|eot_id|><|start_header_id|>user<|end_header_id|>${pregunta}<|eot_id|><|start_header_id|>assistant<|end_header_id|>`,
                parameters: { max_new_tokens: 100, temperature: 0.7, return_full_text: false }
            }),
        });

        const result = await response.json();

        // Si la IA falla o está cargando, lanzamos respuesta de emergencia propia
        if (result.error || !result[0]?.generated_text) {
            console.log("IA ocupada, usando respaldo.");
            const respaldos = [
                `Vea mijo, con la carta de ${cartaNombre} le digo: deje de preocuparse tanto y actúe ya.`,
                `La carta de ${cartaNombre} es clara: el éxito depende de qué tan enfocado esté usted hoy.`,
                `El universo con ${cartaNombre} me dice que sí, pero no se me relaje ni un poquito.`,
                `Con esa carta ahí... yo que usted le meto más ganas porque el camino está algo enredado.`
            ];
            return respaldos[Math.floor(Math.random() * respaldos.length)];
        }

        return result[0].generated_text.replace(/<\|.*?\|>/g, "").trim();

    } catch (e) {
        return `Las cartas de ${cartaNombre} sugieren que la respuesta está frente a tus ojos, no busques más allá.`;
    }
}

// 4. Lógica de Discord
client.once('ready', () => console.log(`🚀 Tarod ONLINE | ${client.user.tag}`));

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('!tarot')) return;

    const pregunta = message.content.slice(7).trim();
    if (!pregunta) return message.reply("Hágale pues, suelte la duda.");

    await message.channel.sendTyping();
    const carta = cartasTarot[Math.floor(Math.random() * cartasTarot.length)];
    const respuesta = await consultarIA(pregunta, message.author.username, carta.nombre, carta.significado);

    const embed = new EmbedBuilder()
        .setTitle(`🔮 Revelación: ${carta.nombre}`)
        .setDescription(respuesta)
        .setColor('#6a0dad')
        .setFooter({ text: 'Tarod Oráculo' });

    message.reply({ embeds: [embed] });
});

client.login(DISCORD_TOKEN);

// 5. Servidor para Render
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Online');
}).listen(process.env.PORT || 3000);