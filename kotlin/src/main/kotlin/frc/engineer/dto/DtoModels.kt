package frc.engineer.dto

data class PitwallState(
    val focusedCarIndex: Int? = null,
    val notes: List<String> = emptyList(),
    val warnings: List<String> = emptyList(),
)

data class CarDamage(
    val frontLeftWing: Int? = null,
    val frontRightWing: Int? = null,
    val rearWing: Int? = null,
    val floor: Int? = null,
    val diffuser: Int? = null,
    val sidepod: Int? = null,
    val gearbox: Int? = null,
    val engine: Int? = null,
)

data class TyreSetBrief(
    val index: Int? = null,
    val compound: String? = null,
    val ageLaps: Int? = null,
    val wear: Int? = null,
    val available: Boolean? = null,
)

data class StintInfoDTO(
    val startLap: Int? = null,
    val endLap: Int? = null,
    val compound: String? = null,
    val totalLaps: Int? = null,
)

data class DynamicsLapDTO(
    val lapNumber: Int? = null,
    val fuelInTank: Float? = null,
    val ersPct: Int? = null,
    val tireWearAvg: Float? = null,
)
