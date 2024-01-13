import { CheckDialog } from "./dialog.js";

export async function domainCheck(actor){
    const actorData = actor ? actor.system : null;
    let domain, vocations, bonus, malus, lignee, people

    let checkOptions = await GetRollOptions()

    if(checkOptions.cancelled){
        return;
    }

    domain = checkOptions.domain
    vocations = checkOptions.vocations
    bonus = checkOptions.bonus
    malus = checkOptions.malus
    lignee = checkOptions.lignee
    people = checkOptions.people

    let rollFormula = "1d10[Corps], 1d10[Ame], 1d10[Esprit], 1d10[Necrose]"

    let rollData = {
        actor: actorData,
        domain: domain, 
        vocations:vocations,
        bonus:bonus,
        malus:malus,
        lignee:lignee,
        people:people
    };
    let rollResult = await new Roll(rollFormula, rollData).roll({ async: true });
    let dice3d;
    if (game.dice3d != undefined) {
      dice3d = game.dice3d.showForRoll(rollResult, game.user, true);
      dice3d;
    }

    async function GetRollOptions({template = "systems/shaanworld/templates/chat/domainCheck.hbs"} = {}){
        const html = await renderTemplate(template, {actor});
        const actorData = actor.toObject(!1);
        const config = CONFIG.shaanworld
    
        return new Promise((resolve) => {
            const data = {
                title: game.i18n.format("chat.domainCheck.title"),
                content: html,
                domains: config.domains,
                actor: actorData,
                buttons: {
                    normal: {
                        label: game.i18n.localize("chat.actions.roll"),
                        callback: (html) => resolve(_processDomainCheckOptions(html[0].querySelector("form"))),
                    },
                    cancel: {
                        label: game.i18n.localize("chat.actions.cancel"),
                        callback: (html) => resolve({cancelled:true}),
                    }
                },
                default: "normal",
                close: () => resolve({cancelled:true})
            };
    
            new CheckDialog(data, null).render(true);
        })
    }
    function _processDomainCheckOptions(form) {
        return {
        domain: parseInt(form.domain?.value),
        }
    }
}