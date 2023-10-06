import { TopicModal } from "src/modals";
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
	}

	onunload(): void {}
}
