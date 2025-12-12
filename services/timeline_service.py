from datetime import datetime, timedelta, timezone

import holidays
from sqlalchemy.orm import Session, joinedload

import crud
import models


def ensure_utc(dt: datetime):
    if dt and dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def get_timeline(
    db: Session,
    user_id: int,
    date_start: datetime,
    date_end: datetime,
    skip: int = 0,
    limit: int = 50,
):
    """
    Obtiene el timeline del usuario con eventos, tareas y festivos.
    Soporta paginación real filtrando por fecha y luego aplicando skip/limit.
    """
    # Calculamos un buffer seguro para DB queries
    # Necesitamos traer suficientes items de CADA fuente para garantizar que tras el merge
    # el slice [skip : skip + limit] sea correcto.
    # Peor caso: Todos los items son de un solo tipo.
    # Por tanto, traemos (skip + limit) de cada uno.
    fetch_limit = skip + limit

    # 1. Obtener Eventos
    events = (
        db.query(models.Event)
        .options(joinedload(models.Event.category))
        .filter(
            models.Event.user_id == user_id,
            models.Event.start_time >= date_start,
            models.Event.start_time <= date_end,
        )
        .limit(fetch_limit)
        .all()
    )

    # 2. Obtener Tareas "Agendadas"
    tasks = (
        db.query(models.Task)
        .filter(
            models.Task.user_id == user_id,
            models.Task.planned_start >= date_start,
            models.Task.planned_start <= date_end,
        )
        .limit(fetch_limit)
        .all()
    )

    # 3. Unificar
    timeline = []

    for e in events:
        timeline.append(
            {
                "id": e.id,
                "title": e.title,
                "start": ensure_utc(e.start_time),
                "end": ensure_utc(e.end_time),
                "type": "event",
                "color": e.category.color_hex if e.category else "#ccc",
                "is_completed": False,
            }
        )

    for t in tasks:
        # Si no tiene planned_end, asumimos 30 mins
        end_time = (
            t.planned_end if t.planned_end else t.planned_start + timedelta(minutes=30)
        )
        timeline.append(
            {
                "id": t.id,
                "title": t.title,
                "start": ensure_utc(t.planned_start),
                "end": ensure_utc(end_time),
                "type": "task",
                "color": "#ff9f43",  # Orange for tasks
                "is_completed": t.is_completed,
            }
        )

    # 4. Obtener Festivos del País (Solo si estamos en la primera "página" o el rango es pequeño)
    # Para simplificar la paginación con festivos (que son generados, no de BD),
    # los generamos siempre en el rango, pero solo se mostrarán si caen en el slice final.
    # Esto es barato computacionalmente.

    user = crud.get_user_by_id(db, user_id)
    country_code = user.country if user and hasattr(user, "country") else "US"

    try:
        user_holidays = holidays.country_holidays(country_code)
    except Exception:
        user_holidays = holidays.US()

    current_itr = date_start.date()
    end_date_date = date_end.date()

    while current_itr <= end_date_date:
        if current_itr in user_holidays:
            holiday_name = user_holidays.get(current_itr)
            h_start = datetime.combine(current_itr, datetime.min.time()).replace(
                tzinfo=timezone.utc
            )
            h_end = datetime.combine(current_itr, datetime.max.time()).replace(
                tzinfo=timezone.utc
            )

            timeline.append(
                {
                    "id": -1 * int(current_itr.strftime("%Y%m%d")),
                    "title": f"🎉 {holiday_name}",
                    "start": h_start,
                    "end": h_end,
                    "type": "holiday",
                    "color": "#e91e63",
                    "is_completed": False,
                }
            )
        current_itr += timedelta(days=1)

    # 5. Ordenar por hora de inicio
    timeline.sort(key=lambda x: x["start"])

    # 6. Aplicar Paginación (Slice)
    # [start : end]
    # Si skip > len, devuelve []
    paginated_timeline = timeline[skip : skip + limit]

    return paginated_timeline


def get_now_view(db: Session, user_id: int, current_time: datetime):
    # Obtener todo lo de hoy
    start_of_day = current_time.replace(hour=0, minute=0, second=0)
    end_of_day = current_time.replace(hour=23, minute=59, second=59)

    full_timeline = get_timeline(db, user_id, start_of_day, end_of_day)

    current_item = None
    next_item = None

    # Buscar ítem actual y siguiente
    # Aseguramos que current_time tenga timezone si full_timeline tiene items con timezone
    if (
        full_timeline
        and full_timeline[0]["start"].tzinfo
        and current_time.tzinfo is None
    ):
        current_time = current_time.replace(tzinfo=timezone.utc)

    pending_items = [i for i in full_timeline if i["end"] > current_time]

    if pending_items:
        # El primero que encontremos que termina en el futuro
        # Verificamos si ya empezó
        candidate = pending_items[0]
        if candidate["start"] <= current_time:
            current_item = candidate
            if len(pending_items) > 1:
                next_item = pending_items[1]
        else:
            # Nada ocurriendo ahora mismo, el primero es el "siguiente"
            next_item = candidate

    return {"current": current_item, "next": next_item}
