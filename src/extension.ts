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
					return { label: decodeText(q.title), q };
				});
				picker.busy = false;
			});

			picker.onDidAccept(() => {
        // See response data for https://api.stackexchange.com/docs/search
				const question: vscode.QuickPickItem & { q?: any } = picker.selectedItems[0];
				// TODO: render question
				let panel = vscode.window.createWebviewPanel(
					'visualOverflow',
					decodeText(question.q.title),
					vscode.ViewColumn.Beside,
					{}
				);
				panel.webview.html = `<h1>${question.q.title}</h1>`;
			});
			picker.show();
		}
	);
}

export function deactivate() {}
