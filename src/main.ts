import { PaperModal, TopicModal } from "src/modals";
import { Plugin } from "obsidian";

export default class GeneratorUtils extends Plugin {
	async onload() {
		this.addCommand({
			id: "topic",
			name: "Topic",
			callback: () => {
				new TopicModal(this.app).open();
			},
		});

		this.addCommand({
			id: "paper",
			name: "Add Paper",
			callback: () => {
				new PaperModal(this.app).open();
			},
		});
	}

	onunload(): void {}
}
