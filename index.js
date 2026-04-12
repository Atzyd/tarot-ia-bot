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

// 2. Diccionario de Cartas (Los Arcanos Mayores)
const cartasTarot = [
    { nombre: "El Loco", significado: "Nuevos comienzos, optimismo, confianza en el universo." },
    { nombre: "El Mago", significado: "Manifestación, recursos, poder personal." },
    { nombre: "La Sacerdotisa", significado: "Intuición, misterio, subconsciente." },
    { nombre: "La Emperatriz", significado: "Feminidad, belleza, naturaleza, abundancia." },
    { nombre: "El Emperador", significado: "Autoridad, estructura, base sólida." },
    { nombre: "El Hierofante", significado: "Tradición, conformidad, sabiduría espiritual." },
    { nombre: "Los Enamorados", significado: "Amor, armonía, relaciones, decisiones." },
    { nombre: "El Carro", significado: "Control, voluntad, victoria, determinación." },
    { nombre: "La Fuerza", significado: "Coraje, persuasión, influencia, compasión." },
    { nombre: "El Ermitaño", significado: "Introspección, soledad, guía interior." },
    { nombre: "La Rueda de la Fortuna", significado: "Cambio, ciclos, destino, suerte." },
    { nombre: "La Justicia", significado: "Justicia, equidad, verdad, ley." },
    { nombre: "El Colgado", significado: "Pausa, rendición, dejar ir, nuevas perspectivas." },
    { nombre: "La Muerte", significado: "Finales, cambio, transformación, transición." },
    { nombre: "La Templanza", significado: "Equilibrio, paciencia, moderación." },
    { nombre: "El Diablo", significado: "Adicción, sexualidad, apego, restricción." },
    { nombre: "La Torre", significado: "Cambio repentino, agitación, caos, revelación." },
    { nombre: "La Estrella", significado: "Esperanza, fe, propósito, renovación." },
    { nombre: "La Luna", significado: "Ilusión, miedo, ansiedad, subconsciente." },
    { nombre: "El Sol", significado: "Positividad, diversión, calidez, éxito." },
    { nombre: "El Juicio", significado: "Juicio, renacimiento, llamado interior." },
    { nombre: "El Mundo", significado: "Terminación, integración, viaje, éxito." }
];

// 3. Función para consultar a la IA
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
                Eres Tarod, un místico lector de cartas con un tono sabio y un toque del Caribe colombiano (Medellín/Santa Marta).
                Has sacado la carta "${cartaNombre}" (${cartaSignificado}) para el usuario ${usuario}. 
                Responde de forma mística y profesional a su duda.<|eot_id|><|start_header_id|>user<|end_header_id|>
                Mi pregunta es: ${pregunta}<|eot_id|><|start_header_id|>assistant<|end_header_id|>`,
                parameters: { max_new_tokens: 500, temperature: 0.7 }
            }),
        });
        const result = await response.json();
        const fullText = result[0]?.generated_text || "";
        return fullText.split('<|assistant|>')[1]?.trim() || "El oráculo está algo nublado, pero la carta dice que hay esperanza.";
    } catch (error) {
        console.error("Error IA:", error);
        return "Hubo una interferencia en el plano astral. Intenta de nuevo más tarde.";
    }
}

// 4. Eventos
client.once('ready', () => {
    console.log(`🚀 Tarod v8.4.7 ONLINE | ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('!tarot')) return;

    const pregunta = message.content.slice(7).trim();
    if (!pregunta) return message.reply("¿Qué quieres saber? Ej: `!tarot ¿Ganaré mi próximo 1v1?`.");

    await message.channel.sendTyping();

    // Lógica de selección de carta
    const carta = cartasTarot[Math.floor(Math.random() * cartasTarot.length)];
    const respuestaIA = await consultarIA(pregunta, message.author.username, carta.nombre, carta.significado);

    const embed = new EmbedBuilder()
        .setTitle(`🔮 La Carta de Tarod: ${carta.nombre}`)
        .setDescription(respuestaIA)
        .setColor('#6a0dad')
        .addFields({ name: 'Significado base', value: carta.significado })
        .setFooter({ text: 'Desplegado en Render | Consultas 24/7' })
        .setTimestamp();

    message.reply({ embeds: [embed] });
});

client.login(DISCORD_TOKEN);

// 5. Parche de estabilidad para Render
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Tarod Online\n');
}).listen(process.env.PORT || 3000);