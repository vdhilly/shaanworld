import { getSelectedOrOwnActors } from "../../utils/utils.js";

export function addChatListeners(app, html, data) {
    const Button = html.find("button.ajout-adversite");
    Button.on("click", onAddAdversite);
}

async function onAddAdversite(event){
    const actors = (0, getSelectedOrOwnActors)([
        "character"
      ]);
      if (actors.length == 0)
        return ui.notifications.warn("Vous devez sélectionner au moins un token.");
    const adversite = canvas.tokens.controlled.flatMap((token => token.actor ? token.actor : [])).filter((actor => actor.isOfType("adversite")));
      if (adversite.length == 0)
        return ui.notifications.warn("Vous devez sélectionner un token.");
      if (adversite.length > 1) return ui.notifications.warn("Vous ne devez sélectionner qu'un seul token.")
    console.log(adversite)
    const chatCard = $(this.parentElement);
    const diceValues = chatCard.find("input.dice-value");
    const domainLevel = Number(chatCard.find("span.domain")[0].dataset.domainLevel)
    const domainName = chatCard.find("span.domain")[0].dataset.domain
    const adversiteDomains = []
    for (const domainKey in adversite[0].system.domains){
        const domains = adversite[0].system.domains
        if(domains[domainKey]){
            adversiteDomains.push(domainKey)
        }
    }
    console.log(adversiteDomains)

    let score = Number(chatCard.find(".score")[0].innerText)
    let perte = Number(chatCard.find(".pertes")[0].innerText.replace("énergies", "").replace("et un malus narratif"))
    console.log(score, perte)
    
}