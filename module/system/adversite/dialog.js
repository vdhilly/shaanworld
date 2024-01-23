export class AdversiteDialog extends Dialog {
    async activateListeners($html) {
        super.activateListeners($html)
        const html = $html[0];

        const formGroup = html.querySelector('.form-group.adversites')
        if(formGroup){
            $(formGroup).closest(".app.dialog").addClass("adversites")
        }
    }
}