import logging
from fastapi import FastAPI, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List
import uvicorn

from . import nba_client
from .database import SessionLocal, engine, Base
from . import models
from .schemas import CompareRequest, CompareResponse, PlayerStats
from datetime import datetime

# create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="NBA Player Comparison API")
logger = logging.getLogger("uvicorn.error")

# DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/compare", response_model=CompareResponse)
def compare(req: CompareRequest, db: Session = Depends(get_db)):
    # lookup players
    p1 = nba_client.find_player_by_name(req.player1)
    if not p1:
        raise HTTPException(status_code=404, detail=f"Player not found: {req.player1}")
    p2 = nba_client.find_player_by_name(req.player2)
    if not p2:
        raise HTTPException(status_code=404, detail=f"Player not found: {req.player2}")

    # fetch stats
    stats1 = nba_client.fetch_player_season_stats(p1["id"], season=req.season, is_playoff=req.is_playoff)
    stats2 = nba_client.fetch_player_season_stats(p2["id"], season=req.season, is_playoff=req.is_playoff)
    if stats1 is None:
        raise HTTPException(status_code=502, detail=f"Could not fetch stats for player: {p1['full_name']}")
    if stats2 is None:
        raise HTTPException(status_code=502, detail=f"Could not fetch stats for player: {p2['full_name']}")

    # store history (both seasons same field for v1)
    comp = models.Comparison(
        player1=p1['full_name'],
        player1_id=str(p1['id']),
        season1=str(req.season) if req.season else None,
        player2=p2['full_name'],
        player2_id=str(p2['id']),
        season2=str(req.season) if req.season else None,
        is_playoff=bool(req.is_playoff)
    )
    db.add(comp)
    db.commit()
    db.refresh(comp)

    response = CompareResponse(
        season=req.season,
        is_playoff=req.is_playoff,
        player1=PlayerStats(player_id=p1['id'], ppg=stats1.get('ppg'), raw=stats1.get('raw')),
        player2=PlayerStats(player_id=p2['id'], ppg=stats2.get('ppg'), raw=stats2.get('raw'))
    )
    return response

@app.get("/history")
def history(limit: int = Query(20, ge=1, le=200), db: Session = Depends(get_db)):
    rows = db.query(models.Comparison).order_by(models.Comparison.timestamp.desc()).limit(limit).all()
    result = []
    for r in rows:
        result.append({
            "id": r.id,
            "player1": r.player1,
            "player2": r.player2,
            "season1": r.season1,
            "season2": r.season2,
            "is_playoff": r.is_playoff,
            "timestamp": r.timestamp.isoformat() if r.timestamp else None
        })
    return {"count": len(result), "results": result}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
