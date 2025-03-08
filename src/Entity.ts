export class Vocabulary {
    word: string;
    base_form: string;
    explanation: string;
    kana: string;
    structure_list: Array<Structure>;
    id: number;

    constructor(word: string, base_form: string, explanation: string, kana: string, structure: Array<Structure>, id: number) {
        this.word = word;
        this.base_form = base_form;
        this.explanation = explanation;
        this.kana = kana;
        this.structure_list = structure;
        this.id = id;
    }

    toDict(): { [key: string]: string | Structure[] | number } {
        return {
            word: this.word,
            base_form: this.base_form,
            explanation: this.explanation,
            kana: this.kana,
            structure_list: this.structure_list,
            id: this.id,
        };
    }
}

export class VocabularyFromBackend {
    word: string;
    base_form: string;
    explanation: string;
    kana: string;
    structure: string;
    id: number;

    constructor(word: string, base_form: string, explanation: string, kana: string, structure: string) {
        this.word = word;
        this.base_form = base_form;
        this.explanation = explanation;
        this.kana = kana;
        this.structure = structure;
    }

    toDict(): { [key: string]: string | Structure[] } {
        return {
            word: this.word,
            base_form: this.base_form,
            explanation: this.explanation,
            kana: this.kana,
            structure: this.structure,
        };
    }
}


export class Structure {
    sentence: string;
    antonym: string;
    synonym: string;
    idiom: string;
    explanation: string;
    derivative: string;

    constructor(sentence: string, antonym: string, synonym: string, idiom: string, explanation: string, derivative: string) {
        this.sentence = sentence;
        this.antonym = antonym;
        this.synonym = synonym;
        this.idiom = idiom;
        this.explanation = explanation;
        this.derivative = derivative;
    }

    static fromJSON(json: any): Structure {
        return new Structure(
            json.sentence || "",
            json.antonym || "",
            json.synonym || "",
            json.idiom || "",
            json.explanation || "",
            json.derivative || ""
        );
    }

    toDict(): { [key: string]: string } {
        return {
            sentence: this.sentence,
            antonym: this.antonym,
            synonym: this.synonym,
            idiom: this.idiom,
            explanation: this.explanation,
            derivative: this.derivative
        };
    }

    static toStructureString(structure: Structure): string {
        const result = " "
        + (structure.explanation ? `\n释义: ${structure.explanation} ` : "")
        + (structure.sentence ? `\n例句: ${structure.sentence} ` : "")
        + (structure.antonym ? `\n反义: ${structure.antonym} ` : "")
        + (structure.synonym ? `\n同义: ${structure.synonym} ` : "")
        + (structure.idiom ? `\n习语: ${structure.idiom} ` : "")
        + (structure.derivative ? `\n衍生: ${structure.derivative} ` : "")
        ;
        return result;
    }
}

