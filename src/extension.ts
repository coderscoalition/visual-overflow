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
        // TODO: Add timeout to prevent requesting on each input
				picker.busy = true;
				let res = await fetch(
					'https://api.stackexchange.com/search?' +
						new URLSearchParams({
							intitle: s,
							site: 'stackoverflow',
              filter: 'withbody'
						})
				);
				let json: any = await res.json();
				picker.items = json.items.map((q: any) => {
					return { label: decodeText(q.title), q };
				});
				picker.busy = false;
			});

			picker.onDidAccept(async () => {
        // See response data for https://api.stackexchange.com/docs/search
				const question: vscode.QuickPickItem & { q?: any } = picker.selectedItems[0];
        // TODO: move panel out to own function that accepts question and answer data
				let panel = vscode.window.createWebviewPanel(
					'visualOverflow',
					decodeText(question.q.title),
					vscode.ViewColumn.Beside,
					{}
				);
        let res = await fetch(
					`https://api.stackexchange.com/questions/${question.q.question_id}/answers?` +
						new URLSearchParams({
							site: 'stackoverflow',
              filter: 'withbody'
						})
				);
        let json: any = await res.json();
        // TODO: Add upvote/downvote/score/comments/accepted/dates/usernames
				panel.webview.html = `<h1>${question.q.title}</h1>${question.q.body}<h2>Answers</h2><hr>` + json.items.map((a: any) => `${a.body}`);
			});
			picker.show();
		}
	);
}

export function deactivate() {}
