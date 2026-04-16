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
    { nombre: "El Loco", significado: "Nuevos comienzos, saltos de fe." },
    { nombre: "El Mago", significado: "Poder personal, acción, iniciativa." },
    { nombre: "La Sacerdotisa", significado: "Intuición, secretos, sabiduría interna." },
    { nombre: "La Emperatriz", significado: "Abundancia, creación, fertilidad." },
    { nombre: "El Emperador", significado: "Estructura, control, autoridad." },
    { nombre: "El Hierofante", significado: "Tradición, aprendizaje, consejo." },
    { nombre: "Los Enamorados", significado: "Decisiones, amor, armonía." },
    { nombre: "El Carro", significado: "Victoria, determinación, avance." },
    { nombre: "La Fuerza", significado: "Coraje, paciencia, dominio propio." },
    { nombre: "El Ermitaño", significado: "Soledad buscada, reflexión, guía." },
    { nombre: "La Rueda de la Fortuna", significado: "Cambios de suerte, ciclos." },
    { nombre: "La Justicia", significado: "Verdad, causa y efecto, equilibrio." },
    { nombre: "El Colgado", significado: "Pausa, sacrificio, ver las cosas distinto." },
    { nombre: "La Muerte", significado: "Transformación, finales necesarios." },
    { nombre: "La Templanza", significado: "Moderación, paciencia, mezcla ideal." },
    { nombre: "El Diablo", significado: "Apegos, tentación, vicios." },
    { nombre: "La Torre", significado: "Caos, revelación, cambio brusco." },
    { nombre: "La Estrella", significado: "Esperanza, renovación, fe." },
    { nombre: "La Luna", significado: "Confusión, miedos, ilusiones." },
    { nombre: "El Sol", significado: "Éxito, claridad, alegría total." },
    { nombre: "El Juicio", significado: "Despertar, evaluación, propósito." },
    { nombre: "El Mundo", significado: "Cierre de ciclos, plenitud, éxito." }
];

// 3. Función de IA: Brutalmente directa
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
                REGLAS ESTRICTAS:
                - Responde a ${usuario} en MÁXIMO 80 PALABRAS.
                - Prohibido saludar o decir "La carta de...".
                - Ve al grano con la carta "${cartaNombre}" (${cartaSignificado}).
                - Tono místico con esencia paisa. No des vueltas, di las cosas como son.<|eot_id|><|start_header_id|>user<|end_header_id|>
                Pregunta: "${pregunta}"<|eot_id|><|start_header_id|>assistant<|end_header_id|>`,
                parameters: { 
                    max_new_tokens: 120, // Suficiente para una respuesta clara sin cortarse
                    temperature: 0.5, // Menos creatividad, más precisión
                    top_p: 0.9
                }
            }),
        });
        const result = await response.json();
        const texto = result[0]?.generated_text || "";
        const respuestaLimpia = texto.split('<|assistant|>')[1]?.trim();
        
        return respuestaLimpia || "El oráculo está mudo. Póngase las pilas y pregunte después.";
    } catch (error) {
        console.error("Error IA:", error);
        return "Hubo una interferencia en el plano astral. Intente de nuevo.";
    }
}

// 4. Lógica de Discord
client.once('ready', () => {
    console.log(`🚀 Tarod ONLINE | ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('!tarot')) return;

    const pregunta = message.content.slice(7).trim();
    if (!pregunta) return message.reply("Vea pues, dígame su duda o no le puedo leer nada.");

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

// 5. Servidor de salud para Render (Puerto)
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Tarod Funcionando\n');
}).listen(process.env.PORT || 3000);