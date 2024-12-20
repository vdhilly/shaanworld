export function AllyCheck(ally) {
  const messageTemplate = "systems/shaanworld/templates/chat/ally/ally-check.hbs";

  const ame = Math.floor(Math.random() * 10);
  const necrose = Math.floor(Math.random() * 10);

  let success = 0;
  let loyalty = 0;

  // Success
  if (ame === 9) success++;
  if (ame > necrose) success++;
  if (ame === 0) success--;

  // Loyalty
  if (necrose === 0) loyalty--;
  if (necrose > ame) loyalty--;

  let rollResult = {
    dice: {
      ame: {
        total: ame === 0 ? 10 : ame,
        flavor: "Ame",
      },
      necrose: {
        total: necrose === 0 ? 10 : necrose,
        flavor: "Necrose",
      },
    },
    success,
    loyalty,
  };

  toCustomMessage(ally, rollResult, messageTemplate);
}

export async function toCustomMessage(ally = null, roll, template) {
  let templateContext = {
    ally,
    roll,
  };

  let chatData;
  if (game.dice3d != undefined) {
    chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ ally }),
      content: await renderTemplate(template, templateContext),
      sound: CONFIG.sounds.dice,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    };
  } else {
    chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ ally }),
      content: await renderTemplate(template, templateContext),
      sound: CONFIG.sounds.dice,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    };
  }
  let message = await ChatMessage.create(chatData);
}
