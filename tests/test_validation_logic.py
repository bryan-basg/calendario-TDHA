from datetime import datetime, timedelta

import pytest
from pydantic import ValidationError

from schemas import CategoryCreate, EnergyLevel, EventCreate, TaskCreate


# --- TEST CATEGORIES ---
def test_valid_category_color():
    # Valid hex codes
    c1 = CategoryCreate(name="Valid1", color_hex="#FFF")
    assert c1.color_hex == "#FFF"
    c2 = CategoryCreate(name="Valid2", color_hex="#000000")
    assert c2.color_hex == "#000000"
    c3 = CategoryCreate(name="Valid3", color_hex="#ABCDEF")
    assert c3.color_hex == "#ABCDEF"


def test_invalid_category_color():
    # Invalid formats
    invalid_colors = ["red", "#ZZZ", "123456", "#12345", "#1234567"]
    for color in invalid_colors:
        with pytest.raises(ValidationError) as excinfo:
            CategoryCreate(name="Invalid", color_hex=color)
        assert "Invalid hex color format" in str(excinfo.value)


# --- TEST EVENTS ---
def test_event_valid_dates():
    now = datetime.now()
    e = EventCreate(
        title="Valid Event",
        start_time=now,
        end_time=now + timedelta(hours=1),
        category_id=1,
    )
    assert e.end_time > e.start_time


def test_event_end_before_start():
    now = datetime.now()
    with pytest.raises(ValidationError) as excinfo:
        EventCreate(
            title="Invalid Event",
            start_time=now,
            end_time=now - timedelta(hours=1),
            category_id=1,
        )
    assert "end_time must be after start_time" in str(excinfo.value)


def test_event_equal_dates():
    # Depending on logic, equal might be allowed or not.
    # Usually events happen over time, but 0 duration might be valid.
    # Our validator uses < so equal is allowed unless we change to <=
    now = datetime.now()
    # Pydantic validator logic: if self.end_time < self.start_time
    # So equal should pass.
    e = EventCreate(title="Instant Event", start_time=now, end_time=now, category_id=1)
    assert e.start_time == e.end_time


# --- TEST TASKS ---
def test_task_valid_dates():
    now = datetime.now()
    t = TaskCreate(
        title="Valid Task",
        energy_required=EnergyLevel.medium,
        planned_start=now,
        planned_end=now + timedelta(hours=1),
    )
    assert t.planned_end > t.planned_start


def test_task_end_before_start():
    now = datetime.now()
    with pytest.raises(ValidationError) as excinfo:
        TaskCreate(
            title="Invalid Task",
            energy_required=EnergyLevel.medium,
            planned_start=now,
            planned_end=now - timedelta(hours=1),
        )
    assert "planned_end must be after planned_start" in str(excinfo.value)


def test_task_only_start():
    # Should be valid if only start is provided (optional fields)
    now = datetime.now()
    t = TaskCreate(
        title="Start Only", energy_required=EnergyLevel.low, planned_start=now
    )
    assert t.planned_start == now
    assert t.planned_end is None


def test_task_no_dates():
    t = TaskCreate(title="No Logic", energy_required=EnergyLevel.low)
    assert t.planned_start is None
    assert t.planned_end is None
