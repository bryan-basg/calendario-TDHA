from unittest.mock import MagicMock, patch

import pytest
from pywebpush import WebPushException

import schemas
from routers import notifications

# Mock cruds
notifications.crud = MagicMock()


def test_subscribe(client, db_session):
    # This test might need a real client setup or we can unit test the function directly
    # but since we have a client fixture, let's try to use it if we can override auth.
    pass


# Unit test for trigger_notification logic without full API overhead
def test_trigger_notification_logic():
    # Mock mocks
    mock_db = MagicMock()
    mock_user = MagicMock()
    mock_user.id = 1

    # Mock subscriptions
    sub1 = MagicMock()
    sub1.endpoint = "https://example.com/endpoint1"
    sub1.keys = '{"p256dh": "key1", "auth": "auth1"}'

    sub2 = MagicMock()
    sub2.endpoint = "https://example.com/endpoint2"
    sub2.keys = {"p256dh": "key2", "auth": "auth2"}  # Already dict

    notifications.crud.get_subscriptions.return_value = [sub1, sub2]

    # Mock webpush
    with patch("routers.notifications.webpush") as mock_webpush:
        # Success case
        result = notifications.trigger_notification(
            message="Hello", db=mock_db, current_user=mock_user
        )

        assert len(result["results"]) == 2
        assert result["results"][0]["status"] == "sent"
        assert result["results"][1]["status"] == "sent"
        assert mock_webpush.call_count == 2


def test_trigger_notification_webpush_exception():
    mock_db = MagicMock()
    mock_user = MagicMock()
    mock_user.id = 1

    sub = MagicMock()
    sub.endpoint = "https://fail.com"
    sub.keys = '{"p256dh": "k", "auth": "a"}'

    notifications.crud.get_subscriptions.return_value = [sub]

    with patch("routers.notifications.webpush") as mock_webpush:
        mock_webpush.side_effect = WebPushException("Push failed")

        result = notifications.trigger_notification(
            message="Fail", db=mock_db, current_user=mock_user
        )

        assert result["results"][0]["status"] == "failed"
        assert "Push failed" in result["results"][0]["error"]


def test_trigger_notification_no_subs():
    mock_db = MagicMock()
    mock_user = MagicMock()
    notifications.crud.get_subscriptions.return_value = []

    result = notifications.trigger_notification(
        message="Hi", db=mock_db, current_user=mock_user
    )
    assert result == {"message": "No subscriptions found for this user."}
