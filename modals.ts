import { App, Modal, Setting } from "obsidian";
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

function hydrateTemplateString(template: string, props: Record<string, any>) {
	const entries = Object.entries(props);
	let hydratedTemplate = template;

	entries.forEach((prop) => {
		const [key, value] = prop;
		hydratedTemplate = hydratedTemplate.replaceAll(`{{${key}}}`, value);
	});

	return hydratedTemplate;
}

function generateTopicFolder(props: TopicProps, path = "") {
	const topicPath = path + props.topic_title;
	this.app.vault.adapter.mkdir(topicPath);
}

function generateAnnotations(props: AnnotationProps, path = "") {
	const noteTitle = hydrateTemplateString(ANNOTATION_TITLE, props);
	const noteContent = hydrateTemplateString(ANNOTATION_CONTENT, props);
	const notePath = path + noteTitle;

	this.app.vault.adapter.write(notePath, noteContent);
}

function generateCanvas(props: TopicProps, path = "") {
	const canvasTitle = hydrateTemplateString(CANVAS_TITLE, props);
	const canvasContent = hydrateTemplateString(CANVAS_CONTENT, props);
	const canvasPath = path + canvasTitle;

	this.app.vault.adapter.write(canvasPath, canvasContent);
}

function generateReactionPaper(props: TopicProps, path = "") {
	const paperTitle = hydrateTemplateString(PAPER_TITLE, props);
	const paperContent = hydrateTemplateString(PAPER_CONTENT, props);
	const paperPath = path + paperTitle;

	this.app.vault.adapter.write(paperPath, paperContent);
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
		const props: TopicProps = {
			topic_title: this.topicTitle,
			tag_class: this.tagClass,
		};

		const topicFolderPath = this.classFolder + "/" + this.topicTitle + "/";
		generateTopicFolder(props, this.classFolder + "/");
		generateCanvas(props, topicFolderPath);
		generateReactionPaper(props, topicFolderPath);

		// TODO: Create annotations
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

		generateAnnotations(props);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

export { TopicModal, AnnotationModal };
