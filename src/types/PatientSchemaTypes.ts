export interface DiabetesInfo {
	MedicationsInfo?: string;
	DiabetesType?: string;
	PreviousAmputation?: string;
	YearsDiagnosed?: number;
	LastHb1AcReading?: number;
	LastLipidProfile?: number;
	Medication?: string;
	OtherDMOrCVComplications?: string;
}

export interface PersonalDetails {
	Gender?: string;
	Height?: number;
	Weight?: number;
}

export interface Patient {
	_id: string;
	DiabetesInfo?: DiabetesInfo;
	'Personal Details'?: PersonalDetails;
}
