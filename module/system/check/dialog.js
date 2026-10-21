/**
 * Active la logique du dialogue de test de domaine :
 * - ajoute la classe "check" à la fenêtre
 * - remplit les listes de vocations selon le domaine choisi
 *
 * À utiliser comme callback `render` de DialogV2 :
 *   render: (event, dialog) => setupCheckDialog(dialog, actor)
 *
 * @param {foundry.applications.api.DialogV2} dialog
 * @param {Actor} actor
 */
export function setupCheckDialog(dialog, actor) {
  const html = dialog.element;

  const formGroup = html.querySelector(".form-group.check");
  if (!formGroup) return;

  html.classList.add("check");

  const domainSelect = formGroup.querySelector("select.domain");
  const vocation1Select = formGroup.querySelector("select.vocation1");
  const vocation2Select = formGroup.querySelector("select.vocation2");
  if (!domainSelect || !vocation1Select || !vocation2Select || !actor) return;

  const domainKey = (domain) => domain.toLowerCase().replace("é", "e");

  const addOption = (select, value, text) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;
    select.appendChild(option);
  };

  const updateVocOptions = (selectedDomain) => {
    // Vocations de l'acteur regroupées par domaine
    const vocations = {};
    for (const domain of CONFIG.shaanworld.domains) {
      vocations[domainKey(domain)] = actor.items.filter((item) => item.system.domain === domain);
    }

    const selectedDomainVoc = vocations[selectedDomain] ?? [];
    const otherDomainVoc = Object.entries(vocations)
      .filter(([key]) => key !== selectedDomain)
      .flatMap(([, items]) => items);

    vocation1Select.replaceChildren();
    vocation2Select.replaceChildren();

    // Option vide
    addOption(vocation1Select, "0", "");
    addOption(vocation2Select, "0", "");

    for (const vocation of selectedDomainVoc) {
      addOption(vocation1Select, vocation.id, `${vocation.name} +${vocation.system.bonus}`);
    }
    for (const vocation of otherDomainVoc) {
      addOption(vocation2Select, vocation.id, `${vocation.name} +${vocation.system.bonus}`);
    }
  };

  updateVocOptions(domainSelect.value);
  domainSelect.addEventListener("change", () => updateVocOptions(domainSelect.value));
}