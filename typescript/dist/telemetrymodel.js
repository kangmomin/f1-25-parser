export function canExposePublicOrSelf(playerIndex, carIndex, participants) {
    if (carIndex === playerIndex) {
        return true;
    }
    const participantList = participants?.participants;
    if (!participantList || carIndex < 0 || carIndex >= participantList.length) {
        return false;
    }
    return participantList[carIndex]?.yourTelemetry === 1;
}
