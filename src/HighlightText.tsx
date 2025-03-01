import React, { useState } from 'react';
import { Tooltip } from 'antd';

interface HighlightTextProps {
    text: string;
}

const HighlightText: React.FC<HighlightTextProps> = ({ text }) => {
    const [highlighted, setHighlighted] = useState<number | null>(null);

    // 将输入文本按 "/" 分割成单词
    const words = text.split('/').filter(word => word.trim() !== '');

    // 处理鼠标进入时的高亮
    const handleMouseEnter = (index: number) => {
        setHighlighted(index);
    };

    // 处理鼠标离开时的取消高亮
    const handleMouseLeave = () => {
        setHighlighted(null);
    };

    return (
        <div style={{ lineHeight: '1.5' }}>
            {words.map((word, index) => (
                <span
                    key={index}
                    style={{
                        padding: '0 4px',
                        backgroundColor: highlighted === index ? 'red' : 'transparent',
                        cursor: 'pointer',
                    }}
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={handleMouseLeave}
                >
          <Tooltip title={word} placement="top">
            {word}
          </Tooltip>
        </span>
            ))}
        </div>
    );
};

export default HighlightText;
