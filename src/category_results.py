from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session
from config import SQLALCHEMY_DATABASE_URL
from sqlalchemy import func
from typing import List
from pydantic import BaseModel

# Database setup
DATABASE_URL = SQLALCHEMY_DATABASE_URL
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database models
class TestResult(Base):
    __tablename__ = 'tbltestresults'
    resultid = Column(Integer, primary_key=True, index=True)
    testid = Column(Integer, ForeignKey('tbltest.testid'))
    patientid = Column(Integer, index=True)
    reportid = Column(Integer)
    testvalue = Column(String)
    status = Column(String)
    uploadeddatetime = Column(DateTime)
    test = relationship("Test", back_populates="results")

class Test(Base):
    __tablename__ = 'tbltest'
    testid = Column(Integer, primary_key=True, index=True)
    testname = Column(String)
    testminvalue = Column(Float)
    testmaxvalue = Column(Float)
    unit = Column(String)
    category = Column(String)
    results = relationship("TestResult", back_populates="test")

Base.metadata.create_all(bind=engine)

# Pydantic models
class TestCategoryResponse(BaseModel):
    category: str

class TestNamesResponse(BaseModel):
    testname: str

class TestValuesResponse(BaseModel):
    testvalue: float
    uploadeddatetime: str

# FastAPI setup
app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/categories/{patient_id}", response_model=List[TestCategoryResponse])
def get_categories(patient_id: int, db: Session = Depends(get_db)):
    categories = db.query(Test.category).distinct().join(TestResult).filter(TestResult.patientid == patient_id).all()
    return [{"category": category[0]} for category in categories]

@app.get("/tests/{patient_id}/{category}", response_model=List[TestNamesResponse])
def get_test_names(patient_id: int, category: str, db: Session = Depends(get_db)):
    test_names = (
        db.query(Test.testname)
        .join(TestResult, Test.testid == TestResult.testid)
        .filter(Test.category == category, TestResult.patientid == patient_id)
        .distinct()
        .all()
    )
    return [{"testname": test_name[0]} for test_name in test_names]

@app.get("/test_results/{patient_id}/{category}/{test_name}", response_model=List[TestValuesResponse])
def get_test_values(patient_id: int, category: str, test_name: str, db: Session = Depends(get_db)):
    test = db.query(Test).filter(Test.testname == test_name, Test.category == category).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    # Subquery to find latest result per uploadeddatetime
    subq = (
        db.query(TestResult)
        .filter(TestResult.patientid == patient_id, TestResult.testid == test.testid)
        .order_by(TestResult.uploadeddatetime.desc())
        .subquery()
    )
    
    # Main query to fetch distinct results based on uploadeddatetime
    test_results = (
        db.query(subq.c.testvalue, subq.c.uploadeddatetime)  # Include testvalue in the query
        .group_by(subq.c.testvalue, subq.c.uploadeddatetime)  # Group by testvalue and uploadeddatetime
        .order_by(subq.c.uploadeddatetime.desc())
        .all()
    )
    
    # Transform results to desired response format
    response = [
        {"testvalue": result.testvalue, "uploadeddatetime": result.uploadeddatetime.strftime("%Y-%m-%d %H:%M:%S")}
        for result in test_results
    ]
    
    return response

