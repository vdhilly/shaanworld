export default () => {

    Hooks.on('renderChatMessage', async (message, html, data) => {
        const $rollMessage = html.find('.domainCheck').first()

        if($rollMessage){
            const $chatMessage = $rollMessage.closest('.chat-message')
            $chatMessage.addClass('roll-message')
        }
    })
}