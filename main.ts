import { App, Modal, Plugin, Setting } from "obsidian";

const ANNOTATION_TITLE = `{{paper_title}}_{{paper_year}}_Annotated`;
const ANNOTATION_TEMPLATE = `---
annotation-target: {{paper_title}}_{{paper_year}}.pdf
authors:
  - Koperski, Jake
year: {{paper_year}}
tags:
  - type/annotation
  - class/{{tag_class}}
  - topic/{{tag_topic}}
---`;

function hydrateTemplateString(template: string, props: Record<string, any>) {
	const entries = Object.entries(props);
	let hydratedTemplate = template;

	entries.forEach((prop) => {
		const [key, value] = prop;
		hydratedTemplate = hydratedTemplate.replaceAll(`{{${key}}}`, value);
	});

	return hydratedTemplate;
}

function generateAnnotations(props: Record<string, any>) {
	const noteTitle = hydrateTemplateString(ANNOTATION_TITLE, props);
	const noteContent = hydrateTemplateString(ANNOTATION_TEMPLATE, props);
	this.app.vault.adapter.write(`${noteTitle}.md`, noteContent);
}

export default class GeneratorUtils extends Plugin {
	async onload() {
		this.addCommand({
			id: "annotation",
			name: "Annotation",
			callback: () => {
				new SampleModal(this.app).open();
			},
		});
	}

	onunload(): void {}
}

class SampleModal extends Modal {
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
