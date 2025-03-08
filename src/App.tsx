import {Modal, Row, Col, Input, Button} from "antd";
import AnalyzedText from "./AnalyzedText.tsx";
import VocabularyList from "./VocabularyList.tsx";
import AISpace from "./AISpace.tsx";
import TextImportModal from "./TextImportModal.tsx";
import AudioPlayer from "./AudioPlayer.tsx";
import VideoPlayer from "./VideoPlayer.tsx";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

function App() {

    const { logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div style={{padding: 20, marginLeft: 20}}>
            <button onClick={() => { logout(); navigate("/login"); }}>登出</button>
            <Row gutter={16}>
                <Col span={5}>
                    <TextImportModal/>
                    <VocabularyList/>
                    {/*<List*/}
                    {/*    style={{marginTop: 20, width: 200}}*/}
                    {/*    bordered*/}
                    {/*    dataSource={processedList}*/}
                    {/*    renderItem={(item) => (*/}
                    {/*        <List.Item>*/}
                    {/*            <strong>{item.word}</strong> ({item.kana})*/}
                    {/*            <p>{item.structure_list.map(item => item.explanation).join(" ")}</p>*/}
                    {/*        </List.Item>*/}
                    {/*    )}*/}
                    {/*/>*/}
                </Col>
                {/* 右边区域 */}
                <Col span={10}>
                    <AnalyzedText wordsPerPage={450}/>
                </Col>
                <Col span={9}>
                    <AISpace/>
                    <AudioPlayer />
                    <VideoPlayer />
                </Col>
            </Row>
        </div>
    );
}

export default App;
