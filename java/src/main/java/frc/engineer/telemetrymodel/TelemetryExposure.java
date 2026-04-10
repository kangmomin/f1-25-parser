package frc.engineer.telemetrymodel;

import frc.engineer.packets.PacketModels;
import java.util.List;

public final class TelemetryExposure {
    private TelemetryExposure() {
    }

    public static boolean canExposePublicOrSelf(
            int playerIndex,
            int carIndex,
            PacketModels.PacketParticipantsData participants
    ) {
        if (carIndex == playerIndex) {
            return true;
        }
        if (participants == null) {
            return false;
        }
        List<PacketModels.ParticipantData> participantList = participants.participants;
        if (participantList == null || carIndex < 0 || carIndex >= participantList.size()) {
            return false;
        }
        PacketModels.ParticipantData participant = participantList.get(carIndex);
        return participant != null && Integer.valueOf(1).equals(participant.yourTelemetry);
    }
}
