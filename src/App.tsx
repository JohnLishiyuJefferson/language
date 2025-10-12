import JapaneseTalk from "./PracticePage.tsx";
import HistoryPage from "./HistoryPage.tsx";
import {useState} from "react";


function App() {
    const [currentPage, setCurrentPage] = useState('practice');

    return (
        <div>
            {currentPage === 'practice' ? (
                <JapaneseTalk onNavigateToHistory={() => setCurrentPage('history')} />
            ) : (
                <HistoryPage onNavigateToPractice={() => setCurrentPage('practice')} />
            )}
        </div>
    );
}

export default App;
