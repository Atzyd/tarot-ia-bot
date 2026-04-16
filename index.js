require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const HUGGINGFACE_TOKEN = process.env.HUGGINGFACE_TOKEN;

const cartasTarot = [
    { nombre: "El Loco", significado: "Nuevos comienzos, saltos de fe." },
    { nombre: "El Mago", significado: "Poder personal, acción, iniciativa." },
    { nombre: "La Sacerdotisa", significado: "Intuición, misterio, sabiduría." },
    { nombre: "La Emperatriz", significado: "Abundancia, creación, fertilidad." },
    { nombre: "El Emperador", significado: "Estructura, control, autoridad." },
    { nombre: "El Hierofante", significado: "Tradición, aprendizaje, consejo." },
    { nombre: "Los Enamorados", significado: "Decisiones, amor, armonía." },
    { nombre: "El Carro", significado: "Victoria, determinación, avance." },
    { nombre: "La Fuerza", significado: "Coraje, paciencia, dominio propio." },
    { nombre: "El Ermitaño", significado: "Soledad, reflexión, guía." },
    { nombre: "La Rueda de la Fortuna", significado: "Cambios de suerte, ciclos." },
    { nombre: "La Justicia", significado: "Verdad, equilibrio, causa y efecto." },
    { nombre: "El Colgado", significado: "Pausa, perspectiva, sacrificio." },
    { nombre: "La Muerte", significado: "Transformación, finales necesarios." },
    { nombre: "La Templanza", significado: "Moderación, paciencia, equilibrio." },
    { nombre: "El Diablo", significado: "Apegos, tentación, vicios." },
    { nombre: "La Torre", significado: "Caos, revelación, cambio brusco." },
    { nombre: "La Estrella", significado: "Esperanza, renovación, fe." },
    { nombre: "La Luna", significado: "Confusión, miedos, ilusiones." },
    { nombre: "El Sol", significado: "Éxito, claridad, alegría total." },
    { nombre: "El Juicio", significado: "Despertar, evaluación, propósito." },
    { nombre: "El Mundo", significado: "Plenitud, éxito, cierre de ciclos." }
];

async function consultarIA(pregunta, usuario, cartaNombre, cartaSignificado) {
    try {
        const response = await fetch("https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct", {
            headers: { 
                Authorization: `Bearer ${HUGGINGFACE_TOKEN}`,
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({
                inputs: `<|begin_of_text|><|start_header_id|>system<|end_header_id|>Eres Tarod, oráculo de Medellín. Responde a ${usuario} usando la carta "${cartaNombre}" (${cartaSignificado}). Sé directo, místico y breve. Máximo 50 palabras. Tono paisa.<|eot_id|><|start_header_id|>user<|end_header_id|>${pregunta}<|eot_id|><|start_header_id|>assistant<|end_header_id|>`,
                parameters: { max_new_tokens: 150, temperature: 0.7, return_full_text: false }
            }),
        });

        const result = await response.json();

        // Si la IA responde correctamente
        if (Array.isArray(result) && result[0]?.generated_text) {
            return result[0].generated_text.replace(/<\|.*?\|>/g, "").trim();
        } 
        
        // Si la IA está cargando el modelo (Error 503 común en Hugging Face)
        if (result.error && result.estimated_time) {
            return `El oráculo se está despertando (modelo cargando). Intenta de nuevo en ${Math.round(result.estimated_time)} segundos, mijo.`;
        }

        throw new Error("Respuesta no válida");

    } catch (e) {
        // RESPUESTAS DE RESPALDO (Cuando la IA falla totalmente)
        const respaldos = [
            `La carta de ${cartaNombre} me dice que la respuesta ya la tenés en el corazón, no le des más vueltas.`,
            `Con ${cartaNombre} te digo: hágale sin miedo, que el camino está marcado pero depende de vos.`,
            `Vea, la carta de ${cartaNombre} sugiere que te enfoqués más y dejés de dudar tanto.`,
            `El universo con ${cartaNombre} te manda a decir que te relajés, que todo va a salir como debe.`
        ];
        return respaldos[Math.floor(Math.random() * respaldos.length)];
    }
}

client.once('ready', () => console.log(`🚀 Tarod ONLINE | ${client.user.tag}`));

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('!tarot')) return;

    const pregunta = message.content.slice(7).trim();
    if (!pregunta) return message.reply("Soltá la duda pues, que las cartas no adivinan solas.");

    await message.channel.sendTyping();
    const carta = cartasTarot[Math.floor(Math.random() * cartasTarot.length)];
    const respuesta = await consultarIA(pregunta, message.author.username, carta.nombre, carta.significado);

    const embed = new EmbedBuilder()
        .setTitle(`🔮 Revelación: ${carta.nombre}`)
        .setDescription(respuesta)
        .setColor('#6a0dad')
        .setFooter({ text: 'Tarod Oráculo | Medellín Edition' })
        .setTimestamp();

    message.reply({ embeds: [embed] });
});

client.login(DISCORD_TOKEN);

const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Tarod Online');
}).listen(process.env.PORT || 3000);