import { App, DataAdapter, Modal, Setting } from "obsidian";
import {
	ANNOTATION_CONTENT,
	ANNOTATION_TITLE,
	CANVAS_TITLE,
	PAPER_TITLE,
	PAPER_CONTENT,
} from "src/templates";

type TopicProps = {
	titleTopic: string;
	tagTopic: string;
	tagClass: string;
	pathArticles: string[];
};

type AnnotationProps = {
	titleArticle: string;
	fileArticle: string;
	tagYear: number;
	tagTopic: string;
	tagClass: string;
};

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
		hydratedTemplate = hydratedTemplate.replaceAll(`{{${key}}}`, value);
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

class TopicModal extends Modal {
	topic: string;
	classFolder: string;
	articles: string[] = [];

	constructor(app: App) {
		super(app);
	}

	get titleTopic(): string {
		return this.topic.replace(/\s/g, "_");
	}

	get tagTopic(): string {
		return this.topic.toLocaleLowerCase().replace(/\s/g, "_");
	}

	get tagClass(): string {
		return this.classFolder.toLocaleLowerCase().replace(/\s/g, "_");
	}

	async getClassFolders(): Promise<Record<string, string>> {
		const { folders } = await this.app.vault.adapter.list("/");
		const classFolderObject = Object.fromEntries(
			folders.map((f) => [f, f])
		);

		// Remove unnecessary folders from the options
		delete classFolderObject[".obsidian"];
		delete classFolderObject["pdf"];

		return classFolderObject;
	}

	async getAnnotationArticles(): Promise<Record<string, string>> {
		const { files } = await this.app.vault.adapter.list("/pdf");
		const articlesObject = Object.fromEntries(
			files.map((f) => f.replace("pdf/", "")).map((f) => [f, f])
		);

		return articlesObject;
	}

	async onOpen() {
		const { contentEl } = this;

		new Setting(contentEl).setName("Topic").addText((text) =>
			text.onChange((value) => {
				this.topic = value;
			})
		);

		const classFolders = await this.getClassFolders();
		new Setting(contentEl).setName("Class").addDropdown((dropdown) => {
			dropdown.addOption("", "Select");
			dropdown.addOptions(classFolders);

			dropdown.onChange((value) => {
				this.classFolder = value;
			});
		});

		const articles = await this.getAnnotationArticles();
		new Setting(contentEl).setName("Articles").addDropdown((dropdown) => {
			dropdown.selectEl.multiple = true;
			dropdown.addOptions(articles);

			dropdown.onChange(() => {
				this.articles = Array.from(dropdown.selectEl.options)
					.filter((o) => o.selected)
					.map((o) => o.value);
			});
		});

		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText("Submit")
				.setCta()
				.onClick(() => {
					this.close();
					this.onSubmit();
				})
		);
	}

	onSubmit() {
		const topicProps: TopicProps = {
			titleTopic: this.titleTopic,
			tagTopic: this.tagTopic,
			tagClass: this.tagClass,
			pathArticles: this.articles.map((path) => {
				const title = path.slice(0, -4);
				return `${this.classFolder}/${this.titleTopic}/${title}_Annotated.md`;
			}),
		};
		const annotationProps: AnnotationProps[] = this.articles.map((path) => {
			const year = Number.parseInt(path.match(/[0-9]+/)![0]);

			return {
				titleArticle: path.slice(0, -4),
				fileArticle: path,
				tagYear: year,
				tagTopic: this.tagTopic,
				tagClass: this.tagClass,
			};
		});

		const pathObject = {
			[this.titleTopic]: {
				...canvasData(topicProps),
				...reactionPaperData(topicProps),
				...annotationsData(annotationProps),
			},
		};
		createFilesAndFolders(
			this.app.vault.adapter,
			pathObject,
			this.classFolder
		);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class AnnotationModal extends Modal {
	paperTitle: string;
	paperYear: number;
	tagClass: string;
	tagTopic: string;

	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;

		new Setting(contentEl).setName("Title").addText((text) =>
			text.onChange((value) => {
				this.paperTitle = value;
			})
		);

		new Setting(contentEl).setName("Year").addText((text) =>
			text.onChange((value) => {
				this.paperYear = Number.parseInt(value);
			})
		);

		new Setting(contentEl).setName("Class").addText((text) =>
			text.onChange((value) => {
				this.tagClass = value;
			})
		);

		new Setting(contentEl).setName("Topic").addText((text) =>
			text.onChange((value) => {
				this.tagTopic = value;
			})
		);

		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText("Submit")
				.setCta()
				.onClick(() => {
					this.close();
					this.onSubmit();
				})
		);
	}

	onSubmit() {
		const props = {
			tag_class: this.tagClass,
			tag_topic: this.tagTopic,
			paper_title: this.paperTitle,
			paper_year: this.paperYear,
		};
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

export { TopicModal, AnnotationModal };
