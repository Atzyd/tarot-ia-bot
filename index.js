require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const HUGGINGFACE_TOKEN = process.env.HUGGINGFACE_TOKEN;

const cartasTarot = [
    { nombre: "El Loco", significado: "nuevos comienzos y fe." },
    { nombre: "El Mago", significado: "poder personal y acción." },
    { nombre: "La Sacerdotisa", significado: "intuición y misterio." },
    { nombre: "La Emperatriz", significado: "abundancia y creación." },
    { nombre: "El Emperador", significado: "estructura y autoridad." },
    { nombre: "El Hierofante", significado: "sabiduría y tradición." },
    { nombre: "Los Enamorados", significado: "amor y decisiones." },
    { nombre: "El Carro", significado: "victoria y determinación." },
    { nombre: "La Fuerza", significado: "coraje y paciencia." },
    { nombre: "El Ermitaño", significado: "reflexión y soledad." },
    { nombre: "La Rueda de la Fortuna", significado: "destino y suerte." },
    { nombre: "La Justicia", significado: "verdad y equilibrio." },
    { nombre: "El Colgado", significado: "pausa y perspectiva." },
    { nombre: "La Muerte", significado: "cambio y transformación." },
    { nombre: "La Templanza", significado: "equilibrio y moderación." },
    { nombre: "El Diablo", significado: "ataduras y tentación." },
    { nombre: "La Torre", significado: "caos y revelación." },
    { nombre: "La Estrella", significado: "esperanza y fe." },
    { nombre: "La Luna", significado: "miedo e ilusión." },
    { nombre: "El Sol", significado: "éxito y alegría." },
    { nombre: "El Juicio", significado: "despertar y juicio." },
    { nombre: "El Mundo", significado: "plenitud y éxito." }
];

async function consultarIA(pregunta, usuario, cartaNombre, cartaSignificado) {
    try {
        // Cambiamos a Mistral-7B-Instruct-v0.2 que es más estable en la API gratuita
        const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2", {
            headers: { 
                Authorization: `Bearer ${HUGGINGFACE_TOKEN}`,
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({
                inputs: `<s>[INST] Eres Tarod, oráculo de Medellín. Responde a ${usuario} de forma mística, breve (max 40 palabras) y directa usando la carta "${cartaNombre}". Tono paisa. Pregunta: ${pregunta} [/INST]`,
                parameters: { max_new_tokens: 100, temperature: 0.7, wait_for_model: true }
            }),
        });

        const result = await response.json();

        // Si el resultado es exitoso y trae texto
        if (Array.isArray(result) && result[0]?.generated_text) {
            let texto = result[0].generated_text;
            // Limpiamos el texto para que no repita la instrucción del [INST]
            if (texto.includes('[/INST]')) {
                texto = texto.split('[/INST]')[1].trim();
            }
            return texto;
        }

        // Si Hugging Face devuelve un error de carga, damos un mensaje real
        if (result.error && result.estimated_time) {
            return `Vea mijo, el oráculo se está despertando. Intente de nuevo en ${Math.round(result.estimated_time)} segundos.`;
        }

        throw new Error("Respuesta vacía o error de API");

    } catch (e) {
        console.error("Error detectado:", e.message);
        // RESPALDO DINÁMICO MEJORADO: Para que no parezca un error
        return `Escuche bien, la carta de ${cartaNombre} indica ${cartaSignificado}. Mi consejo para usted, ${usuario}, es que deje de darle tantas vueltas a las cosas y confíe en lo que viene, que el destino ya está trazado.`;
    }
}

client.once('ready', () => console.log(`🚀 Tarod ONLINE | Medellín Edition`));

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('!tarot')) return;

    const pregunta = message.content.slice(7).trim();
    if (!pregunta) return message.reply("Hable pues, ¿qué quiere saber?");

    await message.channel.sendTyping();
    const carta = cartasTarot[Math.floor(Math.random() * cartasTarot.length)];
    const respuesta = await consultarIA(pregunta, message.author.username, carta.nombre, carta.significado);

    const embed = new EmbedBuilder()
        .setTitle(`🔮 Revelación: ${carta.nombre}`)
        .setDescription(respuesta)
        .setColor('#6a0dad')
        .setFooter({ text: 'Tarod Oráculo | Medellín' });

    message.reply({ embeds: [embed] });
});

client.login(DISCORD_TOKEN);

const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Online');
}).listen(process.env.PORT || 3000);