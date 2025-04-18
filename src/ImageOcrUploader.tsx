import { useState } from "react";
import { Upload, Button, message, Typography, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import {parsePicture} from "./api.ts";

const { Text, Paragraph } = Typography;

const ImageOcrUploader = () => {
    const [fileList, setFileList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [ocrText, setOcrText] = useState("");

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
            setOcrText(data.text);
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
        <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
            <Upload {...uploadProps} accept="image/*">
                <Button icon={<UploadOutlined />}>选择图片</Button>
            </Upload>
            <Button
                type="primary"
                onClick={handleUpload}
                disabled={fileList.length === 0}
                loading={loading}
                style={{ marginTop: 16 }}
            >
                上传并解析
            </Button>
            <div style={{ marginTop: 24 }}>
                <Text strong>识别结果：</Text>
                {loading ? (
                    <Spin style={{ marginLeft: 10 }} />
                ) : (
                    <Paragraph copyable>{ocrText || "(暂无结果)"}</Paragraph>
                )}
            </div>
        </div>
    );
};

export default ImageOcrUploader;
