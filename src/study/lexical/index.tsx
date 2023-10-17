import { LexicalComposer } from "@lexical/react/LexicalComposer";
import Editor from "./src/Editor";
import Settings from "./src/Settings";
import { isDevPlayground } from "./src/appSettings";
import { useSettings } from "./src/context/SettingsContext";
import { SharedAutocompleteContext } from "./src/context/SharedAutocompleteContext";
import { SharedHistoryContext } from "./src/context/SharedHistoryContext";
import PlaygroundNodes from "./src/nodes/PlaygroundNodes";
import DocsPlugin from "./src/plugins/DocsPlugin";
import PasteLogPlugin from "./src/plugins/PasteLogPlugin";
import { TableContext } from "./src/plugins/TablePlugin";
import TestRecorderPlugin from "./src/plugins/TestRecorderPlugin";
import TypingPerfPlugin from "./src/plugins/TypingPerfPlugin";
import PlaygroundEditorTheme from "./src/themes/PlaygroundEditorTheme";


export const LexicalEditor = () => {
	const {
		settings: { isCollab, emptyEditor, measureTypingPerf },
	} = useSettings();
	const initialConfig = {
		editorState: null,
		namespace: "Playground",
		nodes: [...PlaygroundNodes],
		onError: (error: Error) => {
			throw error;
		},
		theme: PlaygroundEditorTheme,
	};
	return (
		<LexicalComposer initialConfig={initialConfig}>
			<SharedHistoryContext>
				<TableContext>
					<SharedAutocompleteContext>
					
						<div className="editor-shell">
							<Editor />
						</div>
						<Settings />
						{isDevPlayground ? <DocsPlugin /> : null}
						{isDevPlayground ? <PasteLogPlugin /> : null}
						{isDevPlayground ? <TestRecorderPlugin /> : null}

						{measureTypingPerf ? <TypingPerfPlugin /> : null}
					</SharedAutocompleteContext>
				</TableContext>
			</SharedHistoryContext>
		</LexicalComposer>
	);
};
