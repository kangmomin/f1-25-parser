package dto

// PitwallState is an app-derived aggregate view for pitwall consumers.
type PitwallState struct {
	FocusedCarIndex int      `json:"focusedCarIndex,omitempty"`
	Notes           []string `json:"notes,omitempty"`
	Warnings        []string `json:"warnings,omitempty"`
}

// CarDamage is a condensed damage view used by normalized telemetry.
type CarDamage struct {
	FrontLeftWing  uint8 `json:"frontLeftWing,omitempty"`
	FrontRightWing uint8 `json:"frontRightWing,omitempty"`
	RearWing       uint8 `json:"rearWing,omitempty"`
	Floor          uint8 `json:"floor,omitempty"`
	Diffuser       uint8 `json:"diffuser,omitempty"`
	Sidepod        uint8 `json:"sidepod,omitempty"`
	Gearbox        uint8 `json:"gearbox,omitempty"`
	Engine         uint8 `json:"engine,omitempty"`
}

// TyreSetBrief is a short tyre inventory view.
type TyreSetBrief struct {
	Index     int    `json:"index,omitempty"`
	Compound  string `json:"compound,omitempty"`
	AgeLaps   uint8  `json:"ageLaps,omitempty"`
	Wear      uint8  `json:"wear,omitempty"`
	Available bool   `json:"available,omitempty"`
}

// StintInfoDTO describes a tyre stint interval.
type StintInfoDTO struct {
	StartLap  int    `json:"startLap,omitempty"`
	EndLap    int    `json:"endLap,omitempty"`
	Compound  string `json:"compound,omitempty"`
	TotalLaps int    `json:"totalLaps,omitempty"`
}

// DynamicsLapDTO stores app-derived lap dynamics.
type DynamicsLapDTO struct {
	LapNumber   int     `json:"lapNumber,omitempty"`
	FuelInTank  float32 `json:"fuelInTank,omitempty"`
	ERSPct      int     `json:"ersPct,omitempty"`
	TireWearAvg float32 `json:"tireWearAvg,omitempty"`
}
