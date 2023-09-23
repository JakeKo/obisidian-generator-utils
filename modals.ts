import { App, DataAdapter, Modal, Setting } from "obsidian";
import {
	ANNOTATION_CONTENT,
	ANNOTATION_TITLE,
	CANVAS_TITLE,
	CANVAS_CONTENT,
	PAPER_TITLE,
	PAPER_CONTENT,
} from "templates";

type TopicProps = {
	topic_title: string;
	tag_class: string;
};

type AnnotationProps = {
	paper_title: string;
	paper_year: number;
	tag_class: string;
};

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
	const canvasTitle = hydrateTemplateString(CANVAS_TITLE, props);
	const canvasContent = hydrateTemplateString(CANVAS_CONTENT, props);
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
	annotationsPaths: string[] = [];

	constructor(app: App) {
		super(app);
	}

	get topicTitle(): string {
		return this.topic.replace(/\s/g, "_");
	}

	get tagClass(): string {
		return this.classFolder.replace(/\s/g, "_");
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

			dropdown.onChange((value) => {
				this.annotationsPaths = [value];
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
			topic_title: this.topicTitle,
			tag_class: this.tagClass,
		};
		const annotationProps: AnnotationProps[] = this.annotationsPaths.map(
			(path) => {
				const year = Number.parseInt(path.match(/[0-9]+/)![0]);

				return {
					paper_title: path.slice(0, -4),
					paper_year: year,
					tag_class: this.tagClass,
				};
			}
		);

		const pathObject = {
			[this.topicTitle]: {
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
