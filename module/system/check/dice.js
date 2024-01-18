import { CheckDialog } from "./dialog.js";

export async function domainCheck(actor){
    const actorData = actor ? actor.system : null;
    const messageTemplate = "systems/shaanworld/templates/chat/domainCheck-chat.hbs"
    let domain, vocations, bonus, malus, lignee, people

    let checkOptions = await GetRollOptions()

    if(checkOptions.cancelled){
        return;
    }

    domain = checkOptions.domain
    vocations = checkOptions.vocations
    vocations.vocation1 = actor.items.get(vocations.vocation1)
    vocations.vocation2 = actor.items.get(vocations.vocation2)
    bonus = checkOptions.bonus
    malus = checkOptions.malus
    lignee = checkOptions.lignee
    people = checkOptions.people

    let rollFormula
    if(domain == "necrose"){
        rollFormula = "{1d10[Ame], 1d10[Necrose]}"
    } else {
        rollFormula = "{1d10[Corps], 1d10[Ame], 1d10[Esprit], 1d10[Necrose]}"
    }

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

    let Corps, Ame, Esprit, Necrose, perte, domainDice, domainFlavor
    if(domain !== "necrose"){
        Corps = rollResult.dice[0]
        Ame = rollResult.dice[1]
        Esprit = rollResult.dice[2]
        Necrose = rollResult.dice[3]
    
        if(Corps.total == Ame.total && Ame.total == Esprit.total && Esprit.total != 10){
            //Symbiose
            rollResult.symbiose = true
        } else if (Corps.total == Ame.total && Ame.total == Necrose.total ){
            rollResult.symbioseLimbe = true
        } else if (Corps.total == Ame.total && Ame.total == Esprit.total && Esprit.total == 10){
            rollResult.symbioseLimbe = true
        } else if (Corps.total == Esprit.total && Esprit.total == Necrose.total ){
            rollResult.symbioseLimbe = true
        } else if (Esprit.total == Ame.total && Ame.total == Necrose.total ){
            rollResult.symbioseLimbe = true
        } else if (Esprit.total == Ame.total && Ame.total == Esprit.total && Esprit.total == Necrose.total && Necrose.total !== 10) {
            rollResult.symbioseTrans = true
        } else if (Esprit.total == Ame.total && Ame.total == Esprit.total && Esprit.total == Necrose.total && Necrose.total == 10) {
            rollResult.symbioseTransLimbes = true
        }
        if(Necrose.total == 10) {
            perte = game.i18n.localize('chat.domainCheck.pertes.great')
        } else if (Necrose.total > 0 && Necrose.total < 6) {
            perte = game.i18n.localize('chat.domainCheck.pertes.low')
        } else if (Necrose.total > 5 && Necrose.total < 10) {
            perte = game.i18n.localize('chat.domainCheck.pertes.medium')
        }
    } else {
        Ame = rollResult.dice[0]
        Necrose = rollResult.dice[1]

        if(Ame.total == 10) {
            perte = game.i18n.localize('chat.domainCheck.pertes.great')
        } else if (Ame.total > 0 && Ame.total < 6) {
            perte = game.i18n.localize('chat.domainCheck.pertes.low')
        } else if (Ame.total > 5 && Ame.total < 10) {
            perte = game.i18n.localize('chat.domainCheck.pertes.medium')
        }
    }

    if (domain == "technique" || domain == "savoir" || domain == "social") {
    domainDice = Esprit;
    domainFlavor = "Esprit"
    } else if (domain == "arts" || domain == "shaan" || domain == "magie") {
    domainDice = Ame;
    domainFlavor = "Ame"
    } else if (domain == "rituels" || domain == "survie" || domain == "combat") {
    domainDice = Corps;
    domainFlavor = "Corps"
    } else if (domain == "necrose") {
        domainDice = Necrose;
        domainFlavor = "Necrose"
    }

    let score; 
    if(domainFlavor !== "Necrose") {
        if (domainDice.total == 10) {
            score = 0;
        } else {
            score = domainDice.total
            score += actor.system.domains[domain].rank
            if(bonus){
                score += bonus
            }
            if(malus){
                score -= malus
            }
            if(vocations.vocation1){
                score += vocations.vocation1.system.bonus
            }
            if(vocations.vocation2){
                score += vocations.vocation2.system.bonus
            }
            if(lignee){
                score += 2
            }
            if(people){
                score += 2
            }
            if(rollResult.symbiose || rollResult.symbioseTrans){
                score += 30
            }
        }
    } else {
        score = domainDice.total
        score += actor.system.domains[domain].rank
        if(bonus){
            score += bonus
        }
        if(malus){
            score -= malus
        }
        if(vocations.vocation1){
            score += vocations.vocation1.system.bonus
        }
        if(vocations.vocation2){
            score += vocations.vocation2.system.bonus
        }
        if(lignee){
            score += 2
        }
        if(people){
            score += 2
        }
    }

    RollToCustomMessage(actor, rollResult, messageTemplate, {
        domain: domain,
        domainLevel : actor.system.domains[domain].rank,
        score: score,
        bonus: bonus,
        malus: malus,
        vocations: vocations,
        lignee: lignee,
        people: people,
        actorID: actor.uuid,
        domainFlavor: domainFlavor, 
        perte: perte
    })

    
    async function GetRollOptions({template = "systems/shaanworld/templates/chat/domainCheck.hbs", domain = null, vocations = {vocation1: null, vocation2:null}, bonus = null, malus = null, lignee = false, people = false} = {}){
        const html = await renderTemplate(template, {actor, domain, vocations, bonus, malus, lignee, people});
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
        domain: form.domain?.value,
        vocations: {vocation1: form.vocation1.value, vocation2: form.vocation2.value},
        bonus: parseInt(form.bonus?.value),
        malus: parseInt(form.malus?.value),
        lignee: form.lignee?.checked,
        people: form.people?.checked,
        }
    }
}

export async function RollToCustomMessage(actor=null, rollResult, template, extraData){
    let templateContext = {
        ...extraData,
        roll: rollResult,
    };
    let chatData;
    if (game.dice3d != undefined) {
        chatData = {
          user: game.user.id,
          speaker: ChatMessage.getSpeaker({ actor }),
          content: await renderTemplate(template, templateContext),
          sound: CONFIG.sounds.dice,
          type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        };
      } else {
        chatData = {
          user: game.user.id,
          speaker: ChatMessage.getSpeaker({ actor }),
          content: await renderTemplate(template, templateContext),
          sound: CONFIG.sounds.dice,
          type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        };
      }
      let message = await ChatMessage.create(chatData);
}