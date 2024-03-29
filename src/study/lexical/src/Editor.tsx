/* eslint-disable import/order */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import parse from "html-react-parser";

import { useSharedHistoryContext } from "./context/SharedHistoryContext";
import { generateContent } from "./exportDOM";
import DragDropPaste from "./plugins/DragDropPastePlugin";
import FloatingLinkEditorPlugin from "./plugins/FloatingLinkEditorPlugin";
import ImagesPlugin from "./plugins/ImagesPlugin";
import InlineImagePlugin from "./plugins/InlineImagePlugin";
import LinkPlugin from "./plugins/LinkPlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import { CAN_USE_DOM } from "./shared/canUseDOM";
import ContentEditable from "./ui/ContentEditable";
import Placeholder from "./ui/Placeholder";
import "./index.css";
import FloatingTextFormatToolbarPlugin from "./plugins/FloatingTextFormatToolbarPlugin";
import { ListPlugin } from "./plugins/LexicalListPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

export default function Editor(): JSX.Element {
	const { historyState } = useSharedHistoryContext();
	const [editor] = useLexicalComposerContext();
	const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);
	const [isSmallWidthViewport, setIsSmallWidthViewport] = useState<boolean>(false);
	const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);
	const [content, setContent] = useState<string>("");
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
			<button
				onClick={() => {
					setContent(generateContent(editor));
				}}
			>
				出力
			</button>
			<ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />
			<div className={`editor-container`}>
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
				<HorizontalRulePlugin />
				<ImagesPlugin />
				<InlineImagePlugin />
				<LinkPlugin />
				<ListPlugin />
				{floatingAnchorElem && !isSmallWidthViewport && (
					<>
						<FloatingLinkEditorPlugin
							anchorElem={floatingAnchorElem}
							isLinkEditMode={isLinkEditMode}
							setIsLinkEditMode={setIsLinkEditMode}
						/>
						<FloatingTextFormatToolbarPlugin anchorElem={floatingAnchorElem} />
					</>
				)}
			</div>
			<div>{parse(content)}</div>
		</>
	);
}
