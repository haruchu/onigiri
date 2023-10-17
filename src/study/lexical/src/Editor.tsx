/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import * as React from "react";
import { useEffect, useState } from "react";

import { useSharedHistoryContext } from "./context/SharedHistoryContext";
import DragDropPaste from "./plugins/DragDropPastePlugin";
import FloatingLinkEditorPlugin from "./plugins/FloatingLinkEditorPlugin";
import ImagesPlugin from "./plugins/ImagesPlugin";
import InlineImagePlugin from "./plugins/InlineImagePlugin";
import LinkPlugin from "./plugins/LinkPlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import { CAN_USE_DOM } from "./shared/src/canUseDOM";
import ContentEditable from "./ui/ContentEditable";
import Placeholder from "./ui/Placeholder";
import "./index.css";

export default function Editor(): JSX.Element {
	const { historyState } = useSharedHistoryContext();
	const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);
	const [isSmallWidthViewport, setIsSmallWidthViewport] = useState<boolean>(false);
	const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);

	const placeholder = <Placeholder>入力してください</Placeholder>;

	const onRef = (_floatingAnchorElem: HTMLDivElement) => {
		if (_floatingAnchorElem !== null) {
			setFloatingAnchorElem(_floatingAnchorElem);
		}
	};

	useEffect(() => {
		const updateViewPortWidth = () => {
			const isNextSmallWidthViewport = CAN_USE_DOM && window.matchMedia("(max-width: 1025px)").matches;

			if (isNextSmallWidthViewport !== isSmallWidthViewport) {
				setIsSmallWidthViewport(isNextSmallWidthViewport);
			}
		};
		updateViewPortWidth();
		window.addEventListener("resize", updateViewPortWidth);

		return () => {
			window.removeEventListener("resize", updateViewPortWidth);
		};
	}, [isSmallWidthViewport]);

	return (
		<>
			<ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />
			<DragDropPaste />
			<HistoryPlugin externalHistoryState={historyState} />
			<RichTextPlugin
				contentEditable={
					<div className="editor-scroller">
						<div className="editor" ref={onRef}>
							<ContentEditable />
						</div>
					</div>
				}
				placeholder={placeholder}
				ErrorBoundary={LexicalErrorBoundary}
			/>
			<ImagesPlugin />
			<InlineImagePlugin />
			<LinkPlugin />
			{floatingAnchorElem && !isSmallWidthViewport && (
				<>
					<FloatingLinkEditorPlugin
						anchorElem={floatingAnchorElem}
						isLinkEditMode={isLinkEditMode}
						setIsLinkEditMode={setIsLinkEditMode}
					/>
				</>
			)}
		</>
	);
}
