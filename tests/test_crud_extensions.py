import json
from datetime import datetime, timezone

import pytest

import crud
import models
import schemas


@pytest.fixture
def test_user(db_session):
    user_in = schemas.UserCreate(email="test_sub@example.com", password="password123")
    return crud.create_user(db_session, user_in)


def test_subscription_management(db_session, test_user):
    # Create
    keys_json = json.dumps({"p256dh": "test_key", "auth": "test_auth"})
    sub_in = schemas.PushSubscriptionCreate(
        endpoint="https://fcm.googleapis.com/fcm/send/123", keys=keys_json
    )
    sub = crud.create_subscription(db_session, sub_in, test_user.id)
    assert sub.id is not None
    assert sub.user_id == test_user.id
    assert sub.endpoint == "https://fcm.googleapis.com/fcm/send/123"

    # Update (Create same endpoint)
    new_keys_json = json.dumps({"p256dh": "new_key", "auth": "new_auth"})
    sub_update_in = schemas.PushSubscriptionCreate(
        endpoint="https://fcm.googleapis.com/fcm/send/123", keys=new_keys_json
    )
    updated_sub = crud.create_subscription(db_session, sub_update_in, test_user.id)
    assert updated_sub.id == sub.id  # Should be same ID
    assert "new_key" in updated_sub.keys

    # Get Subscriptions
    subs = crud.get_subscriptions(db_session, test_user.id)
    assert len(subs) == 1
    assert subs[0].endpoint == sub.endpoint
