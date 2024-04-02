import { App, DataAdapter, DropdownComponent, Modal, Setting } from "obsidian";
import { AnnotationProps, TopicProps } from "./types";
import {
	createFilesAndFolders,
	canvasData,
	annotationsData,
	notesData,
} from "./utilities";

function objectMap<V1, V2>(
	object: Record<string, V1>,
	transform: (entry: [string, V1]) => [string, V2]
): Record<string, V2> {
	return Object.fromEntries(
		Object.entries<V1>(object).map((entry) => transform(entry))
	);
}

async function getSubFolders(
	path: string,
	adapter: DataAdapter,
	ignore: string[] = []
) {
	const { folders } = await adapter.list(path);
	const foldersObject = Object.fromEntries(folders.map((f) => [f, f]));

	ignore.forEach((item) => {
		delete foldersObject[item];
	});

	return foldersObject;
}

async function getFolderItems(
	path: string,
	adapter: DataAdapter,
	ignore: string[] = []
) {
	const { files } = await adapter.list(path);
	const filesObject = Object.fromEntries(
		files.map((f) => f.split("/").at(-1)).map((f) => [f, f])
	);

	ignore.forEach((item) => {
		delete filesObject[item];
	});

	return filesObject;
}

const IGNORE = [".obsidian", "pdf"];
async function getClassFolders(adapter: DataAdapter) {
	return getSubFolders("/", adapter, IGNORE);
}

async function getTopicFolders(path: string, adapter: DataAdapter) {
	return getSubFolders(path, adapter);
}

async function getArticles(adapter: DataAdapter) {
	return getFolderItems("/pdf", adapter);
}

class TopicModal extends Modal {
	topic: string;
	classFolder: string;
	articles: string[] = [];

	constructor(app: App) {
		super(app);
	}

	get titleTopic(): string {
		return this.topic.replace(/\s/g, "_").replace(/,|\//g, "");
	}

	get tagTopic(): string {
		return this.topic
			.toLocaleLowerCase()
			.replace(/\s/g, "_")
			.replace(/,|\//g, "");
	}

	get tagClass(): string {
		return this.classFolder
			.toLocaleLowerCase()
			.replace(/\s/g, "_")
			.replace(/,|\//g, "");
	}

	async onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h1", { text: "Generate Annotations" });

		new Setting(contentEl).setName("Topic").addText((text) =>
			text.onChange((value) => {
				this.topic = value;
			})
		);

		const classFolders = await getClassFolders(this.app.vault.adapter);
		new Setting(contentEl).setName("Class").addDropdown((dropdown) => {
			dropdown.addOption("", "Select");
			dropdown.addOptions(classFolders);

			dropdown.onChange((value) => {
				this.classFolder = value;
			});
		});

		const articles = await getArticles(this.app.vault.adapter);
		new Setting(contentEl)
			.setName("Articles")
			.setClass("multi-select")
			.addDropdown((dropdown) => {
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
				return `${this.classFolder}/${this.titleTopic}/${title}.md`;
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
				...notesData(topicProps),
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

class PaperModal extends Modal {
	topicFolder: string;
	classFolder: string;
	articles: string[] = [];

	constructor(app: App) {
		super(app);
	}

	get tagTopic(): string {
		return this.topicFolder
			.toLocaleLowerCase()
			.replace(/\s/g, "_")
			.replace(/,|\//g, "");
	}

	get tagClass(): string {
		return this.classFolder
			.toLocaleLowerCase()
			.replace(/\s/g, "_")
			.replace(/,|\//g, "");
	}

	async onOpen() {
		const { contentEl } = this;

		const self = this;
		let topicDropdown: DropdownComponent | undefined;
		async function resetTopicDropdown(newClassFolder: string) {
			if (!topicDropdown) {
				return;
			}

			const topicFolders = await getTopicFolders(
				newClassFolder,
				self.app.vault.adapter
			);
			topicDropdown.selectEl.empty();
			topicDropdown.setValue("");
			topicDropdown.addOption("", "Select");
			topicDropdown.addOptions(
				objectMap(topicFolders, ([, v]) => {
					const newV = v.split("/").at(-1)!;
					return [newV, newV];
				})
			);
		}

		contentEl.createEl("h1", { text: "Add Paper" });

		const classFolders = await getClassFolders(this.app.vault.adapter);
		new Setting(contentEl).setName("Class").addDropdown((dropdown) => {
			dropdown.addOption("", "Select");
			dropdown.addOptions(classFolders);

			dropdown.onChange((value) => {
				this.classFolder = value;
				resetTopicDropdown(value);
			});
		});

		new Setting(contentEl).setName("Topics").addDropdown((dropdown) => {
			topicDropdown = dropdown;
			dropdown.addOption("", "Select");

			dropdown.onChange((value) => {
				this.topicFolder = value;
			});
		});

		const articles = await getArticles(this.app.vault.adapter);
		new Setting(contentEl)
			.setName("Articles")
			.setClass("multi-select")
			.addDropdown((dropdown) => {
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
			[this.topicFolder]: {
				// ...canvasData(topicProps),
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

export { TopicModal, PaperModal };
