import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const showInfo = (message: string) => vscode.window.showInformationMessage(`Type Import: ${message}`);
	const showError = (errorNo: number, message?: string) => showInfo(`Error #${errorNo}.` + (message ? ` ${message}` : null));

	try {
		const disposable = vscode.commands.registerCommand('type-import.import', () => {
			const editor = vscode.window.activeTextEditor;

			if (!editor) {
				showError(1, 'No active editor found.');
				return;
			}

			const selection = editor.selection;
			const selectionText = editor.document.getText(selection);

			const fullTypeName = selectionText.trim();

			if (!fullTypeName) {
				showError(2, 'Nothing to import.');
				return;
			}

			if (fullTypeName.indexOf('.') === -1) {
				showInfo('No import required.');
				return;
			}

			const parts = fullTypeName.split('.');
	
			if (parts.some(x => !x || x.includes(' '))) {
				showError(3, 'Invalid type.');
				return;
			}

			const alias = parts[parts.length - 1];

			editor.edit(e => {
				const documentContent = editor.document.getText();

				const importLine = `import ${alias} = ${fullTypeName};`;

				let insertPosition = 0;

				const importMatches = documentContent.match(/^import.+/gim);

				if (importMatches?.length) {
					const lastImportMatch = importMatches[importMatches.length - 1];

					const lastImportPosition = documentContent.lastIndexOf(lastImportMatch);

					insertPosition = documentContent.indexOf(';', lastImportPosition);
				}

				const position = insertPosition === 0
					? new vscode.Position(0, 0)
					: new vscode.Position(editor.document.positionAt(insertPosition).translate(1).line, 0);

				const beginningSpaceCount = selectionText.search(/\S/);

				const endSpaceIndex = selectionText.search(/\s+$/m);

				const endSpaceCount = endSpaceIndex !== -1
					? selectionText.length - endSpaceIndex
					: 0;

				const replaceSelection = new vscode.Selection(
					selection.start.translate(0, beginningSpaceCount),
					selection.end.translate(0, -endSpaceCount),
				);

				if (documentContent.indexOf(importLine) === -1) {
					e.insert(position, importLine + '\n');
				}

				e.replace(replaceSelection, alias);
			});
		});

		context.subscriptions.push(disposable);
	} catch {
		showError(0, 'Unknown error.');
	}
}

export function deactivate() {}
