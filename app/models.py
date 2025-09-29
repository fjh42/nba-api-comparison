from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from .database import Base

class Comparison(Base):
    __tablename__ = "comparisons"
    id = Column(Integer, primary_key=True, index=True)
    player1 = Column(String, nullable=False)
    player1_id = Column(String)
    season1 = Column(String, nullable=True)
    player2 = Column(String, nullable=False)
    player2_id = Column(String)
    season2 = Column(String, nullable=True)
    is_playoff = Column(Boolean, default=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
