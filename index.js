const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
require('dotenv').config();

// Configuración del cliente con los intents necesarios
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

// Candado para evitar que el bot responda dos veces al mismo tiempo
let procesando = false;

// Mazo de Arcanos Mayores con sus interpretaciones base
const mazo = [
    { nombre: "El Loco", img: "https://upload.wikimedia.org/wikipedia/commons/0/0b/RWS_Tarot_00_Fool.jpg", up: "Nuevos comienzos, espontaneidad.", rev: "Falta de dirección, imprudencia." },
    { nombre: "El Mago", img: "https://upload.wikimedia.org/wikipedia/commons/d/de/RWS_Tarot_01_Magician.jpg", up: "Habilidad técnica, poder de manifestación.", rev: "Manipulación, talentos desperdiciados." },
    { nombre: "La Sacerdotisa", img: "https://upload.wikimedia.org/wikipedia/commons/8/8d/RWS_Tarot_02_High_Priestess.jpg", up: "Intuición, misterio.", rev: "Confusión, secretos revelados." },
    { nombre: "La Emperatriz", img: "https://upload.wikimedia.org/wikipedia/commons/d/d1/RWS_Tarot_03_Empress.jpg", up: "Creatividad, abundancia.", rev: "Bloqueo creativo, dependencia." },
    { nombre: "El Emperador", img: "https://upload.wikimedia.org/wikipedia/commons/c/c3/RWS_Tarot_04_Emperor.jpg", up: "Autoridad, estructura sólida.", rev: "Tiranía, rigidez excesiva." },
    { nombre: "El Hierofante", img: "https://upload.wikimedia.org/wikipedia/commons/8/8d/RWS_Tarot_05_Hierophant.jpg", up: "Tradición, aprendizaje.", rev: "Rebelión, nuevas formas de pensar." },
    { nombre: "Los Enamorados", img: "https://upload.wikimedia.org/wikipedia/commons/3/3a/RWS_Tarot_06_Lovers.jpg", up: "Elecciones, armonía.", rev: "Desequilibrio, indecisión." },
    { nombre: "El Carro", img: "https://upload.wikimedia.org/wikipedia/commons/9/9b/RWS_Tarot_07_Chariot.jpg", up: "Victoria, determinación.", rev: "Falta de control, agresión." },
    { nombre: "La Fuerza", img: "https://upload.wikimedia.org/wikipedia/commons/f/f2/RWS_Tarot_08_Strength.jpg", up: "Coraje, control interno.", rev: "Impulsividad, debilidad." },
    { nombre: "El Ermitaño", img: "https://upload.wikimedia.org/wikipedia/commons/4/4d/RWS_Tarot_09_Hermit.jpg", up: "Reflexión, búsqueda interior.", rev: "Aislamiento, soledad negativa." },
    { nombre: "La Rueda de la Fortuna", img: "https://upload.wikimedia.org/wikipedia/commons/3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg", up: "Destino, cambios positivos.", rev: "Resistencia al cambio, mala racha." },
    { nombre: "La Justicia", img: "https://upload.wikimedia.org/wikipedia/commons/e/e0/RWS_Tarot_11_Justice.jpg", up: "Verdad, causa y efecto.", rev: "Injusticia, falta de honestidad." },
    { nombre: "El Colgado", img: "https://upload.wikimedia.org/wikipedia/commons/2/2b/RWS_Tarot_12_Hanged_Man.jpg", up: "Pausa, nueva perspectiva.", rev: "Retrasos innecesarios, estancamiento." },
    { nombre: "La Muerte", img: "https://upload.wikimedia.org/wikipedia/commons/d/d7/RWS_Tarot_13_Death.jpg", up: "Transformación, final de un ciclo.", rev: "Resistencia al final, miedo al cambio." },
    { nombre: "La Templanza", img: "https://upload.wikimedia.org/wikipedia/commons/f/f8/RWS_Tarot_14_Temperance.jpg", up: "Equilibrio, moderación.", rev: "Exceso, falta de balance." },
    { nombre: "El Diablo", img: "https://upload.wikimedia.org/wikipedia/commons/5/55/RWS_Tarot_15_Devil.jpg", up: "Ataduras, tentación.", rev: "Liberación, romper cadenas." },
    { nombre: "La Torre", img: "https://upload.wikimedia.org/wikipedia/commons/5/53/RWS_Tarot_16_Tower.jpg", up: "Revelación repentina, sacudida.", rev: "Crisis evitada, miedo al desastre." },
    { nombre: "La Estrella", img: "https://upload.wikimedia.org/wikipedia/commons/d/db/RWS_Tarot_17_Star.jpg", up: "Esperanza, renovación espiritual.", rev: "Desánimo, falta de fe." },
    { nombre: "La Luna", img: "https://upload.wikimedia.org/wikipedia/commons/7/7f/RWS_Tarot_18_Moon.jpg", up: "Intuición, sueños, subconsciente.", rev: "Claridad tras la confusión, miedos liberados." },
    { nombre: "El Sol", img: "https://upload.wikimedia.org/wikipedia/commons/1/17/RWS_Tarot_19_Sun.jpg", up: "Éxito, alegría, vitalidad.", rev: "Pesimismo, éxito nublado." },
    { nombre: "El Juicio", img: "https://upload.wikimedia.org/wikipedia/commons/d/dd/RWS_Tarot_20_Judgement.jpg", up: "Renacimiento, llamado interno.", rev: "Duda de uno mismo, negación." },
    { nombre: "El Mundo", img: "https://upload.wikimedia.org/wikipedia/commons/f/ff/RWS_Tarot_21_World.jpg", up: "Realización, plenitud, viaje exitoso.", rev: "Incompleto, falta de cierre." }
];

// Función para consultar a Llama-3 en Hugging Face
async function consultarIA(pregunta, carta, posicion) {
    const token = process.env.HUGGINGFACE_TOKEN?.trim();
    try {
        console.log("📡 Conectando con el oráculo digital...");
        const response = await fetch(
            "https://router.huggingface.co/v1/chat/completions",
            {
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({
                    model: "meta-llama/Meta-Llama-3-8B-Instruct:novita",
                    messages: [
                        { role: "system", content: "Eres Tarod, un oráculo de Medellín. Responde en ESPAÑOL. Sé sabio, breve y usa un tono místico." },
                        { role: "user", content: `Pregunta: "${pregunta}". Carta: ${carta} (${posicion}). Dame tu interpretación.` }
                    ],
                    max_tokens: 150,
                    temperature: 0.7
                }),
            }
        );

        if (!response.ok) {
            const err = await response.text();
            console.error(`⚠️ Error API: ${err}`);
            return null;
        }

        const result = await response.json();
        if (result.choices && result.choices[0].message) {
            // Limpiar posibles etiquetas técnicas de la respuesta
            return result.choices[0].message.content.replace(/<\|.*?\|>/g, "").trim();
        }
    } catch (e) {
        console.error("❌ Error en la consulta:", e.message);
    }
    return null;
}

// Evento de inicio corregido para Discord.js v14/v15
client.once('clientReady', (c) => {
    console.log(`🚀 Tarod v8.4.7 ONLINE | Medellín Edition | ${c.user.tag}`);
    console.log("🔓 Candado listo. Esperando consultas...");
});

// Manejador de mensajes
client.on('messageCreate', async (message) => {
    // Validar que no sea un bot y tenga el prefijo
    if (message.author.bot || !message.content.toLowerCase().startsWith('!tarot')) return;

    // Verificar el candado para evitar duplicados
    if (procesando) {
        console.log("🛑 Intento duplicado bloqueado.");
        return;
    }

    const pregunta = message.content.slice(7).trim();
    if (!pregunta) return message.reply("🔮 Debes hacer una pregunta para que las cartas hablen.");

    procesando = true; // Activar candado
    console.log(`🔮 Consulta de ${message.author.username}: ${pregunta}`);

    await message.channel.sendTyping();

    // Lógica de la carta
    const carta = mazo[Math.floor(Math.random() * mazo.length)];
    const esInvertida = Math.random() < 0.25;
    const posicion = esInvertida ? "Invertida" : "Derecha";
    const significadoBase = esInvertida ? carta.rev : carta.up;

    // Obtener interpretación de la IA
    const lecturaIA = await consultarIA(pregunta, carta.nombre, posicion);
    
    // Fallback en caso de que la IA falle
    const interpretacionFinal = lecturaIA || `Las estrellas dicen: **${significadoBase}**. (La conexión mística es inestable en este momento).`;

    // Crear el Embed
    const embed = new EmbedBuilder()
        .setTitle(`✨ Oráculo Tarod: Lectura para ${message.author.username}`)
        .setDescription(`**Consulta:** *${pregunta}*`)
        .addFields(
            { name: '🃏 Carta', value: `**${carta.nombre}**`, inline: true },
            { name: '🔃 Posición', value: `*${posicion}*`, inline: true },
            { name: '🔮 Interpretación', value: interpretacionFinal }
        )
        .setImage(carta.img)
        .setColor(esInvertida ? '#e67e22' : '#9b59b6')
        .setFooter({ text: 'Tarod IA • Medellín Edition' })
        .setTimestamp();

    await message.reply({ embeds: [embed] });
    console.log("✅ Lectura enviada con éxito.");

    // Liberar el candado después de un breve delay
    setTimeout(() => {
        procesando = false;
        console.log("🔓 Candado liberado.");
    }, 3000);
});

// Login
client.login(process.env.DISCORD_TOKEN);