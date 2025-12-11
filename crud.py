from datetime import datetime, timedelta
from sqlalchemy.orm import Session, joinedload
# from passlib.context import CryptContext # Ya no se necesita aquí
import models
import schemas
from auth import get_password_hash
import holidays


# --- FUNCIONES DE SEGURIDAD ---
# (Las funciones de seguridad están centralizadas en auth.py)


# --- CATEGORÍAS (Categories) ---
def get_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Category).offset(skip).limit(limit).all()


def create_category(db: Session, category: schemas.CategoryCreate):
    db_category = models.Category(
        name=category.name,
        color_hex=category.color_hex
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def update_category(db: Session, category_id: int, category_update: schemas.CategoryUpdate):
    db_category = get_category(db, category_id)
    if not db_category:
        return None

    update_data = category_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_category, key, value)

    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def delete_category(db: Session, category_id: int):
    db_category = get_category(db, category_id)
    if not db_category:
        return None

    db.delete(db_category)
    db.commit()
    return db_category


def get_category(db: Session, category_id: int):
    return db.query(models.Category).filter(models.Category.id == category_id).first()


# --- USUARIOS (Users) ---
def get_user_by_email(db: Session, email: str):
    # Busca si ya existe un usuario con ese email
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def create_user(db: Session, user: schemas.UserCreate):
    # 1. Encriptamos la contraseña
    hashed_password = get_password_hash(user.password)
    # 2. Preparamos el modelo de base de datos
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    # 3. Lo agregamos a la sesión
    db.add(db_user)
    # 4. Guardamos los cambios (Commit)
    db.commit()
    # 5. Refrescamos para obtener el ID generado automáticamente
    db.refresh(db_user)
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None
    
    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# --- TAREAS (Tasks) ---
def get_tasks(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Task).filter(models.Task.user_id == user_id).offset(skip).limit(limit).all()


def create_user_task(db: Session, task: schemas.TaskCreate, user_id: int):
    # Convertimos el esquema de Pydantic a Modelo de DB
    db_task = models.Task(**task.model_dump(), user_id=user_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    db.refresh(db_task)
    return db_task


def get_task(db: Session, task_id: int):
    return db.query(models.Task).filter(models.Task.id == task_id).first()


def update_task(db: Session, task_id: int, task_update: schemas.TaskUpdate):
    db_task = get_task(db, task_id)
    if not db_task:
        return None

    update_data = task_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)

    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def delete_task(db: Session, task_id: int):
    db_task = get_task(db, task_id)
    if not db_task:
        return None

    db.delete(db_task)
    db.commit()
    return db_task


# --- TIME BLOCKING & VISTAS ---


def get_timeline(db: Session, user_id: int, date_start: datetime, date_end: datetime):
    # 1. Obtener Eventos
    events = db.query(models.Event).options(joinedload(models.Event.category)).filter(
        models.Event.user_id == user_id,
        models.Event.start_time >= date_start,
        models.Event.start_time <= date_end
    ).all()

    # 2. Obtener Tareas "Agendadas" (Time Blocking)
    tasks = db.query(models.Task).filter(
        models.Task.user_id == user_id,
        models.Task.planned_start >= date_start,
        models.Task.planned_start <= date_end
    ).all()

    # 3. Unificar
    timeline = []

    for e in events:
        timeline.append({
            "id": e.id,
            "title": e.title,
            "start": e.start_time,
            "end": e.end_time,
            "type": "event",
            "color": e.category.color_hex if e.category else "#ccc",
            "is_completed": False
        })

    for t in tasks:
        # Si no tiene planned_end, asumimos 30 mins
        end_time = t.planned_end if t.planned_end else t.planned_start + timedelta(minutes=30)
        timeline.append({
            "id": t.id,
            "title": t.title,
            "start": t.planned_start,
            "end": end_time,
            "type": "task",
            "color": "#ff9f43",  # Orange for tasks
            "is_completed": t.is_completed
        })

    # 4. Obtener Festivos del País
    # El usuario debe tener un 'country' configurado. Por defecto es US si no existe.
    # Necesitamos cargar el usuario primero para saber su pais, pero la funcion solo recibe user_id.
    user = get_user_by_id(db, user_id)
    country_code = user.country if user and hasattr(user, 'country') else "US"
    
    # Validar si el país está soportado por la librería holidays, si no, fallback a US
    try:
        user_holidays = holidays.country_holidays(country_code)
    except Exception:
        user_holidays = holidays.US()

    # Iterar sobre los dias en el rango
    # holidays library permite verificar 'date in holidays'
    # Generamos los dias entre date_start y date_end
    current_itr = date_start.date()
    end_date_date = date_end.date()
    
    while current_itr <= end_date_date:
        if current_itr in user_holidays:
            holiday_name = user_holidays.get(current_itr)
            # Crear evento de todo el día para el festivo
            # Usar ID negativo para evitar colisión con DB IDs (hack simple)
            # Ojo: Start debe ser datetime
            h_start = datetime.combine(current_itr, datetime.min.time())
            h_end = datetime.combine(current_itr, datetime.max.time())
            
            timeline.append({
                "id": -1 * int(current_itr.strftime("%Y%m%d")), # Pseudo ID único por fecha
                "title": f"🎉 {holiday_name}",
                "start": h_start,
                "end": h_end,
                "type": "holiday",
                "color": "#e91e63", # Pink/Magenta for holidays
                "is_completed": False
            })
        current_itr += timedelta(days=1)

    # 5. Ordenar por hora de inicio
    timeline.sort(key=lambda x: x["start"])
    return timeline


def get_now_view(db: Session, user_id: int, current_time: datetime):
    # Obtener todo lo de hoy
    start_of_day = current_time.replace(hour=0, minute=0, second=0)
    end_of_day = current_time.replace(hour=23, minute=59, second=59)

    full_timeline = get_timeline(db, user_id, start_of_day, end_of_day)

    current_item = None
    next_item = None

    # Buscar ítem actual y siguiente
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


def get_task_suggestions(db: Session, user_id: int, current_energy: models.EnergyLevel):
    """
    Algoritmo de Priorización TDAH:
    1. Urgencia (Deadline): +++ si vence hoy/mañana.
    2. Energía:
       - Si tienes HIGH energy: Priorizar cosas difíciles (Eat the frog).
       - Si tienes LOW energy: Priorizar cosas fáciles (Quick wins).
    """
    tasks = db.query(models.Task).filter(
        models.Task.user_id == user_id,
        models.Task.status == models.TaskStatus.pending
    ).all()

    scored_tasks = []
    now = datetime.now()

    for t in tasks:
        score = 0

        # A) Deadline Urgency
        if t.deadline:
            hours_left = (t.deadline - now).total_seconds() / 3600
            if hours_left < 24:
                score += 50  # ¡Súper urgente!
            elif hours_left < 72:
                score += 20

        # B) Energy Match
        # Convert energy enum to int for comparison if needed, or simple mapping
        # Low=1, Medium=2, High=3
        energy_map = {"low": 1, "medium": 2, "high": 3}
        task_energy_val = energy_map.get(t.energy_required.value, 2)
        user_energy_val = energy_map.get(current_energy.value, 2)

        if user_energy_val == 3:  # User High Energy
            if task_energy_val == 3:
                score += 30  # Aprovecha para hacer lo difícil
            else:
                score += 10  # Haz lo que quieras

        elif user_energy_val == 1:  # User Low Energy
            if task_energy_val == 1:
                score += 40  # ¡Solo cosas fáciles por favor!
            elif task_energy_val == 3:
                score -= 20  # Evitar hard tasks si estoy cansado

        scored_tasks.append({"task": t, "score": score})

    # Ordenar por score descendente
    scored_tasks.sort(key=lambda x: x["score"], reverse=True)

    # Devolver las 5 mejores
    return [item["task"] for item in scored_tasks[:5]]


# --- EVENTOS (Events) ---
def get_events(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Event).filter(models.Event.user_id == user_id).offset(skip).limit(limit).all()


def create_user_event(db: Session, event: schemas.EventCreate, user_id: int):
    db_event = models.Event(**event.model_dump(), user_id=user_id)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    db.refresh(db_event)
    return db_event


def get_event(db: Session, event_id: int):
    return db.query(models.Event).filter(models.Event.id == event_id).first()


def update_event(db: Session, event_id: int, event_update: schemas.EventUpdate):
    db_event = get_event(db, event_id)
    if not db_event:
        return None

    update_data = event_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_event, key, value)

    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


def delete_event(db: Session, event_id: int):
    db_event = get_event(db, event_id)
    if not db_event:
        return None

    db.delete(db_event)
    db.commit()
    return db_event

