import {
	genId,
	createFilesAndFolders,
	hydrateTemplateString,
	annotationsData,
	canvasData,
	reactionPaperData,
	notesData,
} from "./utilities";

describe("genId", () => {
	it("generates unique IDs", () => {
		const id1 = genId();
		const id2 = genId();

		expect(id1).not.toBe(id2);
	});
});
