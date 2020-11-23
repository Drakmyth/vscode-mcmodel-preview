import { ExtensionContext, commands, window, ViewColumn, Uri, WebviewPanel } from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as Ajv from 'ajv';
import * as vscode from 'vscode';

export function activate(context: ExtensionContext) {
	let command = commands.registerCommand('vscode-mcmodel-preview.view', () => {
		const editor = vscode.window.activeTextEditor;
		const filename = path.basename(editor?.document.fileName || '');
		const title = 'Preview ' + filename;
		const panel = window.createWebviewPanel('vscode-mcmodel-preview.view', title, ViewColumn.Beside, { enableScripts: true });

		const threePath = getWebviewPath(panel, context.extensionPath, 'src', 'viewer', 'three.min.js');
		const viewerCSSPath = getWebviewPath(panel, context.extensionPath, 'src', 'viewer', 'viewer.css');
		const viewerJSPath = getWebviewPath(panel, context.extensionPath, 'src', 'viewer', 'viewer.js');

		const viewerHTMLPath = path.join(context.extensionPath, 'src', 'viewer', 'viewer.html');
		const rawHtml = fs.readFileSync(viewerHTMLPath, "utf-8");
		const html = rawHtml.replace('{{viewercss-path}}', viewerCSSPath)
							.replace('{{three-path}}', threePath)
							.replace('{{viewerjs-path}}', viewerJSPath);

		panel.webview.html = html;
	});

	context.subscriptions.push(command);
}

export function deactivate() {}

function getWebviewPath(panel: WebviewPanel, ...paths: string[]) {
	const diskPath = Uri.file(path.join(...paths));
	return panel.webview.asWebviewUri(diskPath).toString();
}

export function validateModel(context: ExtensionContext) {

	const modelPath = path.join(context.extensionPath, 'src', 'validation', 'sample-model.json');
	const schemaPath = path.join(context.extensionPath, 'src', 'validation', 'blockmodel.schema.json');

	const model = JSON.parse(fs.readFileSync(modelPath, 'utf-8'));
	const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));

	const ajv = new Ajv();
	const valid = ajv.validate(schema, model);
	if (!valid) {
		return ajv.errorsText();
	}
	return '';
}
