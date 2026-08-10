from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.report_service import ReportService

router = APIRouter(
    prefix="/api/v1/report",
    tags=["Report"]
)


@router.get("/{candidate_id}")
def generate_report(
    candidate_id: int,
    db: Session = Depends(get_db)
):

    service = ReportService()

    report = service.generate_report(
        db=db,
        candidate_id=candidate_id
    )

    if "error" in report:
        raise HTTPException(status_code=404, detail=report["error"])

    return report