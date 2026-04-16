require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const HUGGINGFACE_TOKEN = process.env.HUGGINGFACE_TOKEN;

const cartasTarot = [
    { nombre: "El Loco", significado: "Nuevos comienzos y saltos de fe." },
    { nombre: "El Mago", significado: "Poder personal y acción." },
    { nombre: "La Sacerdotisa", significado: "Intuición y misterio." },
    { nombre: "La Emperatriz", significado: "Abundancia y creación." },
    { nombre: "El Emperador", significado: "Estructura y autoridad." },
    { nombre: "El Hierofante", significado: "Tradición y sabiduría." },
    { nombre: "Los Enamorados", significado: "Decisiones y amor." },
    { nombre: "El Carro", significado: "Victoria y determinación." },
    { nombre: "La Fuerza", significado: "Coraje y paciencia." },
    { nombre: "El Ermitaño", significado: "Soledad y reflexión." },
    { nombre: "La Rueda de la Fortuna", significado: "Cambio y destino." },
    { nombre: "La Justicia", significado: "Verdad y equilibrio." },
    { nombre: "El Colgado", significado: "Pausa y perspectiva." },
    { nombre: "La Muerte", significado: "Finales y transformación." },
    { nombre: "La Templanza", significado: "Moderación y paciencia." },
    { nombre: "El Diablo", significado: "Apego y tentación." },
    { nombre: "La Torre", significado: "Caos y revelación." },
    { nombre: "La Estrella", significado: "Esperanza y fe." },
    { nombre: "La Luna", significado: "Miedo e ilusión." },
    { nombre: "El Sol", significado: "Éxito y alegría." },
    { nombre: "El Juicio", significado: "Despertar y propósito." },
    { nombre: "El Mundo", significado: "Éxito y plenitud." }
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
                inputs: `<|begin_of_text|><|start_header_id|>system<|end_header_id|>Eres Tarod, oráculo de Medellín. Responde a ${usuario} sobre "${cartaNombre}". Sé breve y directo. Tono paisa.<|eot_id|><|start_header_id|>user<|end_header_id|>${pregunta}<|eot_id|><|start_header_id|>assistant<|end_header_id|>`,
                parameters: { max_new_tokens: 80, temperature: 0.6, wait_for_model: true }
            }),
        });

        const result = await response.json();

        // Si la IA responde bien
        if (Array.isArray(result) && result[0]?.generated_text) {
            const output = result[0].generated_text;
            return output.includes('<|assistant|>') ? output.split('<|assistant|>')[1].trim() : output.trim();
        }
        
        throw new Error("Respuesta inválida");

    } catch (e) {
        // RESPALDO DINÁMICO: Si la IA falla, la respuesta cambia según la carta para que no sea repetitivo
        return `Vea mijo, con ${cartaNombre} le digo: ${cartaSignificado} Es momento de dejar de dudar y ponerse las pilas con lo suyo. El universo no espera a nadie.`;
    }
}

client.once('ready', () => console.log(`🚀 Tarod ONLINE`));

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('!tarot')) return;

    const pregunta = message.content.slice(7).trim();
    if (!pregunta) return message.reply("Soltá la duda pues.");

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