// import { querySelectorAll } from "../../module/utils/utils.js"

export default () => {

    Hooks.on('renderChatMessage', async (message, html, data) => {
        const $rollMessage = html.find('.domainCheck').first()

        if($rollMessage){
            const $chatMessage = $rollMessage.closest('.chat-message')
            $chatMessage.addClass('roll-message')
        }
    })

    Hooks.on('renderDialog', async (dialog, html, data) => {
        if(dialog.title === "Create New Item"){
            const $html = html[0]

            const itemOptions = $html.querySelectorAll('select[name="type"] option')
            for (const itemOption of itemOptions) {
                itemOption.textContent = game.i18n.localize('Item.' + itemOption.textContent)
            }
            
        }
    })
}