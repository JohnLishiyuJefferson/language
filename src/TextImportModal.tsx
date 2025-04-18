import { Button, Input, Modal, Select } from "antd";
import {updateUploadedText, updateDisplayedText, updateDict } from "./editorSlice.ts";
import {useDispatch, useSelector} from "react-redux";
import {useState} from "react";
import {RootState} from "./store.ts";
import {Vocabulary, VocabularyFromBackend} from "./Entity.ts";
import {processText} from "./api.ts";

const TextImportModal = () => {
    const dispatch = useDispatch();
    const [isEnModalOpen, setIsEnModalOpen] = useState(false);
    const uploadedText = useSelector((state: RootState) => state.editor.uploadedText);
    const { Option } = Select;
    const showModalEn = () => {
        setIsEnModalOpen(true);
    };

    const handleOkEn = () => {
        handleSubmitEn();
        setIsEnModalOpen(false);
    };

    const handleCancelEn = () => {
        setIsEnModalOpen(false);
    };

    const [value, setValue] = useState('');

    const handleSelectChange = (selectedValue) => {
        setValue(selectedValue);
        switch (selectedValue) {
            case '剪贴板':
                // handleOption1();
                break;
            case '影视字幕':
                // handleOption2();
                break;
            case '本地文件':
                // handleOption3();
                break;
            case '网站':
                // handleOption4();
                break;
            default:
                console.log('No specific action for this option');
        }
    };

    const handleSubmitJa = async () => {
        try {
            const response = await processText(uploadedText);
            const vocabularyList: Array<VocabularyFromBackend> = response.data.result_list;
            dispatch(updateDisplayedText([{time: 0, word_list: response.data.original_text_list}]));
            const vocabularies = vocabularyList.map(item => {
                const vocabulary: Vocabulary = new Vocabulary(item.word, item.base_form, item.explanation, item.kana, [], item.id);
                vocabulary.structure_list = JSON.parse(item.structure);
                return vocabulary;
            });
            const vocabularyMap = vocabularies?.reduce<Record<string, Vocabulary>>((acc, vocabulary) => {
                acc[vocabulary.word] = vocabulary;
                return acc;
            }, {});
            dispatch(updateDict(vocabularyMap));
            console.log("响应数据", response.data);
            console.log("得到字典", vocabularyMap);
        } catch (error) {
            console.error("请求失败:", error);
        }
    };

    const handleSubmitEn = async () => {
        try {
            const lineArray = uploadedText.split(/(?<=[.!?])/).map(line => ({
                time: undefined,
                word_list: [],
                time2: undefined,
                en_value: line,
            }));
            dispatch(updateDisplayedText(lineArray));
        } catch (error) {
            console.error("请求失败:", error);
        }
    };

    return (
        <>
            {/*<div>*/}
            {/*    <Select*/}
            {/*        showSearch*/}
            {/*        style={{ width: "100%" }}*/}
            {/*        placeholder="Select a movie or TV show"*/}
            {/*        optionFilterProp="children"*/}
            {/*        onChange={handleSelectChange}*/}
            {/*        value={value}*/}
            {/*        filterOption={(input, option) =>*/}
            {/*            option.toLowerCase().indexOf(input.toLowerCase()) >= 0*/}
            {/*        }*/}
            {/*    >*/}
            {/*        <Option value="option1">剪贴板</Option>*/}
            {/*        <Option value="option2">影视字幕</Option>*/}
            {/*        <Option value="option3">本地文件</Option>*/}
            {/*        <Option value="option4">网站</Option>*/}
            {/*    </Select>*/}
            {/*</div>*/}
            <Button type="primary" onClick={showModalEn}>
                导入
            </Button>
            <Modal
                title="对话框标题"
                open={isEnModalOpen}
                onOk={handleOkEn}
                onCancel={handleCancelEn}
                okText="确认"
                cancelText="取消"
            >
                <Input.TextArea
                    value={uploadedText}
                    onChange={(e) => {
                        dispatch(updateUploadedText(e.target.value));
                    }}
                    rows={4}  // 控制显示的行数
                    // onPressEnter={handleSubmit} // 监听回车键
                    placeholder="请输入文本，换行符会保留"
                />
            </Modal>
        </>
    );
}

export default TextImportModal;
