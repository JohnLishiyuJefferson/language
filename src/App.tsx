import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import TranslationPracticePage from "./TranslationPracticePage.tsx";
import TranslationHistoryPage from "./TranslationHistoryPage.tsx";
import { ListeningListPage } from "./ListeningListPage.tsx";
import { ListeningDetailPage } from "./ListeningDetailPage.tsx";
import RagSearchPage from "./RagSearchPage.tsx";
import { MyNotesPage } from "./MyNotesPage.tsx";
import { ArticleManagementPage } from "./ArticleManagementPage.tsx";
import { ArticleDetailPage } from "./ArticleDetailPage.tsx";

function App() {
    return (
        <BrowserRouter>
            <div>
                {/* 顶部导航 */}
                <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
                    <Link to="/practice" style={{ marginRight: 20 }}>造句练习</Link>
                    <Link to="/listening" style={{ marginRight: 20 }}>听力练习</Link>
                    <Link to="/rag" style={{ marginRight: 20 }}>智能问答</Link>
                    <Link to="/notes" style={{ marginRight: 20 }}>我的笔记</Link>
                    <Link to="/articles" style={{ marginRight: 20 }}>读物管理</Link>
                </nav>

                {/* 路由声明 */}
                <Routes>
                    {/* 造句系统 */}
                    <Route path="/practice" element={<TranslationPracticePage />} />
                    <Route path="/practice/history" element={<TranslationHistoryPage />} />

                    {/* 听力系统 */}
                    <Route path="/listening" element={<ListeningListPage />} />
                    <Route path="/listening/:taskId" element={<ListeningDetailPage />} />

                    {/* RAG 搜索 */}
                    <Route path="/rag" element={<RagSearchPage />} />

                    {/* My Notes */}
                    <Route path="/notes" element={<MyNotesPage />} />

                    {/* Article Management */}
                    <Route path="/articles" element={<ArticleManagementPage />} />
                    <Route path="/articles/:articleId" element={<ArticleDetailPage />} />

                    {/* 默认跳到 /practice */}
                    <Route path="*" element={<TranslationPracticePage />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
