export default () => {
  const addRollMessageClass = (html, selector) => {
    const $rollMessage = html.find(selector).first();
    if ($rollMessage) {
      const $chatMessage = $rollMessage.closest(".chat-message");
      $chatMessage.addClass("roll-message");
    }
  };

  Hooks.on("renderChatMessage", async (message, html, data) => {
    const selectors = [".domainCheck", ".ally-check", ".healCheck", ".regen"];
    selectors.forEach((selector) => addRollMessageClass(html, selector));
  });

  Hooks.on("renderDialog", async (dialog, html, data) => {
    if (dialog.title === "Create New Item") {
      const itemOptions = html[0].querySelectorAll('select[name="type"] option');
      itemOptions.forEach((itemOption) => {
        itemOption.textContent = game.i18n.localize("Item." + itemOption.textContent);
      });
    }

    const dialogSelectors = [".regen-dialog", ".healing-dialog"];
    dialogSelectors.forEach((selector) => {
      const targetDialog = html.find(selector).first();
      if (targetDialog) {
        targetDialog.closest(".window-content").classList.add("green-bg");
      }
    });
  });
};
