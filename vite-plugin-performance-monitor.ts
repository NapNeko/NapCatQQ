import { Plugin } from 'vite';
import { parse } from '@babel/parser';
import traverseDefault from '@babel/traverse';
import generateDefault from '@babel/generator';
import * as t from '@babel/types';
import { resolve } from 'path';

// @ts-ignore
const traverse = traverseDefault.default || traverseDefault;
// @ts-ignore
const generate = generateDefault.default || generateDefault;

interface PerformancePluginOptions {
}

/**
 * Vite插件：自动在函数中插入性能监控代码
 */
export function performanceMonitorPlugin(options: PerformancePluginOptions): Plugin {
    const exclude = [/node_modules/, /\.min\./, /performance-monitor\.ts$/];

    return {
        name: 'performance-monitor',
        transform(code: string, id: string) {
            const fileName = id.replace(process.cwd(), '').replace(/\\/g, '/');

            // 排除规则检查
            if (exclude.some(pattern => pattern.test(id))) {
                return null;
            }

            try {
                // 解析AST
                const ast = parse(code, {
                    sourceType: 'module',
                    plugins: [
                        'typescript',
                        'decorators-legacy',
                        'classProperties',
                        'asyncGenerators',
                        'bigInt',
                        'dynamicImport',
                        'exportDefaultFrom',
                        'exportNamespaceFrom',
                        'nullishCoalescingOperator',
                        'numericSeparator',
                        'optionalCatchBinding',
                        'optionalChaining',
                        'topLevelAwait'
                    ]
                });

                let hasMonitorImport = false;
                let hasMonitorExport = false;
                let needsMonitor = false;
                // 遍历AST
                traverse(ast, {
                    // 检查是否已经导入了性能监控器
                    ImportDeclaration(path: { node: { source: { value: string | string[]; }; }; }) {
                        if (path.node.source.value.includes('performance-monitor')) {
                            hasMonitorImport = true;
                        }
                    },

                    // 检查是否已经导出了性能监控器
                    ExportNamedDeclaration(path: { node: { declaration: t.Node | null | undefined; }; }) {
                        if (path.node.declaration && t.isVariableDeclaration(path.node.declaration)) {
                            path.node.declaration.declarations.forEach((declarator: { id: t.Node | null | undefined; }) => {
                                if (t.isIdentifier(declarator.id) && declarator.id.name === 'performanceMonitor') {
                                    hasMonitorExport = true;
                                }
                            });
                        }
                    },

                    // 检查变量声明
                    VariableDeclaration(path: { node: { declarations: any[]; }; }) {
                        path.node.declarations.forEach((declarator: { id: t.Node | null | undefined; }) => {
                            if (t.isIdentifier(declarator.id) && declarator.id.name === 'performanceMonitor') {
                                hasMonitorExport = true;
                            }
                        });
                    },

                    // 处理函数声明
                    FunctionDeclaration(path: { node: { id: { name: string; }; loc: { start: { line: number; }; }; }; }) {
                        const functionName = path.node.id?.name || 'anonymous';
                        const lineNumber = path.node.loc?.start.line || 0;

                        instrumentFunction(path, functionName, fileName, lineNumber);
                        needsMonitor = true;
                    },

                    // 处理箭头函数
                    ArrowFunctionExpression(path: { parent: any; node: { loc: { start: { line: number; }; }; }; }) {
                        const parent = path.parent;
                        let functionName = 'anonymous';

                        if (t.isVariableDeclarator(parent) && t.isIdentifier(parent.id)) {
                            functionName = parent.id.name;
                        } else if (t.isProperty(parent) && t.isIdentifier(parent.key)) {
                            functionName = parent.key.name;
                        } else if (t.isAssignmentExpression(parent) && t.isMemberExpression(parent.left)) {
                            const property = parent.left.property;
                            if (t.isIdentifier(property)) {
                                functionName = property.name;
                            }
                        }

                        const lineNumber = path.node.loc?.start.line || 0;
                        instrumentFunction(path, functionName, fileName, lineNumber);
                        needsMonitor = true;
                    },

                    // 处理函数表达式
                    FunctionExpression(path: { node: { id: { name: string; }; loc: { start: { line: number; }; }; }; }) {
                        const functionName = path.node.id?.name || 'anonymous';
                        const lineNumber = path.node.loc?.start.line || 0;

                        instrumentFunction(path, functionName, fileName, lineNumber);
                        needsMonitor = true;
                    },

                    // 处理类方法
                    ClassMethod(path: { node: { key: t.Node | null | undefined; loc: { start: { line: number; }; }; }; }) {
                        const methodName = t.isIdentifier(path.node.key) ? path.node.key.name : 'anonymous';
                        const className = getClassName(path);
                        const functionName = `${className}.${methodName}`;
                        const lineNumber = path.node.loc?.start.line || 0;

                        instrumentFunction(path, functionName, fileName, lineNumber);
                        needsMonitor = true;
                    },

                    // 处理对象方法
                    ObjectMethod(path: { node: { key: t.Node | null | undefined; loc: { start: { line: number; }; }; }; }) {
                        const methodName = t.isIdentifier(path.node.key) ? path.node.key.name : 'anonymous';
                        const lineNumber = path.node.loc?.start.line || 0;

                        instrumentFunction(path, methodName, fileName, lineNumber);
                        needsMonitor = true;
                    }
                });

                if (!needsMonitor) {
                    return null;
                }

                // 如果需要监控但还没有导入且没有导出，则添加导入语句
                if (!hasMonitorImport && !hasMonitorExport) {
                    const importDeclaration = t.importDeclaration(
                        [t.importSpecifier(t.identifier('performanceMonitor'), t.identifier('performanceMonitor'))],
                        t.stringLiteral('@/common/performance-monitor')
                    );
                    ast.program.body.unshift(importDeclaration);
                }

                // 生成新代码
                const result = generate(ast, {
                    retainLines: true,
                    compact: false
                });

                return {
                    code: result.code,
                    map: result.map
                };

            } catch (error) {
                console.warn(`性能监控插件处理文件 ${id} 时出错:`, error);
                return null;
            }
        }
    };
}

/**
 * 为函数添加性能监控代码
 */
function instrumentFunction(
    path: any,
    functionName: string,
    fileName: string,
    lineNumber: number
) {
    // 跳过已经被监控的函数
    if (functionName.includes('__perf_monitor__')) {
        return;
    }

    const isAsync = path.node.async;
    const body = path.node.body;

    // 确保函数体是块语句
    if (!t.isBlockStatement(body)) {
        // 对于箭头函数的表达式体，转换为块语句
        const returnStatement = t.returnStatement(body);
        path.node.body = t.blockStatement([returnStatement]);
    }

    const blockBody = path.node.body as t.BlockStatement;

    // 生成唯一的调用ID变量名
    const callIdVar = `__perf_monitor_${functionName.replace(/[^a-zA-Z0-9]/g, '_')}_${lineNumber}__`;

    // 创建开始监控的语句
    const startMonitoring = t.variableDeclaration('const', [
        t.variableDeclarator(
            t.identifier(callIdVar),
            t.callExpression(
                t.memberExpression(
                    t.identifier('performanceMonitor'),
                    t.identifier('startFunction')
                ),
                [
                    t.stringLiteral(functionName),
                    t.stringLiteral(fileName),
                    t.numericLiteral(lineNumber)
                ]
            )
        )
    ]);

    // 创建结束监控的语句
    const endMonitoring = t.expressionStatement(
        t.callExpression(
            t.memberExpression(
                t.identifier('performanceMonitor'),
                t.identifier('endFunction')
            ),
            [
                t.identifier(callIdVar),
                t.stringLiteral(functionName)
            ]
        )
    );

    if (isAsync) {
        // 对于异步函数，需要在所有可能的返回点添加监控结束
        instrumentAsyncFunction(blockBody, startMonitoring, endMonitoring, callIdVar, functionName);
    } else {
        // 对于同步函数，使用try-finally确保监控结束
        instrumentSyncFunction(blockBody, startMonitoring, endMonitoring);
    }
}

/**
 * 为同步函数添加监控
 */
function instrumentSyncFunction(
    blockBody: t.BlockStatement,
    startMonitoring: t.VariableDeclaration,
    endMonitoring: t.ExpressionStatement
) {
    const originalStatements = [...blockBody.body];

    const tryStatement = t.tryStatement(
        t.blockStatement(originalStatements),
        null,
        t.blockStatement([endMonitoring])
    );

    blockBody.body = [startMonitoring, tryStatement];
}

/**
 * 为异步函数添加监控
 */
function instrumentAsyncFunction(
    blockBody: t.BlockStatement,
    startMonitoring: t.VariableDeclaration,
    endMonitoring: t.ExpressionStatement,
    callIdVar: string,
    functionName: string
) {
    const originalStatements = [...blockBody.body];

    // 创建包装的异步执行体
    const asyncTryStatement = t.tryStatement(
        t.blockStatement(originalStatements),
        null,
        t.blockStatement([endMonitoring])
    );

    blockBody.body = [startMonitoring, asyncTryStatement];
}

/**
 * 获取类名
 */
function getClassName(path: any): string {
    let current = path;
    while (current) {
        if (current.isClassDeclaration && current.isClassDeclaration()) {
            return current.node.id?.name || 'AnonymousClass';
        } else if (current.isClassExpression && current.isClassExpression()) {
            return current.node.id?.name || 'AnonymousClass';
        } else if (current.node && (t.isClassDeclaration(current.node) || t.isClassExpression(current.node))) {
            return current.node.id?.name || 'AnonymousClass';
        }
        current = current.parent;
    }
    return 'UnknownClass';
}

export default performanceMonitorPlugin;