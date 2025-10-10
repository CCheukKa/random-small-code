export const enum NodeType {
    INPUT = 'input',
    OUTPUT = 'output',
    CONSTANT = 'constant',
    OPERATOR = 'operator',
};
export const enum OperatorType {
    NOT = '!',
    AND = '&',
    OR = '|',
    XOR = '^',
};

export type SatNode =
    ({
        nodeType: NodeType.INPUT;
        key: string;
    }) |
    ({
        nodeType: NodeType.CONSTANT;
        value: boolean;
    }) |
    ({
        nodeType: NodeType.OPERATOR;
    } & ({
        operatorType: OperatorType.NOT;
        input: SatNode;
    } | {
        operatorType: OperatorType;
        inputs: [SatNode, SatNode];
    })
    );