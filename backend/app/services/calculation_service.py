from __future__ import annotations

from app.schemas.calculation import CalculationRequest, CalculationResponse


class CalculationService:
    def calculate(self, payload: CalculationRequest) -> CalculationResponse:
        if payload.dose <= 0:
            raise ValueError("Dose must be greater than 0")
        if payload.beverageWeight <= 0:
            raise ValueError("Beverage weight must be greater than 0")
        if payload.tds < 0:
            raise ValueError("TDS cannot be negative")

        extraction = round((payload.beverageWeight * payload.tds) / payload.dose, 2)
        status = "within_spec" if 18 <= extraction <= 22 else "out_of_limits"

        return CalculationResponse(
            extraction=extraction,
            status=status,
        )