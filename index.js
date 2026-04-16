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
        // Configuramos un controlador de tiempo para no esperar eternamente
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 25000); // 25 segundos de espera

        const response = await fetch("https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct", {
            headers: { 
                Authorization: `Bearer ${HUGGINGFACE_TOKEN}`,
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({
                inputs: `<|begin_of_text|><|start_header_id|>system<|end_header_id|>Eres Tarod, oráculo de Medellín. Responde a ${usuario} usando la carta "${cartaNombre}" (${cartaSignificado}). Sé místico, breve y directo. Máximo 40 palabras. Tono paisa.<|eot_id|><|start_header_id|>user<|end_header_id|>${pregunta}<|eot_id|><|start_header_id|>assistant<|end_header_id|>`,
                parameters: { max_new_tokens: 100, temperature: 0.7, wait_for_model: true } // "wait_for_model" es CLAVE
            }),
            signal: controller.signal
        });

        clearTimeout(timeout);
        const result = await response.json();

        if (Array.isArray(result) && result[0]?.generated_text) {
            return result[0].generated_text.split('<|assistant|>')[1]?.trim() || result[0].generated_text.replace(/<\|.*?\|>/g, "").trim();
        } 
        
        throw new Error("IA no disponible");

    } catch (e) {
        const respaldos = [
            `Con ${cartaNombre} te digo: hágale sin miedo, que el camino está marcado pero depende de vos.`,
            `Vea, la carta de ${cartaNombre} sugiere que te enfoqués más y dejés de dudar tanto.`,
            `El universo con ${cartaNombre} te manda a decir que te relajés, que todo va a salir como debe.`,
            `La carta de ${cartaNombre} indica que la respuesta llegará cuando dejés de buscarla afuera.`
        ];
        return respaldos[Math.floor(Math.random() * respaldos.length)];
    }
}

client.once('ready', () => console.log(`🚀 Tarod ONLINE | Medellín Edition`));

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('!tarot')) return;

    const pregunta = message.content.slice(7).trim();
    if (!pregunta) return message.reply("Dime qué quieres saber, pues.");

    await message.channel.sendTyping();
    const carta = cartasTarot[Math.floor(Math.random() * cartasTarot.length)];
    const respuesta = await consultarIA(pregunta, message.author.username, carta.nombre, carta.significado);

    const embed = new EmbedBuilder()
        .setTitle(`🔮 Revelación: ${carta.nombre}`)
        .setDescription(respuesta)
        .setColor('#6a0dad')
        .setFooter({ text: 'Tarod Oráculo | Medellín Edition' });

    message.reply({ embeds: [embed] });
});

client.login(DISCORD_TOKEN);

const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Online');
}).listen(process.env.PORT || 3000);