// @ts-ignore
import ProductivityTracker from '../components/ProductivityTracker';
// @ts-ignore
import DetailsModal from '../components/DetailsModal';
import SkeletonLoader from '../components/SkeletonLoader';
import './Dashboard.css';
import { Category, Task, TimelineItem } from '../types';

// Widgets & DnD
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableWidgetWrapper } from '../components/widgets/SortableWidgetWrapper';
import { TasksWidget } from '../components/widgets/TasksWidget';
import { EventsWidget } from '../components/widgets/EventsWidget';
import { CategoriesWidget } from '../components/widgets/CategoriesWidget';
import CalendarComponent from '../components/CalendarComponent';

// Interface for Calendar events
interface CalendarEvent extends Omit<TimelineItem, 'start' | 'end'> {
    start: Date;
    end: Date;
    resource?: any;
}

const Dashboard: React.FC = () => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // Widget Order State (Persistent)
    const [widgetOrder, setWidgetOrder] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('dashboard_widget_order');
            return saved ? JSON.parse(saved) : ['tasks', 'events', 'categories'];
        } catch {
            return ['tasks', 'events', 'categories'];
        }
    });

    const navigate = useNavigate();
    const { t } = useTranslation();

    // Calendar States
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [currentView, setCurrentView] = useState<string>('month');

    // Sensors for DnD
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Prevent accidental drags on click
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                let start: Date, end: Date;
                const now = new Date(currentDate);

                if (currentView === 'day') {
                    start = new Date(now.setHours(0, 0, 0, 0));
                    end = new Date(now.setHours(23, 59, 59, 999));
                } else if (currentView === 'week') {
                    const y = now.getFullYear();
                    const m = now.getMonth();
                    start = new Date(y, m, 1);
                    end = new Date(y, m + 1, 0, 23, 59, 59);
                    start.setDate(start.getDate() - 7);
                    end.setDate(end.getDate() + 7);
                } else if (currentView === 'agenda') {
                    start = new Date(now);
                    end = new Date(now);
                    end.setDate(end.getDate() + 30);
                } else {
                    const y = now.getFullYear();
                    const m = now.getMonth();
                    start = new Date(y, m, 1);
                    end = new Date(y, m + 1, 0, 23, 59, 59);
                    start.setDate(start.getDate() - 7);
                    end.setDate(end.getDate() + 7);
                }

                const [timelineData, tasksData, categoriesData] = await Promise.all([
                    getTimeline(start.toISOString(), end.toISOString()),
                    getTasks(),
                    getCategories()
                ]);

                const formattedEvents: CalendarEvent[] = timelineData.map((item: TimelineItem) => ({
                    ...item,
                    start: new Date(item.start),
                    end: new Date(item.end),
                    resource: item
                }));

                setEvents(formattedEvents);
                setTasks(tasksData);
                setCategories(categoriesData);

            } catch (err: any) {
                if (err.response?.status === 401) {
                    navigate('/login');
                } else {
                    console.error("Error cargando dashboard:", err);
                }
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [navigate, currentDate, currentView]);

    // Save order on change
    useEffect(() => {
        localStorage.setItem('dashboard_widget_order', JSON.stringify(widgetOrder));
    }, [widgetOrder]);

    const handleNavigate = (date: Date) => setCurrentDate(date);
    const handleViewChange = (view: string) => setCurrentView(view);

    const handleSelectEvent = (event: any) => {
        setSelectedItem(event);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    const handleEditItem = (item: any) => {
        const id = item.id;
        const type = item.type || (item.planned_start ? 'task' : 'event');
        let path = '';
        if (type === 'task') path = `/tasks/${id}/edit`;
        else if (type === 'event') path = `/events/${id}/edit`;
        else if (item.color_hex) path = `/categories/${id}/edit`;
        if (path) navigate(path);
    };

    const handleDeleteItem = async (_item: any) => {
        if (!window.confirm(t('common.confirm_delete', '¿Seguro que quieres eliminar esto?'))) return;
        window.location.reload();
    };

    const handleSelectSlot = ({ start, end }: { start: Date, end: Date }) => {
        navigate(`/events/new?start=${start.toISOString()}&end=${end.toISOString()}`);
    };

    // Drag End Handler
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setWidgetOrder((items) => {
                const oldIndex = items.indexOf(active.id as string);
                const newIndex = items.indexOf(over.id as string);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // Render helper
    const renderWidget = (id: string) => {
        switch (id) {
            case 'tasks':
                return (
                    <SortableWidgetWrapper key={id} id={id}>
                        <TasksWidget
                            tasks={tasks}
                            onNavigate={navigate}
                            onSelect={(t) => { setSelectedItem({ ...t, type: 'task' }); setIsModalOpen(true); }}
                        />
                    </SortableWidgetWrapper>
                );
            case 'events':
                return (
                    <SortableWidgetWrapper key={id} id={id}>
                        <EventsWidget
                            events={events} // Pass all events/timeline items
                            onNavigate={navigate}
                            onSelect={(e) => { setSelectedItem(e); setIsModalOpen(true); }}
                        />
                    </SortableWidgetWrapper>
                );
            case 'categories':
                return (
                    <SortableWidgetWrapper key={id} id={id}>
                        <CategoriesWidget
                            categories={categories}
                            onNavigate={navigate}
                            onSelect={(c) => { setSelectedItem({ ...c, color: c.color_hex }); setIsModalOpen(true); }}
                        />
                    </SortableWidgetWrapper>
                );
            default:
                return null;
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-grid">

                {/* Left Column: Calendar */}
                <div className="dashboard-calendar-section">
                    <ProductivityTracker />
                    {loading ? (
                        <SkeletonLoader type="calendar" />
                    ) : (
                        <CalendarComponent
                            events={events}
                            onSelectEvent={handleSelectEvent}
                            onSelectSlot={handleSelectSlot}
                            date={currentDate}
                            view={currentView}
                            onNavigate={handleNavigate}
                            onView={handleViewChange}
                        />
                    )}
                </div>

                {/* Right Column: Sortable Lists */}
                <div className="dashboard-lists-section">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={widgetOrder}
                            strategy={verticalListSortingStrategy}
                        >
                            {widgetOrder.map(id => renderWidget(id))}
                        </SortableContext>
                    </DndContext>
                </div>
            </div>

            <DetailsModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                item={selectedItem}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
            />
        </div>
    );
};

export default Dashboard;
