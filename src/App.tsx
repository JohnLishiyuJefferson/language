import JapaneseTalk from "./PracticePage.tsx";
import HistoryPage from "./HistoryPage.tsx";
import {useState} from "react";
import {TaskListPage} from "./TaskListPage.tsx";
import {TaskDetailPage} from "./TaskDetailPage.tsx";


function App() {
    const [currentPage, setCurrentPage] = useState('practice');
    const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
    const [selectedTaskId, setSelectedTaskId] = useState<string>('');

    const handleViewTask = (taskId: string) => {
        setSelectedTaskId(taskId);
        setCurrentView('detail');
    };

    const handleBackToList = () => {
        setCurrentView('list');
        setSelectedTaskId('');
    };


    return (
        <div>
            {currentView === 'list' ? (
                <TaskListPage onViewTask={handleViewTask} />
            ) : (
                <TaskDetailPage taskId={selectedTaskId} onBack={handleBackToList} />
            )}
            {/*{currentPage === 'practice' ? (*/}
            {/*    <JapaneseTalk onNavigateToHistory={() => setCurrentPage('history')} />*/}
            {/*) : (*/}
            {/*    <HistoryPage onNavigateToPractice={() => setCurrentPage('practice')} />*/}
            {/*)}*/}
        </div>
    );
}

export default App;
