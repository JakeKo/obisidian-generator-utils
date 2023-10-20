import {
	genId,
	createFilesAndFolders,
	hydrateTemplateString,
	annotationsData,
	canvasData,
	reactionPaperData,
	notesData,
} from "./utilities";

function mockDataAdapter() {
	return {
		getName: jest.fn(),
		exists: jest.fn(),
		stat: jest.fn(),
		list: jest.fn(),
		read: jest.fn(),
		readBinary: jest.fn(),
		write: jest.fn(),
		writeBinary: jest.fn(),
		append: jest.fn(),
		process: jest.fn(),
		getResourcePath: jest.fn(),
		mkdir: jest.fn(),
		trashSystem: jest.fn(),
		trashLocal: jest.fn(),
		rmdir: jest.fn(),
		remove: jest.fn(),
		rename: jest.fn(),
		copy: jest.fn(),
	};
}

describe("genId", () => {
	it("generates unique IDs", () => {
		const id1 = genId(16);
		const id2 = genId(16);

		expect(id1).not.toBe(id2);
	});
});

describe("hydrateTemplateString", () => {
	it("replaces single key in string", () => {
		const props = { hello: "Hello" };
		const template = "{{hello}} World!";

		const hydrated = hydrateTemplateString(template, props);
		expect(hydrated).toBe("Hello World!");
	});

	it("replaces multiple different keys in string", () => {
		const props = { hello: "Hello" };
		const template = "{{hello}} mother! {{hello}} father!";

		const hydrated = hydrateTemplateString(template, props);
		expect(hydrated).toBe("Hello mother! Hello father!");
	});

	it("relaces multiple different keys in string", () => {
		const props = { hello: "Hello", world: "World" };
		const template = "{{hello}} {{world}}! I love you!";

		const hydrated = hydrateTemplateString(template, props);
		expect(hydrated).toBe("Hello World! I love you!");
	});

	it("ignores extraneous template keys", () => {
		const props = { hello: "Hello" };
		const template = "{{hello}} {{world}}!";

		const hydrated = hydrateTemplateString(template, props);
		expect(hydrated).toBe("Hello {{world}}!");
	});

	it("ignores extraneous prop keys", () => {
		const props = { hello: "Hello", world: "World" };
		const template = "{{hello}} World!";

		const hydrated = hydrateTemplateString(template, props);
		expect(hydrated).toBe("Hello World!");
	});
});

describe("createFilesAndFolders", () => {
	it("creates a single file", () => {
		const adapter = mockDataAdapter();
		const pathObject = { "hello_world.txt": "Hello World!" };

		createFilesAndFolders(adapter, pathObject);

		expect(adapter.write).toHaveBeenCalledWith(
			"/hello_world.txt",
			"Hello World!"
		);
	});

	it("creates a single folder", () => {
		const adapter = mockDataAdapter();
		const pathObject = { folder: {} };

		createFilesAndFolders(adapter, pathObject);

		expect(adapter.mkdir).toHaveBeenCalledWith("/folder");
	});

	it("creates nothing", () => {
		const adapter = mockDataAdapter();
		const pathObject = {};

		createFilesAndFolders(adapter, pathObject);

		expect(adapter.write).not.toHaveBeenCalled();
		expect(adapter.mkdir).not.toHaveBeenCalled();
	});

	it("creates a single folder with a single file", () => {
		const adapter = mockDataAdapter();
		const pathObject = { folder: { "hello_world.txt": "Hello World!" } };

		createFilesAndFolders(adapter, pathObject);

		expect(adapter.mkdir).toHaveBeenCalledWith("/folder");
		expect(adapter.write).toHaveBeenCalledWith(
			"/folder/hello_world.txt",
			"Hello World!"
		);
	});

	it("creates a single folder with multiple files", () => {
		const adapter = mockDataAdapter();
		const pathObject = {
			folder: { "hello.txt": "Hello!", "world.txt": "World!" },
		};

		createFilesAndFolders(adapter, pathObject);

		expect(adapter.mkdir).toHaveBeenCalledWith("/folder");
		expect(adapter.write).toHaveBeenCalledWith(
			"/folder/hello.txt",
			"Hello!"
		);
		expect(adapter.write).toHaveBeenCalledWith(
			"/folder/world.txt",
			"World!"
		);
	});

	it("creates nested folders", () => {
		const adapter = mockDataAdapter();
		const pathObject = {
			folder1: { folder2: { "hello_world.txt": "Hello World!" } },
		};

		createFilesAndFolders(adapter, pathObject);

		expect(adapter.mkdir).toHaveBeenCalledWith("/folder1");
		expect(adapter.mkdir).toHaveBeenCalledWith("/folder1/folder2");
		expect(adapter.write).toHaveBeenCalledWith(
			"/folder1/folder2/hello_world.txt",
			"Hello World!"
		);
	});

	it("creates multiple folders and files", () => {
		const adapter = mockDataAdapter();
		const pathObject = {
			folder1: {
				folder2: { "file2.txt": "File 2", folder3: {} },
				"file1.txt": "File 1",
			},
		};

		createFilesAndFolders(adapter, pathObject);

		expect(adapter.mkdir).toHaveBeenCalledWith("/folder1");
		expect(adapter.mkdir).toHaveBeenCalledWith("/folder1/folder2");
		expect(adapter.mkdir).toHaveBeenCalledWith("/folder1/folder2/folder3");
		expect(adapter.write).toHaveBeenNthCalledWith(
			1,
			"/folder1/folder2/file2.txt",
			"File 2"
		);
		expect(adapter.write).toHaveBeenNthCalledWith(
			2,
			"/folder1/file1.txt",
			"File 1"
		);
	});
});
