package frc.engineer.telemetrymodel;

import frc.engineer.packets.PacketModels;

public class CarEnvelope {
    public int carIndex;
    public PacketModels.ParticipantData participant;
    public PacketModels.CarMotionData motion;
    public PacketModels.LapData lap;
    public PacketModels.CarSetupData setup;
    public PacketModels.CarTelemetryData telemetry;
    public PacketModels.CarStatusData status;
    public PacketModels.CarDamageData damage;
    public PacketModels.PacketSessionHistoryData history;
    public PacketModels.PacketTyreSetsData tyreSets;
    public NormalizedCar normalized;
}
