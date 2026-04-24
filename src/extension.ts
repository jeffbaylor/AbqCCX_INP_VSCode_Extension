import * as vscode from 'vscode';

// Keywords that have explicit *END <KEYWORD> counterparts and use block-level folds.
const BLOCK_START = /^\*(STEP|PART|INSTANCE|ASSEMBLY)\b/i;
const BLOCK_END   = /^\*END\s+(STEP|PART|INSTANCE|ASSEMBLY)\b/i;
const KEYWORD     = /^\*(?!\*)/;

interface KeywordEntry {
    line: number;
    blockStartType: string | null;
    blockEndType: string | null;
}

class AbaqusFoldingProvider implements vscode.FoldingRangeProvider {
    provideFoldingRanges(
        document: vscode.TextDocument,
        _context: vscode.FoldingContext,
        _token: vscode.CancellationToken
    ): vscode.FoldingRange[] {
        const entries = this.collectKeywords(document);
        const ranges: vscode.FoldingRange[] = [];
        this.addBlockFolds(entries, ranges);
        this.addDataFolds(entries, document.lineCount, ranges);
        return ranges;
    }

    private collectKeywords(document: vscode.TextDocument): KeywordEntry[] {
        const entries: KeywordEntry[] = [];
        for (let i = 0; i < document.lineCount; i++) {
            const text = document.lineAt(i).text;
            if (!KEYWORD.test(text)) { continue; }
            const startMatch = BLOCK_START.exec(text);
            const endMatch   = BLOCK_END.exec(text);
            entries.push({
                line: i,
                blockStartType: startMatch ? startMatch[1].toUpperCase() : null,
                blockEndType:   endMatch   ? endMatch[1].toUpperCase()   : null,
            });
        }
        return entries;
    }

    // Fold *STEP…*END STEP, *PART…*END PART, etc.
    private addBlockFolds(entries: KeywordEntry[], ranges: vscode.FoldingRange[]): void {
        const stack: { line: number; type: string }[] = [];
        for (const entry of entries) {
            if (entry.blockStartType) {
                stack.push({ line: entry.line, type: entry.blockStartType });
            } else if (entry.blockEndType) {
                for (let j = stack.length - 1; j >= 0; j--) {
                    if (stack[j].type === entry.blockEndType) {
                        ranges.push(new vscode.FoldingRange(stack[j].line, entry.line));
                        stack.splice(j, 1);
                        break;
                    }
                }
            }
        }
    }

    // Fold each plain keyword (*NODE, *STATIC, *ELASTIC, etc.) over the data lines
    // that follow it, ending just before the next keyword line.
    private addDataFolds(
        entries: KeywordEntry[],
        lineCount: number,
        ranges: vscode.FoldingRange[]
    ): void {
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            if (entry.blockStartType || entry.blockEndType) { continue; }

            const nextKeywordLine = i + 1 < entries.length
                ? entries[i + 1].line
                : lineCount;

            if (nextKeywordLine - 1 > entry.line) {
                ranges.push(new vscode.FoldingRange(entry.line, nextKeywordLine - 1));
            }
        }
    }
}

export function activate(context: vscode.ExtensionContext): void {
    const provider = new AbaqusFoldingProvider();
    context.subscriptions.push(
        vscode.languages.registerFoldingRangeProvider({ language: 'abaqus' },   provider),
        vscode.languages.registerFoldingRangeProvider({ language: 'calculix' }, provider)
    );
}

export function deactivate(): void {}
