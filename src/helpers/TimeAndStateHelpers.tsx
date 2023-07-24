import { GameState, GameStateInfo, GameStaticInfo } from "src/models/models"

export function getGameStateDesc1(gameState: GameState) {
    var challengeDesc = ""
    if (gameState == 'INITIAL') {
        challengeDesc = "Voting hasn't started for this game yet."
    } else if(gameState == 'VOTING_STARTED'){
        challengeDesc = "Voting is in progress"
    } else if (gameState == 'VOTING_ENDED') {
        challengeDesc = "Voting has ended"
    } else if (gameState == 'RESULT_PUBLISHED'){
        challengeDesc = "Results have been published"
    } else if (gameState == 'RESULT_LOCKED'){
        challengeDesc = "Challenge phase has ended!"
    } else if (gameState == 'FUCKED_UP'){
        challengeDesc = "Uh-Oh! Sadly game cannot be completed!"
    }
    return challengeDesc
}

function getGameStateDesc2AsTimerPrefix(gameState: GameState, isTimerActive: boolean) {
    var challengeDesc = ""
    if (gameState == 'INITIAL') {
        challengeDesc = "Checkout other games or come back in some time."
    } else if(gameState == 'VOTING_STARTED'){
        challengeDesc = isTimerActive? "Ends in ": "About to end!"
    } else if (gameState == 'VOTING_ENDED') {
        challengeDesc = isTimerActive? "Please wait for results to be published. Expected in ": "Please wait for results to be published!"
    } else if (gameState == 'RESULT_PUBLISHED'){
        challengeDesc = isTimerActive? "Challenge phase is open for this game. Ends in ": "Challenge phase about to end!"
    } else if (gameState == 'RESULT_LOCKED'){
        challengeDesc = "Game has completed!"
    } else if (gameState == 'FUCKED_UP'){
        challengeDesc = "You can claim back your invested amount"
    }
    return challengeDesc
}

export function getGameStateDesc2AndSetTimer(staticInfo: GameStaticInfo, stateInfo: GameStateInfo, timerId: string, onTimerStart: (timer: NodeJS.Timer)=>void, onTimerEnd: ()=> void) {
    const isTimerActive = showCountdown(staticInfo, stateInfo, timerId, onTimerStart, onTimerEnd)
    return getGameStateDesc2AsTimerPrefix(stateInfo.gameState, isTimerActive)
}

export function showCountdown(staticInfo: GameStaticInfo, stateInfo: GameStateInfo, timerId: string, onTimerStart: (timer: NodeJS.Timer)=>void, onTimerEnd: ()=> void): boolean {
    var duration = 0
    if (stateInfo.gameState == 'VOTING_STARTED') {
        duration = staticInfo.durationVoting
    } else if (stateInfo.gameState == 'VOTING_ENDED') {
        duration = staticInfo.durationResultPublish
    } else if (stateInfo.gameState == 'RESULT_PUBLISHED') {
        duration = staticInfo.durationChallenge
    } else {
        return false
    }

    const now: number = Math.floor(Date.now()/1000); // Unix timestamp in ms
    var distance = stateInfo.currentStateStartedTime + duration - now
    if (distance <= 0) {
        return false
    }

    // Update the countdown every 1 second
    const x = setInterval(function() {
        const timerElement = document.getElementById(timerId)
        const now = new Date().getTime();

        const hours = Math.floor(distance / 3600);
        const minutes = Math.floor((distance / 60) % 60);
        const seconds = Math.floor(distance % 60);

        if (timerElement) {
            timerElement.textContent = hours.toString().padStart(2, '0') + ":"+ minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0') + ""
        }

        distance--
        // If the countdown is finished, display a message
        if (distance < 0) {
            if (timerElement) {
                timerElement.textContent = ""
            }
            clearInterval(x);
            // clear and trigger re-render to fetch latest states
            onTimerEnd()
        }
    }, 1000);

    onTimerStart(x)
    return true
}
