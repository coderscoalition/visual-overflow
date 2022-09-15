import fetch from 'node-fetch';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand(
        'visual-overflow.search',
        () => {
            // Picker option
            let picker = vscode.window.createQuickPick();
            picker.title = 'Search';
            picker.placeholder = 'Search Stack Overflow';

            // Input value listener
            picker.onDidChangeValue(async (searchValue) => {
                // Loading status
                picker.busy = true;

                // Fetch from remote stack API
                let res = await fetch(
                    'https://api.stackexchange.com/search?' +
                        new URLSearchParams({
                            intitle: searchValue,
                            site: 'stackoverflow',
                        })
                );

                let json = (await res.json()) as any;

                // Map labels to returned titles
                picker.items = json.items.map((q: any) => {
                    return { label: q.title };
                });

                // Disable loading status
                picker.busy = false;
            });

            // Title click action
            picker.onDidAccept(() => {
                // TODO: render question

                // New panel options
                let panel = vscode.window.createWebviewPanel(
                    'visualOverflow',
                    'TODO',
                    vscode.ViewColumn.Beside,
                    {}
                );

                // Markdown content
                panel.webview.html = 'TODO';
            });

            // Setup picker with given listeners
            picker.show();
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
