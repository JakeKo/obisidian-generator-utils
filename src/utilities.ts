import { DataAdapter } from "obsidian";
import { AnnotationProps, TopicProps } from "./types";
import {
	ANNOTATION_CONTENT,
	ANNOTATION_TITLE,
	CANVAS_TITLE,
	NOTES_CONTENT,
	NOTES_TITLE,
	PAPER_CONTENT,
	PAPER_TITLE,
} from "./templates";

function genId(size: number): string {
	return [...Array(size)]
		.map(() => Math.floor(Math.random() * 16).toString(16))
		.join("");
}

function createFilesAndFolders(
	adapter: DataAdapter,
	pathObject: Record<string, any>,
	basePath = ""
) {
	Object.entries(pathObject).forEach(([path, content]) => {
		const subPath = basePath + "/" + path;

		if (typeof content === "object") {
			adapter.mkdir(subPath);
			createFilesAndFolders(adapter, content, subPath);
		} else {
			adapter.write(subPath, content);
		}
	});
}

function hydrateTemplateString(template: string, props: Record<string, any>) {
	const entries = Object.entries(props);
	let hydratedTemplate = template;

	entries.forEach((prop) => {
		const [key, value] = prop;
		const keyRegExp = new RegExp(`{{${key}}}`, "g");
		hydratedTemplate = hydratedTemplate.replace(keyRegExp, value);
	});

	return hydratedTemplate;
}

function annotationData(props: AnnotationProps) {
	const noteTitle = hydrateTemplateString(ANNOTATION_TITLE, props);
	const noteContent = hydrateTemplateString(ANNOTATION_CONTENT, props);
	return { [noteTitle]: noteContent };
}

function annotationsData(props: AnnotationProps[]) {
	return props.reduce(
		(annotations, p) => ({
			...annotations,
			...annotationData(p),
		}),
		{}
	);
}

function canvasData(props: TopicProps) {
	const nodes = props.pathArticles.map((a, i) => ({
		type: "file",
		file: a,
		width: 400,
		height: 400,
		x: 450 * i,
		y: 0,
		id: genId(16),
	}));

	const canvasTitle = hydrateTemplateString(CANVAS_TITLE, props);
	const canvasContent = JSON.stringify({ nodes, edges: [] });

	return { [canvasTitle]: canvasContent };
}

function reactionPaperData(props: TopicProps) {
	const paperTitle = hydrateTemplateString(PAPER_TITLE, props);
	const paperContent = hydrateTemplateString(PAPER_CONTENT, props);
	return { [paperTitle]: paperContent };
}

function notesData(props: TopicProps) {
	const notesTitle = hydrateTemplateString(NOTES_TITLE, props);
	const notesContent = hydrateTemplateString(NOTES_CONTENT, props);
	return { [notesTitle]: notesContent };
}

export {
	genId,
	createFilesAndFolders,
	hydrateTemplateString,
	annotationsData,
	canvasData,
	reactionPaperData,
	notesData,
};
