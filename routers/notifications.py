import json
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from pywebpush import WebPushException, webpush
from sqlalchemy.orm import Session

import crud
import models
import schemas
from database import get_db
from dependencies import get_current_user

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"],
    responses={404: {"description": "Not found"}},
)

# --- CONFIGURACIÓN VAPID (PENDIENTE) ---
# En un entorno real, estas claves deben estar en variables de entorno o .env
# Generar claves: pywebpush.vapid.generate_vapid_keys()
# Por ahora usaremos placeholders o requeriremos que el usuario las provea en env
VAPID_PRIVATE_KEY = "PENDING_GENERATION"
VAPID_CLAIMS = {"sub": "mailto:admin@example.com"}


@router.post("/subscribe", response_model=schemas.PushSubscription)
def subscribe(
    subscription: schemas.PushSubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Registra u actualiza una suscripción Push (token del dispositivo).
    """
    return crud.create_subscription(
        db=db, subscription=subscription, user_id=current_user.id
    )


@router.post("/trigger")
def trigger_notification(
    message: str = "Test Notification from TDAH Calendar",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    (Test) Envía una notificación a todos los dispositivos del usuario actual.
    """
    subscriptions = crud.get_subscriptions(db, user_id=current_user.id)

    if not subscriptions:
        return {"message": "No subscriptions found for this user."}

    results = []

    # Payload simple string o JSON
    payload = json.dumps({"title": "Recordatorio", "body": message})

    for sub in subscriptions:
        try:
            # Parse keys stored as JSON string
            if isinstance(sub.keys, str):
                keys = json.loads(sub.keys)
            else:
                keys = sub.keys

            subscription_info = {"endpoint": sub.endpoint, "keys": keys}

            # Si no tenemos VAPID configurado, esto fallará con un error específico
            # Pero permite validar que el endpoint existe
            try:
                webpush(
                    subscription_info=subscription_info,
                    data=payload,
                    vapid_private_key=VAPID_PRIVATE_KEY
                    if VAPID_PRIVATE_KEY != "PENDING_GENERATION"
                    else None,
                    vapid_claims=VAPID_CLAIMS,
                )
                results.append({"endpoint": sub.endpoint, "status": "sent"})
            except WebPushException as ex:
                results.append(
                    {"endpoint": sub.endpoint, "status": "failed", "error": str(ex)}
                )
            except Exception as e:
                # Probablemente VAPID missing
                results.append(
                    {
                        "endpoint": sub.endpoint,
                        "status": "failed",
                        "error": f"VAPID Error or other: {e}",
                    }
                )

        except Exception as e:
            results.append(
                {
                    "endpoint": sub.endpoint,
                    "status": "error_parsing_keys",
                    "error": str(e),
                }
            )

    return {"results": results}
