from pydantic import BaseModel
from typing import Optional, Any, Dict

class CompareRequest(BaseModel):
    player1: str
    player2: str
    season: Optional[str] = None        # if provided, applies to both players (simple v1)
    is_playoff: Optional[bool] = False

class PlayerStats(BaseModel):
    player_id: Optional[int]
    ppg: Optional[float]
    raw: Optional[Dict[str, Any]]

class CompareResponse(BaseModel):
    season: Optional[str]
    is_playoff: bool
    player1: PlayerStats
    player2: PlayerStats
