from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

import models
import schemas
from database import get_db
from routers.auth_routes import get_current_user

router = APIRouter(
    prefix="/focus",
    tags=["focus"],
    responses={404: {"description": "Not found"}},
)


@router.post("/start", response_model=schemas.FocusSession)
def start_focus_session(
    session_in: schemas.FocusSessionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Check if there is already an active session?
    # For now, let's assume we can only have one active session.
    active_session = (
        db.query(models.FocusSession)
        .filter(
            models.FocusSession.user_id == current_user.id,
            models.FocusSession.status == "active",
        )
        .first()
    )

    if active_session:
        # Option: Close it or return it?
        # Let's return error to generic "Finish previous session first"
        raise HTTPException(
            status_code=400,
            detail="You already have an active focus session. Please finish it first.",
        )

    new_session = models.FocusSession(
        user_id=current_user.id,
        task_id=session_in.task_id,
        start_time=datetime.now(timezone.utc),
        status="active",
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session


@router.get("/current", response_model=schemas.FocusSession)
def get_current_focus_session(
    db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)
):
    """
    Obtiene la sesión de focus activa del usuario.
    Usa joinedload para cargar la tarea asociada si existe.
    """
    active_session = (
        db.query(models.FocusSession)
        .options(joinedload(models.FocusSession.task))
        .filter(
            models.FocusSession.user_id == current_user.id,
            models.FocusSession.status != "completed",
        )
        .first()
    )

    if not active_session:
        raise HTTPException(status_code=404, detail="No active session found")

    return active_session


@router.post("/{session_id}/stop", response_model=schemas.FocusSession)
def stop_focus_session(
    session_id: int,
    feedback_score: int = None,  # 1-5
    complete_task: bool = False,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    session = (
        db.query(models.FocusSession)
        .filter(
            models.FocusSession.id == session_id,
            models.FocusSession.user_id == current_user.id,
        )
        .first()
    )

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.status == "completed":
        return session  # Already done

    now = datetime.now(timezone.utc)
    session.end_time = now
    session.status = "completed"
    if feedback_score:
        session.feedback_score = feedback_score

    # Calculate duration
    # Note: start_time in DB might be different timezone awareness depending on DB setup (SQLite vs Postgres)
    # Ensure both are aware or naive.
    # models.py uses DateTime(timezone=True), so we should get aware datetimes.

    # Simple check for duration
    if session.start_time:
        # ensure compatibility
        start = session.start_time
        if start.tzinfo is None:
            # fallback if db returned naive, assume it was saved as UTC
            start = start.replace(tzinfo=timezone.utc)

        delta = now - start
        minutes = int(delta.total_seconds() / 60)
        session.duration_minutes = minutes

    # Mark task as completed if requested
    if complete_task and session.task_id:
        task = db.query(models.Task).filter(models.Task.id == session.task_id).first()
        if task:
            task.is_completed = True
            task.status = models.TaskStatus.completed

    db.commit()
    db.refresh(session)
    return session


@router.post("/{session_id}/pause", response_model=schemas.FocusSession)
def pause_focus_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    session = (
        db.query(models.FocusSession)
        .filter(
            models.FocusSession.id == session_id,
            models.FocusSession.user_id == current_user.id,
        )
        .first()
    )

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.status = "paused"
    db.commit()
    db.refresh(session)
    return session


@router.post("/{session_id}/resume", response_model=schemas.FocusSession)
def resume_focus_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    session = (
        db.query(models.FocusSession)
        .filter(
            models.FocusSession.id == session_id,
            models.FocusSession.user_id == current_user.id,
        )
        .first()
    )

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.status = "active"
    # Note: We are not adjusting start_time, which means 'duration' will include pause time if we just subtract end - start.
    # For a simple MVP, this is acceptable, but ideally we track "paused_duration".
    # Let's keep it simple for now as requested.
    db.commit()
    db.refresh(session)
    return session


@router.post("/{session_id}/interruption", response_model=schemas.FocusSession)
def log_interruption(
    session_id: int,
    note: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    session = (
        db.query(models.FocusSession)
        .filter(
            models.FocusSession.id == session_id,
            models.FocusSession.user_id == current_user.id,
        )
        .first()
    )

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.interruptions += 1
    if note:
        # Append note?
        if session.interruption_notes:
            session.interruption_notes += f"; {note}"
        else:
            session.interruption_notes = note

    db.commit()
    db.refresh(session)
    return session


@router.get("/stats", response_model=schemas.FocusStats)
def get_focus_stats(
    db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)
):
    """
    Obtiene estadísticas de las sesiones de focus del usuario.
    Usa joinedload para cargar tareas asociadas si existen.
    """
    user_sessions = (
        db.query(models.FocusSession)
        .options(joinedload(models.FocusSession.task))
        .filter(models.FocusSession.user_id == current_user.id)
        .all()
    )

    total_sessions = len(user_sessions)
    total_minutes = sum([s.duration_minutes for s in user_sessions])
    total_interruptions = sum([s.interruptions for s in user_sessions])

    # filter sessions with feedback
    rated_sessions = [
        s.feedback_score for s in user_sessions if s.feedback_score is not None
    ]
    avg_score = sum(rated_sessions) / len(rated_sessions) if rated_sessions else 0.0

    return schemas.FocusStats(
        total_sessions=total_sessions,
        total_minutes=total_minutes,
        avg_score=avg_score,
        total_interruptions=total_interruptions,
    )
