from fastapi import FastAPI, HTTPException, Query
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from pydantic import BaseModel
from datetime import datetime
from config import SQLALCHEMY_DATABASE_URL
from fastapi.middleware.cors import CORSMiddleware

# Replace with your actual database URL
DATABASE_URL = SQLALCHEMY_DATABASE_URL

# SQLAlchemy setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Define the ORM model for tblreports
class Report(Base):
    __tablename__ = "tblreports"

    reportid = Column(Integer, primary_key=True, index=True)
    patientid = Column(Integer)
    reportpath = Column(String)
    uploaded_at = Column(DateTime)
    is_seen = Column(Integer)
    doctorid = Column(String)  # Assuming correct column name is doctorid
    seen_at = Column(DateTime)  # Assuming correct column name is seen_at
    status = Column(String)  # Assuming correct column name is status
    doctor_name = Column(String)  # Assuming correct column name is doctor_name
    report_name = Column(String)  # Assuming correct column name is report_name
    patient_name = Column(String)  # Assuming correct column name is patient_name
    gender = Column(String)
    age = Column(String)  # Adding the age column

    # Define relationship with TestResult
    test_results = relationship("TestResult", back_populates="report", cascade="all, delete-orphan")

# Define the ORM model for tbltestresults
class TestResult(Base):
    __tablename__ = "tbltestresults"

    resultid = Column(Integer, primary_key=True, index=True)
    testid = Column(Integer)
    patientid = Column(Integer)
    reportid = Column(Integer, ForeignKey("tblreports.reportid"))
    testvalue = Column(String)
    status = Column(String)
    uploadeddatetime = Column(DateTime)

    # Define relationship with Report
    report = relationship("Report", back_populates="test_results")

# Create tables if they do not exist
Base.metadata.create_all(bind=engine)

# FastAPI instance
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, you can specify a list of origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Pydantic model for report response
class ReportResponse(BaseModel):
    patient_id: int
    report_id: int
    report_name: str
    uploaded_at: datetime
    doctor_name: str
    patient_name: str
    gender: str
    age: str

# FastAPI endpoint to fetch reports details by patient ID
@app.get("/report-details/")
async def get_report_details(patient_id: int = Query(..., description="Patient ID")):
    db = SessionLocal()
    reports = db.query(Report).filter(Report.patientid == patient_id).all()
    db.close()
    if not reports:
        raise HTTPException(status_code=404, detail="Reports not found")
    
    # Prepare the response
    report_details = []
    for report in reports:
        # Check if doctor_name or patient_name is None and handle it gracefully
        doctor_name = report.doctor_name if report.doctor_name is not None else ""
        patient_name = report.patient_name if report.patient_name is not None else ""
        gender = report.gender if report.gender is not None else ""
        age = report.age if report.age is not None else 0  # Assuming default age is 0 if not provided
        
        report_details.append(
            ReportResponse(
                patient_id=report.patientid,
                report_id=report.reportid,
                report_name=report.report_name,
                uploaded_at=report.uploaded_at,
                doctor_name=doctor_name,
                patient_name=patient_name,
                gender=gender,
                age=age  # Include the age field
            )
        )
    
    return report_details

# FastAPI endpoint to delete report by reportid
@app.delete("/delete-report/")
async def delete_report(report_id: int = Query(..., description="Report ID to delete")):
    db = SessionLocal()
    report = db.query(Report).filter(Report.reportid == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail=f"Report with report_id {report_id} not found")
    
    db.delete(report)
    db.commit()
    db.close()
    
    return {"message": f"Report with report_id {report_id} has been successfully deleted"}

# Run the FastAPI server with uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
