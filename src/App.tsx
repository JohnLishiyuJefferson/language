import {Row, Col} from "antd";
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
            <div style={{padding: 5, margin: 5, marginTop: 30, width: "100%"}}>

                {/*<Row gutter={16}>*/}
                    {/* 中间区域 */}
                    {/*<Col span={24}>*/}
                        <ImageOcrUploader />

                        {/*<AnalyzedText wordsPerPage={450}/>*/}
                    {/*</Col>*/}
                    {/*<Col span={9}>*/}
                    {/*    <AISpace/>*/}
                    {/*    <VideoPlayer />*/}
                    {/*</Col>*/}
                {/*</Row>*/}
            </div>
        </div>
    );
}

export default App;
