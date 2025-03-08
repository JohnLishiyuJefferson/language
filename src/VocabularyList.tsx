import React, {useEffect, useState} from "react";
import {List} from "antd";
import ExpandableListItem from "./VocabularyItem.tsx";
import {useSelector} from "react-redux";
import {RootState} from "./store.ts";
import SearchWordComponent from "./SearchWordComponent.tsx";
import {addWord, fetchSynthesizedAudio} from "./api.ts";

const VocabularyList: React.FC = () => {

    const [added, setAdded] = useState(false);
    const vocabulary = useSelector((state: RootState) => state.editor.vocabulary);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (vocabulary) {
            console.log("得到的vocabulary", vocabulary);
            fetchSynthesizedAudio(vocabulary.word, false).then(audioUrl => {
                if (audioUrl) {
                    if (audio) {
                        audio.pause(); // 停止之前的音频
                    }
                    const newAudio = new Audio(audioUrl);
                    setAudio(newAudio);
                    newAudio.play().catch(error => console.error("Audio playback failed:", error));
                }
            });
        }
    }, [vocabulary]);

    const handleAddWord = async () => {
        try {
            console.log("addWord vocabulary", vocabulary);
            await addWord(vocabulary.id);//todo 缺少id属性
            setAdded(true);
        } catch (err) {
            console.error("添加生词失败", err);//todo 添加提示
        }
    };

    return (
        // marginTop: 25, marginLeft: 0
        <div style={{width:'100%'}}>
            <span style={{marginLeft: 10, fontSize: 25}}>{vocabulary?.word}</span>
            <span style={{marginLeft: 15, fontSize: 20}}>{vocabulary?.kana}</span>
            <button onClick={handleAddWord} disabled={added}>
                {added ? "已添加" : "添加到生词本"}
            </button>
            <List
                itemLayout="vertical"
                style={{marginTop: 10, width:'100%', overflowY: "auto", height: 600}}//width: 300,
                bordered
                dataSource={vocabulary?.structure_list ?? []}
                renderItem={(structure) => (
                    <ExpandableListItem structure={structure} />
                    // <List.Item>
                    //     <div style={{fontSize: 18, marginBottom: 8}}>{structure.explanation}</div>
                    //     <div style={{fontSize: 16, marginBottom: 8}}>{structure.sentence && <div>例句： {structure.sentence}</div>}</div>
                    //     {structure.antonym && <div style={{fontSize: 16, marginBottom: 8}}>反义： {structure.antonym}</div>}
                    //     {structure.synonym && <div style={{fontSize: 16, marginBottom: 8}}>近义： {structure.synonym}</div>}
                    //     {structure.idiom && <div style={{fontSize: 16, marginBottom: 8}}>习语： {structure.idiom}</div>}
                    //     {structure.derivative && <div style={{fontSize: 16, marginBottom: 8}}>衍生： {structure.derivative}</div>}
                    // </List.Item>
                )}
            />
            <SearchWordComponent />
        </div>
    );
};

export default VocabularyList;
