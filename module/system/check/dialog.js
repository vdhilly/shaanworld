
export class CheckDialog extends Dialog {
    async activateListeners($html) {
        super.activateListeners($html)
        const html = $html[0];
    
        const formGroup = html.querySelector('.form-group.check')
        if(formGroup){
            $(formGroup).closest(".app.dialog").addClass("check")
        }

        function updateVocOptions(selectedDomain, vocation1, vocation2, actor){
            let vocations = {}
            for (const domain of CONFIG.shaanworld.domains) {
                vocations[domain.toLowerCase().replace("é", "e")] = actor.items.filter(function (item) {
                  return item.system.domain === domain;
                });
            }
            
            const selectedDomainVoc = vocations[selectedDomain]

            const otherDomainVoc = []
            for (const domainKey in vocations){
                const domain = vocations[domainKey]
                if(domainKey !== selectedDomain){
                    for(const vocation of domain){
                        otherDomainVoc.push(vocation)
                    }
                }
            }

            vocation1.innerHTML = "";
            vocation2.innerHTML = ""

            const empty = document.createElement('option');
            empty.value = 0
            empty.textContent = ""
            const empty2 = document.createElement('option');
            empty.value = 0
            empty.textContent = ""
            vocation1.appendChild(empty)
            vocation2.appendChild(empty2)
            
            
            selectedDomainVoc.forEach(function (vocation) {
                const optionElement = document.createElement('option');
                optionElement.value = vocation._id;
                optionElement.textContent = vocation.name + " +" + vocation.system.bonus
                vocation1.appendChild(optionElement);
            })
            otherDomainVoc.forEach(function (vocation) {
                const optionElement = document.createElement('option');
                optionElement.value = vocation._id;
                optionElement.textContent = vocation.name + " +" + vocation.system.bonus
                vocation2.appendChild(optionElement);
            })

        }


        const domainSelect = formGroup.querySelector('select.domain');
        const vocation1Select = formGroup.querySelector('select.vocation1');
        const vocation2Select = formGroup.querySelector('select.vocation2');
  
        if(domainSelect && vocation1Select && vocation2Select) {
            let actor = game.actors.get(domainSelect.dataset.actorId)
            updateVocOptions(domainSelect.value, vocation1Select, vocation2Select, actor)

            domainSelect.addEventListener('change', function () {
                updateVocOptions(domainSelect.value, vocation1Select, vocation2Select, actor)
            })
        }
    }
}