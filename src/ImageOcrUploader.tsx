import {useState} from "react";
import {Upload, Button, message, Typography, Spin, Col, Row, Divider} from "antd";
import {UploadOutlined} from "@ant-design/icons";
import {parsePicture, reviewComposition} from "./api.ts";

const {Text} = Typography;

interface Detail {
    sentence: string;
    spell: string;
    grammar: string;
    rewrite: string;
    rewrite_reason: string;
}

interface ReviewState {
    summary: {
        score: number;
        strength: string;
        weakness: string;
    },
    detail: Array<Detail>,
}

const ImageOcrUploader = () => {
    const [fileList, setFileList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [ocrText, setOcrText] = useState("");
    const [reviewState, setReviewState] = useState<ReviewState>({summary: undefined, detail: []});

    const handleUpload = async () => {
        if (fileList.length === 0) {
            message.warning("请先选择图片文件");
            return;
        }

        const formData = new FormData();
        formData.append("file", fileList[0]);

        setLoading(true);
        setOcrText("");

        try {
            const data = await parsePicture(formData);
            const reviewResult = await reviewComposition(data.text);
            setOcrText(data.text);
            setReviewState(reviewResult);
        } catch (error) {
            console.error(error);
            message.error("解析失败，请检查服务端是否已启动");
        } finally {
            setLoading(false);
        }
    };

    const uploadProps = {
        beforeUpload: (file) => {
            setFileList([file]);
            return false; // 阻止自动上传
        },
        onRemove: () => {
            setFileList([]);
        },
        fileList,
    };

    return (
        <div style={{margin: "0 5", padding: 5}}>
            <Row style={{width: "60%"}} gutter={5}>
                <Col span={3}>
                    <Upload {...uploadProps} accept="image/*" style={{}}>
                        <Button icon={<UploadOutlined/>}>选择图片</Button>
                    </Upload>
                </Col>
                <Col span={3}>
                    <Button
                        type="primary"
                        onClick={handleUpload}
                        disabled={fileList.length === 0}
                        loading={loading}
                        style={{}}
                    >
                        上传并解析
                    </Button>
                </Col>
            </Row>
            <div style={{marginTop: 5}}>
                {/*<Text strong>识别结果：</Text>*/}
                {loading ? (
                    <Spin style={{marginLeft: 0}}/>
                ) : (
                    <div>
                        <Divider/>
                        <Text style={{marginRight: 20}}>分数：{reviewState?.summary?.score}</Text>
                        <Text style={{marginRight: 20}}>亮点：{reviewState?.summary?.strength}</Text>
                        <Text style={{marginRight: 20}}>不足：{reviewState?.summary?.weakness}</Text>
                        {reviewState.detail?.map((item, index) => (
                            <Row key={index} gutter={[30, 12]}>
                                <Divider/>
                                <Col className="review" style={{fontSize: 20}} span={24}>{item.sentence}</Col>
                                <Col className="review" span={24}>拼写：{item.spell}</Col>
                                <Col className="review" span={24}>语法：{item.grammar}</Col>
                                <Col className="review" span={24}>改写：{item.rewrite}</Col>
                                <Col className="review" span={24}>改写理由：{item.rewrite_reason}</Col>
                            </Row>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
        ;
};

export default ImageOcrUploader;
