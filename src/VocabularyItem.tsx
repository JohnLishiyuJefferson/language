import React, {useState} from 'react';
import { List, Row, Col } from 'antd';
import {Structure} from "./Entity.ts";

interface VocabularyListProps {
    structure?: Structure;
}

const ExpandableListItem: React.FC<VocabularyListProps> = ({ structure }) => {
    const [isHovered, setIsHovered] = useState(false);

    // 控制内容是否展开
    const content = structure ? (true ? (
        <>
             {/*<List.Item>*/}
             {/*    <div style={{fontSize: 18, marginBottom: 8}}>{structure.explanation}</div>*/}
             {/*    <div style={{fontSize: 16, marginBottom: 8}}>{structure.sentence && <div>例句： {structure.sentence}</div>}</div>*/}
             {/*    {structure.antonym && <div style={{fontSize: 16, marginBottom: 8}}>反义： {structure.antonym}</div>}*/}
             {/*    {structure.synonym && <div style={{fontSize: 16, marginBottom: 8}}>近义： {structure.synonym}</div>}*/}
             {/*    {structure.idiom && <div style={{fontSize: 16, marginBottom: 8}}>习语： {structure.idiom}</div>}*/}
             {/*    {structure.derivative && <div style={{fontSize: 16, marginBottom: 8}}>衍生： {structure.derivative}</div>}*/}
             {/*</List.Item>*/}
            {<div style={{fontSize: 18, marginBottom: 8}}>{structure.explanation}</div>}
            {structure.sentence && <div style={{fontSize: 16, marginBottom: 8}}>{structure.sentence && <div>例句： {structure.sentence}</div>}</div>}
            {structure.antonym && <div style={{fontSize: 16, marginBottom: 8}}>反义： {structure.antonym}</div>}
            {structure.synonym && <div style={{fontSize: 16, marginBottom: 8}}>近义： {structure.synonym}</div>}
            {structure.idiom && <div style={{fontSize: 16, marginBottom: 8}}>习语： {structure.idiom}</div>}
            {structure.derivative && <div style={{fontSize: 16, marginBottom: 8}}>衍生： {structure.derivative}</div>}
        </>
    ) : (
        <>
            {/* 默认情况下显示前几个字 */}
            <div style={{fontSize: 18, marginBottom: 1}}>{structure.explanation}</div>
        </>
    )) : "";

    return (
        <List.Item
            onClick={() => setIsHovered(true)}  // 鼠标进入时展开
            onMouseLeave={() => setIsHovered(false)}  // 鼠标离开时收起
            style={{ marginBottom: 1}}
        >
            {content}
        </List.Item>
    );
};
export default ExpandableListItem;
