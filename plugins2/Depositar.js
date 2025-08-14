const fs = require('fs');

module.exports = async (msg, { conn, args }) => {
  try {
    const rpgFile = "./rpg.json";
    const userId = msg.key.participant || msg.key.remoteJid;

    // 🏦 Reacción antes de procesar
    await conn.sendMessage(msg.key.remoteJid, { 
      react: { text: "🏦", key: msg.key } 
    });

    // 📂 Verificar si el archivo existe
    if (!fs.existsSync(rpgFile)) {
      return conn.sendMessage(msg.key.remoteJid, { 
        text: "❌ *Los datos del RPG no están disponibles.*" 
      }, { quoted: msg });
    }

    // 📥 Cargar datos del usuario
    let rpgData = JSON.parse(fs.readFileSync(rpgFile, "utf-8"));

    // ❌ Verificar si el usuario está registrado
    if (!rpgData.usuarios[userId]) {
      return conn.sendMessage(msg.key.remoteJid, { 
        text: `❌ *No tienes una cuenta registrada en el gremio Azura Ultra.*\n📜 Usa \`${global.prefix}rpg <nombre> <edad>\` para registrarte.` 
      }, { quoted: msg });
    }

    let usuario = rpgData.usuarios[userId];

    // 🔢 Verificar si el usuario ingresó una cantidad válida
    let cantidad = parseInt(args[0]);
    if (isNaN(cantidad) || cantidad <= 0) {
      return conn.sendMessage(msg.key.remoteJid, { 
        text: `⚠️ *Uso incorrecto.*\n📌 Ejemplo: \`${global.prefix}dep 500\`\n💎 Deposita diamantes en el gremio.` 
      }, { quoted: msg });
    }

    // ❌ Verificar si el usuario tiene suficientes diamantes
    if (usuario.diamantes < cantidad) {
      return conn.sendMessage(msg.key.remoteJid, { 
        text: `❌ *No tienes suficientes diamantes para depositar.*\n💎 *Tus diamantes actuales:* ${usuario.diamantes}` 
      }, { quoted: msg });
    }

    // 🏦 Depositar los diamantes
    usuario.diamantes -= cantidad;
    usuario.diamantesGuardados = (usuario.diamantesGuardados || 0) + cantidad;

    // 📂 Guardar cambios en el archivo
    fs.writeFileSync(rpgFile, JSON.stringify(rpgData, null, 2));

    // 📜 Mensaje de confirmación
    let mensaje = `✅ *Has depositado ${cantidad} diamantes en el gremio.*\n\n`;
    mensaje += `💎 *Diamantes en inventario:* ${usuario.diamantes}\n`;
    mensaje += `🏦 *Diamantes guardados en el gremio:* ${usuario.diamantesGuardados}\n`;
    mensaje += `\n🔒 *Depositar protege tus diamantes de ser robados.*`;

    // 📩 Enviar mensaje de confirmación
    await conn.sendMessage(msg.key.remoteJid, { text: mensaje }, { quoted: msg });

  } catch (error) {
    console.error("❌ Error en el comando .depositar:", error);
    await conn.sendMessage(msg.key.remoteJid, { 
      text: "❌ *Hubo un error al depositar diamantes. Inténtalo de nuevo.*" 
    }, { quoted: msg });
  }
};

module.exports.command = ['depositar', 'dep'];
