import json
from faker import Faker
import random

fake = Faker()

def generate_patient_record():
    p_id = f"PAT-{fake.unique.random_number(digits=5)}"
    
    def format_date(date_obj):
        return date_obj.strftime("%d/%m/%Y")

    num_ulcers = random.randint(1, 3)
    ulcers_list = []
    foot_graph_list = []
    
    for i in range(1, num_ulcers + 1):
        u_id = f"ULC-{i}"
        
        foot_graph_list.append({
            "xCoordinate": round(random.uniform(0.1, 10.0), 2),
            "yCoordinate": round(random.uniform(0.1, 10.0), 2),
            "ulcerId": u_id
        })
        
        ulcers_list.append({
            "NumberOfScans": random.randint(1, 10),
            "UlcerTemperature": str(round(random.uniform(36.0, 38.5), 1)),
            "Volume": str(round(random.uniform(0.5, 5.0), 2)),
            "Depth": str(round(random.uniform(0.1, 1.5), 2)),
            "LatestGlucoseReading": str(random.randint(90, 180)),
            "UlcerGrade": str(random.randint(1, 4))
        })

    return {
        "ClinicianId": f"DOC-{random.randint(100, 999)}",
        "PatientId": p_id,
        "Name": fake.name(),
        "UserNumber": fake.phone_number(),
        "Personal Details": {
            "PatientId": p_id,
            "DateOfBirth": format_date(fake.date_of_birth(minimum_age=40, maximum_age=80)),
            "Name": fake.name(),
            "TreatmentStartDate": format_date(fake.date_between(start_date="-1y", end_date="today")),
            "LastScanDate": format_date(fake.date_between(start_date="-30d", end_date="today")),
            "NextScanDate": format_date(fake.date_between(start_date="today", end_date="+30d")),
            "LastVisitDate": format_date(fake.date_between(start_date="-20d", end_date="today")),
            "NextVisitDate": format_date(fake.date_between(start_date="+20d", end_date="+40d")),
            "Status": random.choice(["New", "Active", "Pending", "Warning"]),
            "Gender": random.choice(["Male", "Female"]),
            "Height": str(random.randint(150, 200)),
            "Weight": str(random.randint(50, 120)),
            "ContactDetails": {
                "Phone": fake.phone_number(),
                "EmailAddress": fake.email()
            }
        },
        "DiabetesInfo": {
            "DiabetesType": random.choice([1, 2]),
            "PreviousAmputation": random.choice([True, False]),
            "YearsDiagnosed": str(random.randint(1, 40)),
            "PreviousTreatments": "Metformin",
            "OtherDiabeticAssociatedComplications": "None",
            "LastHb1AcReading": str(round(random.uniform(5.0, 10.0), 1)),
            "LastHb1AcReadingDate": format_date(fake.date_between(start_date="-6m", end_date="-1m")),
            "LastLipidProfile": "70",
            "LastLipidProfileDate": format_date(fake.date_between(start_date="-6m", end_date="-1m")),
            "Medication": True,
            "MedicationsInfo": "Insulin",
            "OtherDMOrCVComplications": "None"
        },
        "MedicalHistory": "No significant cardiac history.",
        "FootGraph": foot_graph_list,
        "Ulcers": ulcers_list
    }

def create_patient_batch(batch_size, filename="patients_batch.json"):
    patients = [generate_patient_record() for _ in range(batch_size)]
    
    with open(filename, "w") as f:
        json.dump(patients, f, indent=4)
    
    print(f"Successfully generated {batch_size} patients in '{filename}'.")

number_of_patients = 100 
create_patient_batch(number_of_patients)