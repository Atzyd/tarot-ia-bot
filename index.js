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

// 2. Diccionario de Cartas
const cartasTarot = [
    { nombre: "El Loco", significado: "Nuevos comienzos, optimismo." },
    { nombre: "El Mago", significado: "Poder personal, acción." },
    { nombre: "La Sacerdotisa", significado: "Intuición, misterio." },
    { nombre: "La Emperatriz", significado: "Abundancia, naturaleza." },
    { nombre: "El Emperador", significado: "Autoridad, estructura." },
    { nombre: "El Hierofante", significado: "Sabiduría, tradición." },
    { nombre: "Los Enamorados", significado: "Amor, decisiones." },
    { nombre: "El Carro", significado: "Victoria, determinación." },
    { nombre: "La Fuerza", significado: "Coraje, compasión." },
    { nombre: "El Ermitaño", significado: "Soledad, introspección." },
    { nombre: "La Rueda de la Fortuna", significado: "Cambio, destino." },
    { nombre: "La Justicia", significado: "Justicia, verdad." },
    { nombre: "El Colgado", significado: "Pausa, perspectiva." },
    { nombre: "La Muerte", significado: "Finales, transformación." },
    { nombre: "La Templanza", significado: "Paciencia, equilibrio." },
    { nombre: "El Diablo", significado: "Apego, tentación." },
    { nombre: "La Torre", significado: "Caos, revelación." },
    { nombre: "La Estrella", significado: "Esperanza, fe." },
    { nombre: "La Luna", significado: "Miedo, ilusión." },
    { nombre: "El Sol", significado: "Éxito, alegría." },
    { nombre: "El Juicio", significado: "Llamado, despertar." },
    { nombre: "El Mundo", significado: "Plenitud, viaje." }
];

// 3. Función de IA (Con manejo de filtros y errores)
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
                Eres Tarod, oráculo de Medellín. Responde a ${usuario} usando la carta "${cartaNombre}" (${cartaSignificado}).
                REGLAS: Sé directo, breve (max 60 palabras) y honesto. No saludes. Tono místico paisa.<|eot_id|><|start_header_id|>user<|end_header_id|>
                Pregunta: ${pregunta}<|eot_id|><|start_header_id|>assistant<|end_header_id|>`,
                parameters: { 
                    max_new_tokens: 120, 
                    temperature: 0.6,
                    return_full_text: false 
                }
            }),
        });

        const result = await response.json();

        if (result.error) {
            console.error("Error HF:", result.error);
            return "El oráculo no puede responder a eso ahora. Las energías están cruzadas, mijo.";
        }

        const texto = Array.isArray(result) ? result[0]?.generated_text : result.generated_text;
        const respuestaLimpia = texto?.replace(/<\|.*?\|>/g, "").trim();

        return respuestaLimpia || "La carta dice mucho, pero el destino prefiere callar esta vez.";
    } catch (error) {
        console.error("Error Petición:", error);
        return "Hubo una desconexión mística. Intenta de nuevo en un momento.";
    }
}

// 4. Eventos de Discord
client.once('ready', () => {
    console.log(`🚀 Tarod ONLINE | ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('!tarot')) return;

    const pregunta = message.content.slice(7).trim();
    if (!pregunta) return message.reply("Vea pues, dígame su duda primero.");

    await message.channel.sendTyping();

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

// 5. Servidor para Render (Estabilidad)
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Tarod Online\n');
}).listen(process.env.PORT || 3000);