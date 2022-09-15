import * as vscode from 'vscode';
import fetch from 'node-fetch'

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('visual-overflow.search', () => {
    let picker = vscode.window.createQuickPick();
    picker.title = "Search";
    picker.placeholder = "Search Stack Overflow";
    picker.onDidChangeValue(async s => {
      picker.busy = true;
      console.log('a')
      let res = await fetch('https://api.stackexchange.com/search?' + new URLSearchParams({
        intitle: s,
        site: 'stackoverflow'
      }));
      console.log('b')
      let json: any = await res.json();
      picker.items = json.items.map((q: any) => {return {label: q.title}});
      picker.busy = false;
    });
    picker.onDidAccept(e => {
      // TODO: render question
      let panel = vscode.window.createWebviewPanel('visualOverflow', 'TODO', vscode.ViewColumn.Beside, {});
      panel.webview.html = '<h1>TODO</h1>' + JSON.stringify(e)
    })
    picker.show();
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
