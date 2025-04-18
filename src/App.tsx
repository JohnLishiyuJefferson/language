import {Modal, Row, Col, Input, Button, List} from "antd";
import AnalyzedText from "./AnalyzedText.tsx";
import VocabularyList from "./VocabularyList.tsx";
import AISpace from "./AISpace.tsx";
import TextImportModal from "./TextImportModal.tsx";
import VideoPlayer from "./VideoPlayer.tsx";
import {useAuth} from "./AuthContext";
import {useNavigate} from "react-router-dom";
import ImageOcrUploader from "./ImageOcrUploader.tsx";

function App() {

    const {logout} = useAuth();
    const navigate = useNavigate();

    return (
        <div>
            <button onClick={() => {
                logout();
                navigate("/login");
            }} style={{position: "fixed", right: 5, top: 5}}>登出
            </button>
            <div style={{padding: 5, margin: 5, marginTop: 30}}>

                <Row gutter={16}>
                    {/* 中间区域 */}
                    <Col span={24}>
                        <ImageOcrUploader />
                        {/*<AnalyzedText wordsPerPage={450}/>*/}
                    </Col>
                    {/*<Col span={9}>*/}
                    {/*    <AISpace/>*/}
                    {/*    <VideoPlayer />*/}
                    {/*</Col>*/}
                </Row>
            </div>
        </div>
    );
}

export default App;
