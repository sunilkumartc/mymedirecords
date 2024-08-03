# models.py
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy import Column, Integer, String, ForeignKey, BigInteger
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    phone = Column(BigInteger)
    user_type = Column(String)
    certificate_no = Column(String, nullable=True)

class Report(Base):
    __tablename__ = 'reports'
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey('users.id'))
    report_id = Column(String, unique=True, index=True)
    report_path_s3 = Column(String)

    user = relationship("User", back_populates="reports")

User.reports = relationship("Report", order_by=Report.id, back_populates="user")

DATABASE_URL = "postgresql+asyncpg://postgres:admin1234@new-mymedirecords.cbs8imeeg5j7.us-east-1.rds.amazonaws.com/mymedirecords"


engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(
    bind=engine,
    expire_on_commit=False,
    class_=AsyncSession
)


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
