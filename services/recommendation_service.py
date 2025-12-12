from datetime import datetime, timedelta, timezone

from sqlalchemy import or_
from sqlalchemy.orm import Session

import models


def get_task_suggestions(db: Session, user_id: int, current_energy: models.EnergyLevel):
    """
    Algoritmo de Priorización TDAH Optimizado:
    Filtra en SQL para reducir carga en memoria.
    Criterios de inclusión SQL:
    1. Tareas pendientes.
    2. Tareas que vencen pronto (< 72h) O coinciden con la energía actual.

    Luego, puntúa en Python para el ordenamiento fino.
    """
    now = datetime.now(timezone.utc)
    limit_date = now + timedelta(hours=72)

    # Mapeo simple de energía para lógica de filtrado
    # Si high energy -> traer high y medium (o todas). Si low -> traer low.
    # Para simplificar y no complicar la query, traeremos:
    # - Tareas urgentes (deadline <= limit_date)
    # - Tareas que coinciden EXACTAMENTE con el nivel de energía
    # - Si el usuario tiene ALTA energía, también traemos tareas de MEDIA energía (pueden ser 'frogs' disfrazados)

    energy_filter = [models.Task.energy_required == current_energy]
    if current_energy == models.EnergyLevel.high:
        energy_filter.append(models.Task.energy_required == models.EnergyLevel.medium)

    tasks = (
        db.query(models.Task)
        .filter(
            models.Task.user_id == user_id,
            models.Task.status == models.TaskStatus.pending,
            or_(
                models.Task.deadline <= limit_date,  # Urgencia
                *energy_filter  # Match de energía
            ),
        )
        .all()
    )

    scored_tasks = []

    # Re-map para puntuación
    energy_map = {"low": 1, "medium": 2, "high": 3}
    user_energy_val = energy_map.get(current_energy.value, 2)

    for t in tasks:
        score = 0

        # A) Deadline Urgency
        if t.deadline:
            deadline = t.deadline
            if deadline.tzinfo is None:
                deadline = deadline.replace(tzinfo=timezone.utc)

            hours_left = (deadline - now).total_seconds() / 3600
            if hours_left < 24:
                score += 50  # ¡Súper urgente!
            elif hours_left < 72:
                score += 20

        # B) Energy Match
        task_energy_val = energy_map.get(t.energy_required.value, 2)

        if user_energy_val == 3:  # User High Energy
            if task_energy_val == 3:
                score += 30
            else:
                score += 10
        elif user_energy_val == 1:  # User Low Energy
            if task_energy_val == 1:
                score += 40
            elif task_energy_val == 3:
                score -= 20

        scored_tasks.append({"task": t, "score": score})

    # Ordenar por score descendente
    scored_tasks.sort(key=lambda x: x["score"], reverse=True)

    # Devolver las 5 mejores
    return [item["task"] for item in scored_tasks[:5]]
