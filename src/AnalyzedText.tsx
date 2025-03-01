import React, { useState, useMemo } from 'react';
import {Button, Col, List, Row, Tooltip, Typography} from 'antd';
import {Structure, Vocabulary} from "./Entity.ts";
import {useDispatch, useSelector} from "react-redux";
import { updateVocabulary, updateSelectedText } from "./editorSlice";
import {RootState} from "./store.ts";

interface PaginatedTextProps {
    wordsPerPage: number;  // 每页显示的单词数
}

const AnalyzedText: React.FC<PaginatedTextProps> = ({ wordsPerPage }) => {
    const analyzedText = useSelector((state: RootState) => state.editor.analyzedText);
    const dict = useSelector((state: RootState) => state.editor.dict);
    // 通过空格分割文本成单词数组
    const words = analyzedText;
    console.log("准备展示的词汇数组", words);
    const dispatch = useDispatch();
    const [currentPage, setCurrentPage] = useState(0);
    const [highlighted, setHighlighted] = useState<number | null>(null);
    const [explanation, setExplanation] = useState<string | null>(null);

    const handleMouseUp = () => {
        const selection = window.getSelection()?.toString().trim() ?? "";
        dispatch(updateSelectedText(selection));
    };

    // 计算当前页的单词数组
    const currentDisplayedWords = useMemo(() => {
        const start = currentPage * wordsPerPage;
        const end = start + wordsPerPage;
        return words.slice(start, end);
    }, [currentPage, words, wordsPerPage]);

    // 计算总页数
    const totalPages = Math.ceil(words.length / wordsPerPage);

    // 翻到下一页
    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    // 返回上一页
    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const processExplanation = (word: string) => {
        if (!dict) {
            return "";
        }
        const dictElement = dict[word];
        console.log(JSON.stringify(dictElement));
        const jointResult = dictElement?.structure_list?.map(structure => {

            return Structure.toStructureString(structure);
        }).join(" ");
        const content = dictElement?.kana + " " + jointResult;
        return content;
    }


    return (
        <div>
            {/* 渲染当前页的文本 */}
            <div onMouseUp={handleMouseUp} style={{height:'600px', overflowY: 'auto'}}>
                {currentDisplayedWords.map((word, index) => (
                    <span
                        key={index}
                        style={{
                            marginRight: 5,
                            backgroundColor: index === highlighted ? 'red' : 'transparent',
                            cursor: 'pointer',
                            fontSize: 20,
                            lineHeight: 1.8,
                            display: word === '\t' ? 'block' : 'inline', // 如果是换行符，使用 block 显示
                        }}
                        onClick={() => {
                            setHighlighted(index);
                            setExplanation(processExplanation(word));
                            dispatch(updateVocabulary(dict[word]));
                            }
                        }  // 鼠标滑过
                    >
                        <Tooltip title={(explanation && explanation.length > 50) ? `${explanation.substring(0, 50)}...` : explanation} placement="top" >
            {word}
          </Tooltip>
          </span>
                ))}
            </div>
            {/* 分页按钮 */}
            <div style={{ marginTop: 20 }}>
                <Button onClick={handlePrevPage} disabled={currentPage === 0}>
                    上一页
                </Button>
                <span>{currentPage + 1} / {totalPages}</span>
                <Button onClick={handleNextPage} disabled={currentPage === totalPages - 1}>
                    下一页
                </Button>
            </div>

            {/*<Text>{explanation}</Text>*/}
            {/*<span>{vocabulary?.kana}</span>*/}
            {/*<List*/}
            {/*    itemLayout="vertical"*/}
            {/*    style={{marginTop: 20, width: 500}}*/}
            {/*    bordered*/}
            {/*    dataSource={vocabulary?.structure_list ?? []}*/}
            {/*    renderItem={(structure) => (*/}
            {/*        <div>*/}
            {/*            <List.Item>*/}
            {/*                {structure.explanation}*/}
            {/*                {structure.sentence ? <Row><Col>例句：{structure.sentence}</Col></Row> : null}*/}
            {/*                {structure.antonym ? <Row><Col>反义：{structure.antonym}</Col></Row> : null}*/}
            {/*                {structure.synonym ? <Row><Col>近义：{structure.synonym}</Col></Row> : null}*/}
            {/*                {structure.idiom ? <Row><Col>习语：{structure.idiom}</Col></Row> : null}*/}
            {/*                {structure.derivative ? <Row><Col>衍生：{structure.derivative}</Col></Row> : null}*/}
            {/*            </List.Item>*/}
            {/*        </div>*/}

            {/*    )}*/}
            {/*/>*/}
        </div>
    );
};

export default AnalyzedText;
