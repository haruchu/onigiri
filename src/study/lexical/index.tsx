import { LexicalComposer } from "@lexical/react/LexicalComposer";
import Editor from "./src/Editor";
import { SharedHistoryContext } from "./src/context/SharedHistoryContext";
import PlaygroundNodes from "./src/nodes/PlaygroundNodes";
import EditorTheme from "./src/themes/EditorTheme";

export const LexicalEditor = () => {
	const initialConfig = {
		editorState: null,
		namespace: "Playground",
		nodes: [...PlaygroundNodes],
		onError: (error: Error) => {
			throw error;
		},
		theme: EditorTheme,
	};
	return (
		<LexicalComposer initialConfig={initialConfig}>
			<SharedHistoryContext>
				<div className="editor-shell">
					<Editor />
				</div>
			</SharedHistoryContext>
		</LexicalComposer>
	);
};
