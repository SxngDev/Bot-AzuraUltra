// plugins2/delco.js
const fs = require("fs");
const path = require("path");

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const isGroup = chatId.endsWith("@g.us");
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);
  const isFromMe = msg.key.fromMe;

  if (isGroup && !isOwner && !isFromMe) {
    const metadata = await conn.groupMetadata(chatId);
    const participant = metadata.participants.find(p => p.id === senderId);
    const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";
    if (!isAdmin) {
      return conn.sendMessage(chatId, {
        text: "🚫 *Solo los administradores, el owner o el bot pueden usar este comando.*"
      }, { quoted: msg });
    }
  } else if (!isGroup && !isOwner && !isFromMe) {
    return conn.sendMessage(chatId, {
      text: "🚫 *Solo el owner o el mismo bot pueden usar este comando en privado.*"
    }, { quoted: msg });
  }

  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (!quoted?.stickerMessage) {
    return conn.sendMessage(chatId, {
      text: "❌ *Responde a un sticker que tenga comando para eliminarlo.*"
    }, { quoted: msg });
  }

  const fileSha = quoted.stickerMessage.fileSha256?.toString("base64");
  if (!fileSha) {
    return conn.sendMessage(chatId, {
      text: "❌ *No se pudo obtener el ID único del sticker.*"
    }, { quoted: msg });
  }

  const rawID = conn.user?.id || "";
  const subbotID = `${rawID.split(":")[0]}@s.whatsapp.net`;
  const jsonPath = path.resolve("./comandossubbots.json");

  let data = {};
  if (fs.existsSync(jsonPath)) {
    try {
      data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    } catch {
      data = {};
    }
  }

  if (!data[subbotID] || !data[subbotID][fileSha]) {
    return conn.sendMessage(chatId, {
      text: "ℹ️ *Este sticker no tiene un comando asignado en este subbot.*"
    }, { quoted: msg });
  }

  delete data[subbotID][fileSha];
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));

  await conn.sendMessage(chatId, {
    react: { text: "🗑️", key: msg.key }
  });

  return conn.sendMessage(chatId, {
    text: "✅ *Comando eliminado del sticker exitosamente.*",
    quoted: msg
  });
};

handler.command = ["delco"];
handler.tags = ["tools"];
handler.help = ["delco"];
module.exports = handler;
