from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.schemas.calculation import CalculationRequest
from app.services.calculation_service import CalculationService

router = APIRouter(prefix="/api", tags=["calculation"])

calculation_service = CalculationService()


@router.post("/calculate")
async def calculate(payload: CalculationRequest):
    try:
        return calculation_service.calculate(payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc