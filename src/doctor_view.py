from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

DATABASE_URL = "postgresql://postgres:admin1234@new-mymedirecords.cbs8imeeg5j7.us-east-1.rds.amazonaws.com/mymedirecords"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

app = FastAPI()

class Test(Base):
    __tablename__ = "tbltest"
    testid = Column(Integer, primary_key=True, index=True)
    testname = Column(String, nullable=False)
    testminvalue = Column(Float, nullable=False)
    testmaxvalue = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    category = Column(String, nullable=False)
    results = relationship("TestResult", back_populates="test")

class TestResult(Base):
    __tablename__ = "tbltestresults"
    resultid = Column(Integer, primary_key=True, index=True)
    testid = Column(Integer, ForeignKey("tbltest.testid"))
    patientid = Column(Integer, index=True)
    reportid = Column(Integer)
    testvalue = Column(String, nullable=False)
    status = Column(String, nullable=False)
    uploadeddatetime = Column(DateTime, nullable=False)
    test = relationship("Test", back_populates="results")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/report/{report_id}")
def get_report_details(report_id: int, db: Session = Depends(get_db)):
    results = db.query(TestResult).join(Test).filter(TestResult.reportid == report_id).all()
    if not results:
        raise HTTPException(status_code=404, detail="Report not found")

    report_details = [
        {
            "category": result.test.category,
            "testname": result.test.testname,
            "testvalue": result.testvalue,
            "status": result.status,
            "uploadeddatetime": result.uploadeddatetime,
        }
        for result in results
    ]
    return {"report_id": report_id, "details": report_details}

@app.get("/report/{report_id}/category/{category}")
def get_tests_by_category(report_id: int, category: str, db: Session = Depends(get_db)):
    results = (
        db.query(TestResult)
        .join(Test)
        .filter(TestResult.reportid == report_id, Test.category == category)
        .all()
    )
    if not results:
        raise HTTPException(status_code=404, detail="No tests found for this category")

    test_details = [
        {
            "testname": result.test.testname,
            "testvalue": result.testvalue,
            "status": result.status,
            "uploadeddatetime": result.uploadeddatetime,
        }
        for result in results
    ]
    return {
        "report_id": report_id,
        "category": category,
        "test_count": len(test_details),
        "tests": test_details,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
