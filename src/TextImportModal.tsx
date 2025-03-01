import {Button, Input, Modal} from "antd";
import {updateUploadedText, updateAnalyzedText, updateDict } from "./editorSlice.ts";
import {useDispatch, useSelector} from "react-redux";
import {useState} from "react";
import {RootState} from "./store.ts";
import {Vocabulary, VocabularyFromBackend} from "./Entity.ts";
import {processText} from "./api.ts";

const TextImportModal = () => {
    const dispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const uploadedText = useSelector((state: RootState) => state.editor.uploadedText);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        handleSubmit();
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async () => {
        try {
            const response = await processText(uploadedText);
            const vocabularyList: Array<VocabularyFromBackend> = response.data.result_list;
            console.log("这是original，", response.data.original_text_list);
            dispatch(updateAnalyzedText(response.data.original_text_list));
            const vocabularies = vocabularyList.map(item => {
                const vocabulary: Vocabulary = new Vocabulary(item.word, item.base_form, item.explanation, item.kana, []);
                vocabulary.structure_list = JSON.parse(item.structure);
                return vocabulary;
            });
            const vocabularyMap = vocabularies?.reduce<Record<string, Vocabulary>>((acc, user) => {
                acc[user.word] = user;
                return acc;
            }, {});
            dispatch(updateDict(vocabularyMap));
            console.log("响应数据", response.data);
            console.log("得到字典", vocabularyMap);
        } catch (error) {
            console.error("请求失败:", error);
        }
    };

    return (
        <>
            <Button type="primary" onClick={showModal}>
                导入文本
            </Button>
            <Modal
                title="对话框标题"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="确认"
                cancelText="取消"
            >
                <Input.TextArea
                    value={uploadedText}
                    onChange={(e) => {
                        dispatch(updateUploadedText(e.target.value));
                    }}
                    rows={4}  // 控制显示的行数
                    onPressEnter={handleSubmit} // 监听回车键
                    placeholder="请输入文本，换行符会保留"
                />
            </Modal>
        </>
    );
}

export default TextImportModal;
