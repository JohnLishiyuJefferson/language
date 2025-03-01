import React, {useState} from "react";

import { useSelector } from "react-redux";
import {RootState} from "./store.ts";
import {Button, Input} from "antd";
import { useDispatch } from "react-redux";
import {updateSelectedText} from "./editorSlice.ts";
import {getAiReply} from "./api.ts";

const AISpace: React.FC = () => {
    const dispatch = useDispatch();
    const [question, setQuestion] = useState<string>("");
    const selectedText = useSelector((state: RootState) => state.editor.selectedText);
    const [reply, setReply] = useState<string>("");

    const sendQuestion = async () => {
        const aiReply = await getAiReply(selectedText, [question]);
        setReply(aiReply);
        console.log("reply", aiReply);
    }


    return <div style={{ fontSize: 15, lineHeight: 1.6 }}>
        <Input.TextArea value={selectedText} onChange={(e) => dispatch(updateSelectedText(e.target.value))} />
        <span>对选中的内容进行提问：</span>
        <Input.TextArea value={question} onChange={(e) => setQuestion(e.target.value)} />
        <Button type="primary" onClick={sendQuestion}>提问</Button>
        <Input.TextArea value={reply} />
    </div>;
};

export default AISpace;
