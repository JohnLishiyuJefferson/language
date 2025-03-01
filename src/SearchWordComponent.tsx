import React, { useState, useEffect } from 'react';
import { List } from 'antd';
import { useSelector } from "react-redux";
import { RootState } from "./store.ts";
import { searchWordInES } from "./javaApi.ts";

const SearchWordComponent: React.FC = () => {
    const [sentences, setSentences] = useState<string[]>([]);
    const vocabulary = useSelector((state: RootState) => state.editor.vocabulary);

    useEffect(() => {
        const fetchSentences = async () => {
            if (vocabulary?.word == null) {
                return;
            }
            try {
                const data = await searchWordInES(vocabulary.word);
                setSentences(data); // 假设返回的数据是一个数组，包含多个句子
            } catch (error) {
                console.error('Error searching word:', error);
            }
        };

        fetchSentences();
    }, [vocabulary?.word]); // 只在 vocabulary.word 改变时调用

    return (
        <div style={{ padding: '20px' }}>
            <List
                header={<div>Search Results</div>}
                bordered
                dataSource={sentences}
                renderItem={(item) => (
                    <List.Item>
                        <div>{item}</div>
                    </List.Item>
                )}
                style={{ marginTop: '20px' }}
            />
        </div>
    );
};

export default SearchWordComponent;
