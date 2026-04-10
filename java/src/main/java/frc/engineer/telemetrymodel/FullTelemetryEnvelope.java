package frc.engineer.telemetrymodel;

import frc.engineer.dto.DtoModels;
import frc.engineer.packets.PacketModels;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class FullTelemetryEnvelope {
    public Instant capturedAt;

    public PacketModels.PacketHeader header;
    public PacketModels.PacketSessionData session;
    public PacketModels.PacketEventData lastEvent;
    public PacketModels.PacketParticipantsData participants;
    public PacketModels.PacketMotionData motion;
    public PacketModels.PacketLapData lapData;
    public PacketModels.PacketCarSetupData carSetups;
    public PacketModels.PacketCarTelemetryData carTelemetry;
    public PacketModels.PacketCarStatusData carStatus;
    public PacketModels.PacketCarDamageData carDamage;
    public Map<Integer, PacketModels.PacketSessionHistoryData> sessionHistoryByCar = new HashMap<>();
    public Map<Integer, PacketModels.PacketTyreSetsData> tyreSetsByCar = new HashMap<>();

    public List<CarEnvelope> cars = new ArrayList<>();
    public DtoModels.PitwallState pitwall;
}
