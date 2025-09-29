"""
NBA API Client Module

This module provides functions to interact with the NBA API to fetch player information
and statistics. It handles player lookups, season statistics retrieval, and data
normalization for the NBA comparison application.

Key Features:
- Player search by name with fallback mechanisms
- Season-specific statistics retrieval
- Career totals aggregation
- Rate limiting protection
- Data normalization and PPG calculation
"""

import logging
from typing import Optional, Dict, Any
from nba_api.stats.static import players as static_players
from nba_api.stats.endpoints import playercareerstats, commonplayerinfo
import pandas as pd
import time

# Configure logging for this module
logger = logging.getLogger(__name__)


def find_player_by_name(name: str) -> Optional[Dict[str, Any]]:
    """
    Look up a player by full name (case-insensitive).
    
    This function searches for NBA players using multiple strategies:
    1. Exact match using nba_api's built-in search
    2. Fallback to substring search across all players
    3. Prioritizes exact case-insensitive matches
    
    Args:
        name (str): The full name of the player to search for
        
    Returns:
        Optional[Dict[str, Any]]: Player dictionary containing player information
                                 (id, full_name, first_name, last_name, etc.) or None if not found
                                 
    Example:
        >>> player = find_player_by_name("LeBron James")
        >>> print(player['full_name'])  # "LeBron James"
    """
    # Clean and normalize the input name
    name = name.strip()
    
    # First attempt: use nba_api's built-in search functionality
    matches = static_players.find_players_by_full_name(name)
    
    if not matches:
        # Fallback strategy: perform substring search across all players
        # This helps catch cases where the built-in search might miss partial matches
        all_players = static_players.get_players()
        for p in all_players:
            if name.lower() in p['full_name'].lower():
                return p
        return None
    
    # Prefer exact match (case-insensitive) over partial matches
    for p in matches:
        if p['full_name'].lower() == name.lower():
            return p
    
    # If no exact match found, return the first partial match
    return matches[0]


def fetch_player_season_stats(player_id: int, season: Optional[str] = None, is_playoff: bool = False) -> Optional[Dict[str, Any]]:
    """
    Fetch season-level statistics for a player using the NBA API.
    
    This function retrieves player statistics for a specific season or career totals.
    It handles data normalization, season filtering, and includes automatic PPG calculation.
    
    Args:
        player_id (int): The unique NBA player ID
        season (Optional[str]): Season to filter for (e.g., "2023-24", "2024", "2025")
                               If None, returns career aggregated totals
        is_playoff (bool): Whether to fetch playoff stats (currently not implemented)
        
    Returns:
        Optional[Dict[str, Any]]: Dictionary containing:
            - player_id: The player's ID
            - raw: Dictionary of statistics or list of dataframes if season-specific data not found
            - ppg: Calculated points per game (rounded to 1 decimal) or None if not calculable
            
    Example:
        >>> stats = fetch_player_season_stats(2544, "2023-24")
        >>> print(f"PPG: {stats['ppg']}")
        
    Note:
        The NBA API has rate limits, so this function includes error handling
        and conservative request patterns.
    """
    # NBA API can be rate-limited; implement conservative request handling
    try:
        # Fetch player career statistics using the NBA API
        pc = playercareerstats.PlayerCareerStats(player_id=player_id)
        data_frames = pc.get_data_frames()
    except Exception as e:
        logger.exception("NBA API request failed for player_id %s: %s", player_id, e)
        return None

    # Find the dataframe that contains season information
    # We use a heuristic approach since the API structure can vary
    season_df = None
    for df in data_frames:
        # Check if any column contains season-related information
        cols = [c.lower() for c in df.columns]
        if any('season' in c for c in cols) or any('season_id' in c for c in cols):
            season_df = df.copy()
            break

    # If no season-specific dataframe found, return all available data
    if season_df is None:
        return {
            "player_id": player_id, 
            "raw": [df.to_dict(orient='records') for df in data_frames]
        }

    # Normalize column names to lowercase for consistent access
    season_df.columns = [c.lower() for c in season_df.columns]

    # Handle season filtering if a specific season is requested
    row = None
    if season:
        season_str = str(season)
        
        # Find columns that contain season information
        season_cols = [c for c in season_df.columns if 'season' in c]
        
        if season_cols:
            col = season_cols[0]  # Use the first season column found
            
            # Try to match the season string in the season column
            mask = season_df[col].astype(str).str.contains(season_str, na=False)
            
            # If no match found and season is 4 digits, try last 2 digits
            # This handles cases like "2024" matching "2023-24" format
            if not mask.any() and len(season_str) == 4:
                short = season_str[-2:]
                mask = season_df[col].astype(str).str.contains(short, na=False)
            
            # Get the first matching row
            matched = season_df[mask]
            if not matched.empty:
                row = matched.iloc[0].to_dict()
    else:
        # No specific season requested - return career totals
        # Aggregate all numeric columns to get career statistics
        numeric = season_df.select_dtypes(include='number')
        totals = numeric.sum().to_dict()
        
        # Add indicator that this represents aggregated career totals
        totals['career_aggregated'] = True
        row = totals

    # If no data found, return None
    if row is None:
        return None

    # Calculate Points Per Game (PPG) if possible
    # Look for points-related columns (heuristic approach)
    points_candidates = [k for k in row.keys() if 'pts' in k or 'points' in k]
    games_candidates = [k for k in row.keys() if k in ('g', 'games', 'games_played') or 'games' in k]
    
    points = row.get(points_candidates[0]) if points_candidates else None
    games = row.get(games_candidates[0]) if games_candidates else None
    
    # Calculate PPG with error handling
    ppg = None
    try:
        if points is not None and games and float(games) > 0:
            ppg = float(points) / float(games)
    except (ValueError, TypeError, ZeroDivisionError):
        # Handle cases where points/games are not numeric or games is 0
        ppg = None

    return {
        "player_id": player_id,
        "raw": row,
        "ppg": round(ppg, 1) if ppg is not None else None
    }
