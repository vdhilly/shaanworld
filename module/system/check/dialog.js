
export class CheckDialog extends Dialog {
    async activateListeners($html) {
        super.activateListeners($html)
        const html = $html[0];
    
        const formGroup = html.querySelector('.form-group.check')

        function updateVocOptions(selectedDomain, vocation1, vocation2, actor){
            
            const selectedDomainVoc = actor.system.domains[selectedDomain]
            const otherDomainVoc = []
            for (const domainKey in actor.system.domains){
                const domain = actor.system.domains[domainKey]
                if(domainKey !== selectedDomain){
                    for(const vocation of domain.vocations){
                        otherDomainVoc.push(vocation)
                    }
                }
            }

    
            console.log(selectedDomainVoc);
            console.log(otherDomainVoc)

        }


        const domainSelect = formGroup.querySelector('select.domain');
        const vocation1Select = formGroup.querySelector('select.vocation1');
        const vocation2Select = formGroup.querySelector('select.vocation2');
  
        if(domainSelect && vocation1Select && vocation2Select) {
            let actor = game.actors.get(domainSelect.dataset.actorId)
            updateVocOptions(domainSelect.value, vocation1Select, vocation2Select, actor)

            domainSelect.addEventListener('change', function () {
                console.log(actor)
                updateVocOptions(domainSelect.value, vocation1Select, vocation2Select, actor)
                console.log("oui")
            })
        }
    }
}