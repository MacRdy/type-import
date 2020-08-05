import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const showInfo = (message: string) => vscode.window.showInformationMessage(`TypeImport: ${message}`);
	const showError = (errorNo: number, message?: string) => showInfo(`Error #${errorNo}.` + (message ? ` ${message}` : null));

	const disposable = vscode.commands.registerCommand('type-import.import', () => {
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			showError(1, 'No active editor found.');
			return;
		}

		const selection = editor.selection;

		const fullTypeName = editor.document.getText(selection).trim();

		const parts = fullTypeName.split('.');
		const alias = parts[parts.length - 1];

		editor.edit(e => {
			const importExpr = new RegExp(/^import.+/gim);
			const importLine = `import ${alias} = ${fullTypeName};` + `\n`;

			let insertPosition = 0;

			const text = editor.document.getText();

			const importMatches = text.match(importExpr);

			if (importMatches?.length) {
				const lastImportMatch = importMatches[importMatches.length - 1];

				const lastImportPosition = text.lastIndexOf(lastImportMatch);

				insertPosition = text.indexOf(';', lastImportPosition);
			}

			const position = insertPosition === 0
				? new vscode.Position(0, 0)
				: editor.document.positionAt(insertPosition).translate(1, 0);

			e.insert(position, importLine);
			e.replace(selection, alias);
		});
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
