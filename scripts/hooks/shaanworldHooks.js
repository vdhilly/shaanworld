// import { querySelectorAll } from "../../module/utils/utils.js"

export default () => {
  Hooks.on("renderChatMessage", async (message, html, data) => {
    const $rollMessage = html.find(".domainCheck").first();

    if ($rollMessage) {
      const $chatMessage = $rollMessage.closest(".chat-message");
      $chatMessage.addClass("roll-message");
    }
  });
  Hooks.on("renderChatMessage", async (message, html, data) => {
    const $rollMessage = html.find(".healCheck").first();

    if ($rollMessage) {
      const $chatMessage = $rollMessage.closest(".chat-message");
      $chatMessage.addClass("roll-message");
    }
  });
  Hooks.on("renderChatMessage", async (message, html, data) => {
    const $rollMessage = html.find(".regen").first();

    if ($rollMessage) {
      const $chatMessage = $rollMessage.closest(".chat-message");
      $chatMessage.addClass("roll-message");
    }
  });

  Hooks.on("renderDialog", async (dialog, html, data) => {
    if (dialog.title === "Create New Item") {
      const $html = html[0];

      const itemOptions = $html.querySelectorAll('select[name="type"] option');
      for (const itemOption of itemOptions) {
        itemOption.textContent = game.i18n.localize(
          "Item." + itemOption.textContent
        );
      }
    }
  });
  Hooks.on("renderDialog", async (dialog, html, data) => {
    const regenDialog = html.find(".regen-dialog")
      ? html.find(".regen-dialog")[0]
      : null;

    if (regenDialog)
      regenDialog.closest(".window-content").classList.add("green-bg");
  });
  Hooks.on("renderDialog", async (dialog, html, data) => {
    const regenDialog = html.find(".healing-dialog")
      ? html.find(".healing-dialog")[0]
      : null;

    if (regenDialog)
      regenDialog.closest(".window-content").classList.add("green-bg");
  });
};
