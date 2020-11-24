import { ExtensionContext, commands, window, ViewColumn, Uri, WebviewPanel } from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ValidateFunction } from 'ajv';
import * as Ajv from 'ajv';

export function activate(context: ExtensionContext) {
	const editorMap = new Map<string, WebviewPanel>();
	const schemas = new Map<Schema, ValidateFunction>();

	const blockModelSchemaPath = path.join(context.extensionPath, 'src', 'validation', 'blockmodel.schema.json');
	const itemModelSchemaPath = path.join(context.extensionPath, 'src', 'validation', 'itemmodel.schema.json');
	const blockstateSchemaPath = path.join(context.extensionPath, 'src', 'validation', 'blockstate.schema.json');

	schemas.set(Schema.BLOCKMODEL, compileSchema(blockModelSchemaPath));
	schemas.set(Schema.ITEMMODEL, compileSchema(itemModelSchemaPath));
	schemas.set(Schema.BLOCKSTATE, compileSchema(blockstateSchemaPath));

	context.subscriptions.push(
		commands.registerCommand('vscode-mcmodel-preview.view', () => {
			const editor = window.activeTextEditor;
			if (!editor) return;

			const filepath = editor.document.fileName;
			const filename = path.basename(filepath || '');

			if (editorMap.has(filename)) {
				editorMap.get(filename)?.reveal(ViewColumn.Beside);
				return;
			}

			const title = 'Preview ' + filename;
			const panel = window.createWebviewPanel('vscode-mcmodel-preview.view', title, ViewColumn.Beside, { enableScripts: true });
			editorMap.set(filename, panel);

			panel.onDidDispose(() => {
				editorMap.delete(filename);
			}, undefined, context.subscriptions);

			const blockModelSchema = schemas.get(Schema.BLOCKMODEL);
			if (!blockModelSchema) return;
			validateModel(blockModelSchema, filepath);

			panel.webview.html = getModelViewerHtml(context, panel);
		})
	);

	context.subscriptions.push(
		commands.registerCommand('vscode-mcmodel-preview.update', () => {

		})
	);
}

export function deactivate() { }

function getWebviewPath(panel: WebviewPanel, ...paths: string[]) {
	const diskPath = Uri.file(path.join(...paths));
	return panel.webview.asWebviewUri(diskPath).toString();
}

export function validateModel(schema: ValidateFunction, modelPath: string) {
	const model = JSON.parse(fs.readFileSync(modelPath, 'utf-8'));

	const valid = schema(model);
	if (!valid) {
		return schema.errors?.map(error => error.toString()).join('; ');
	}
	return '';
}

function compileSchema(schemaPath: string): ValidateFunction {
	const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
	const ajv = new Ajv();
	return ajv.compile(schema);
}

function getModelViewerHtml(context: ExtensionContext, panel: WebviewPanel): string {
	const threePath = getWebviewPath(panel, context.extensionPath, 'src', 'viewer', 'three.min.js');
	const viewerCSSPath = getWebviewPath(panel, context.extensionPath, 'src', 'viewer', 'viewer.css');
	const viewerJSPath = getWebviewPath(panel, context.extensionPath, 'src', 'viewer', 'viewer.js');

	const viewerHTMLPath = path.join(context.extensionPath, 'src', 'viewer', 'viewer.html');
	const rawHtml = fs.readFileSync(viewerHTMLPath, "utf-8");
	return rawHtml.replace('{{viewercss-path}}', viewerCSSPath)
		.replace('{{three-path}}', threePath)
		.replace('{{viewerjs-path}}', viewerJSPath);
}

enum Schema {
	BLOCKMODEL,
	ITEMMODEL,
	BLOCKSTATE
}
