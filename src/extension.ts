import fetch from 'node-fetch';
import * as vscode from 'vscode';

function decodeText(s: string) {
	const entities = [
		['amp', '&'],
		['apos', "'"],
		['#x27', "'"],
		['#x2F', '/'],
		['#39', "'"],
		['#47', '/'],
		['lt', '<'],
		['gt', '>'],
		['nbsp', ' '],
		['quot', '"'],
	];

	for (var i = 0, max = entities.length; i < max; ++i) {
		s = s.replace(new RegExp('&' + entities[i][0] + ';', 'g'), entities[i][1]);
	}

	return s;
}

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand(
		'visual-overflow.search',
		() => {
			let picker = vscode.window.createQuickPick();
			picker.title = 'Search';
			picker.placeholder = 'Search Stack Overflow';
			picker.onDidChangeValue(async (s) => {
				picker.busy = true;
				let res = await fetch(
					'https://api.stackexchange.com/search?' +
						new URLSearchParams({
							intitle: s,
							site: 'stackoverflow',
						})
				);
				let json: any = await res.json();
				picker.items = json.items.map((q: any) => {
					return { label: decodeText(q.title) };
				});
				picker.busy = false;
			});
			picker.onDidAccept((e) => {
				const question = picker.activeItems[0];
				console.log(question);
				// TODO: render question
				let panel = vscode.window.createWebviewPanel(
					'visualOverflow',
					'TODO',
					vscode.ViewColumn.Beside,
					{}
				);
				panel.webview.html = '<h1>TODO</h1>' + JSON.stringify(e);
			});
			picker.show();
		}
	);
}

export function deactivate() {}
