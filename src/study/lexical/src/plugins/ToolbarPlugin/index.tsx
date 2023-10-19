/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
	$isCodeNode,
	CODE_LANGUAGE_FRIENDLY_NAME_MAP,
	CODE_LANGUAGE_MAP,
	getLanguageFriendlyName,
} from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
	$isListNode,
	INSERT_ORDERED_LIST_COMMAND,
	INSERT_UNORDERED_LIST_COMMAND,
	ListNode,
	REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createHeadingNode, $isHeadingNode, HeadingTagType } from "@lexical/rich-text";
import {
	$getSelectionStyleValueForProperty,
	$isParentElementRTL,
	$patchStyleText,
	$setBlocksType,
} from "@lexical/selection";
import { $isTableNode } from "@lexical/table";
import { $findMatchingParent, $getNearestNodeOfType, mergeRegister } from "@lexical/utils";
import {
	$createParagraphNode,
	$getNodeByKey,
	$getSelection,
	$isElementNode,
	$isRangeSelection,
	$isRootOrShadowRoot,
	CAN_REDO_COMMAND,
	CAN_UNDO_COMMAND,
	COMMAND_PRIORITY_CRITICAL,
	COMMAND_PRIORITY_NORMAL,
	DEPRECATED_$isGridSelection,
	ElementFormatType,
	FORMAT_ELEMENT_COMMAND,
	FORMAT_TEXT_COMMAND,
	INDENT_CONTENT_COMMAND,
	KEY_MODIFIER_COMMAND,
	LexicalEditor,
	NodeKey,
	OUTDENT_CONTENT_COMMAND,
	REDO_COMMAND,
	SELECTION_CHANGE_COMMAND,
	UNDO_COMMAND,
} from "lexical";
import { Dispatch, useCallback, useEffect, useState } from "react";
import * as React from "react";

import DropDown, { DropDownItem } from "../../ui/DropDown";
import DropdownColorPicker from "../../ui/DropdownColorPicker";
import { getSelectedNode } from "../../utils/getSelectedNode";
import { sanitizeUrl } from "../../utils/url";
import { IS_APPLE } from "../../shared/environment";
import { InsertImageDialog } from "../ImagesPlugin";
import useModal from "../../hooks/useModal";

const blockTypeToBlockName = {
	bullet: "Bulleted List",
	check: "Check List",
	code: "Code Block",
	h1: "Heading 1",
	h2: "Heading 2",
	h3: "Heading 3",
	number: "Numbered List",
	paragraph: "Normal",
	quote: "Quote",
};

const rootTypeToRootName = {
	root: "Root",
	table: "Table",
};

function getCodeLanguageOptions(): [string, string][] {
	const options: [string, string][] = [];

	for (const [lang, friendlyName] of Object.entries(CODE_LANGUAGE_FRIENDLY_NAME_MAP)) {
		options.push([lang, friendlyName]);
	}

	return options;
}

const CODE_LANGUAGE_OPTIONS = getCodeLanguageOptions();

const ELEMENT_FORMAT_OPTIONS: {
	[key in Exclude<ElementFormatType, "">]: {
		icon: string;
		iconRTL: string;
		name: string;
	};
} = {
	center: {
		icon: "center-align",
		iconRTL: "right-align",
		name: "Center Align",
	},
	end: {
		icon: "right-align",
		iconRTL: "left-align",
		name: "End Align",
	},
	justify: {
		icon: "justify-align",
		iconRTL: "justify-align",
		name: "Justify Align",
	},
	left: {
		icon: "left-align",
		iconRTL: "left-align",
		name: "Left Align",
	},
	right: {
		icon: "right-align",
		iconRTL: "left-align",
		name: "Right Align",
	},
	start: {
		icon: "left-align",
		iconRTL: "right-align",
		name: "Start Align",
	},
};

function dropDownActiveClass(active: boolean) {
	if (active) return "active dropdown-item-active";
	else return "";
}

function BlockFormatDropDown({
	editor,
	blockType,
	disabled = false,
}: {
	blockType: keyof typeof blockTypeToBlockName;
	rootType: keyof typeof rootTypeToRootName;
	editor: LexicalEditor;
	disabled?: boolean;
}): JSX.Element {
	const formatParagraph = () => {
		editor.update(() => {
			const selection = $getSelection();
			if ($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection)) {
				$setBlocksType(selection, () => $createParagraphNode());
			}
		});
	};

	const formatHeading = (headingSize: HeadingTagType) => {
		if (blockType !== headingSize) {
			editor.update(() => {
				const selection = $getSelection();
				if ($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection)) {
					$setBlocksType(selection, () => $createHeadingNode(headingSize));
				}
			});
		}
	};

	const formatBulletList = () => {
		if (blockType !== "bullet") {
			editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
		} else {
			editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
		}
	};

	const formatNumberedList = () => {
		if (blockType !== "number") {
			editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
		} else {
			editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
		}
	};

	return (
		<DropDown
			disabled={disabled}
			buttonClassName="toolbar-item block-controls"
			buttonIconClassName={"block-type " + blockType}
			buttonLabel={blockTypeToBlockName[blockType]}
			buttonAriaLabel="Formatting options for text style"
		>
			<DropDownItem className={"item " + dropDownActiveClass(blockType === "paragraph")} onClick={formatParagraph}>
				<i className="paragraph" />
				<span className="text">Normal</span>
			</DropDownItem>
			<DropDownItem className={"item " + dropDownActiveClass(blockType === "h1")} onClick={() => formatHeading("h1")}>
				<i className="h1" />
				<span className="text">Heading 1</span>
			</DropDownItem>
			<DropDownItem className={"item " + dropDownActiveClass(blockType === "h2")} onClick={() => formatHeading("h2")}>
				<i className="h2" />
				<span className="text">Heading 2</span>
			</DropDownItem>
			<DropDownItem className={"item " + dropDownActiveClass(blockType === "h3")} onClick={() => formatHeading("h3")}>
				<i className="h3" />
				<span className="text">Heading 3</span>
			</DropDownItem>
			<DropDownItem className={"item " + dropDownActiveClass(blockType === "bullet")} onClick={formatBulletList}>
				<i className="bullet-list" />
				<span className="text">Bullet List</span>
			</DropDownItem>
			<DropDownItem className={"item " + dropDownActiveClass(blockType === "number")} onClick={formatNumberedList}>
				<i className="numbered-list" />
				<span className="text">Numbered List</span>
			</DropDownItem>
		</DropDown>
	);
}

function Divider(): JSX.Element {
	return <div className="divider" />;
}

function ElementFormatDropdown({
	editor,
	value,
	isRTL,
	disabled = false,
}: {
	editor: LexicalEditor;
	value: ElementFormatType;
	isRTL: boolean;
	disabled: boolean;
}) {
	const formatOption = ELEMENT_FORMAT_OPTIONS[value || "left"];

	return (
		<DropDown
			disabled={disabled}
			buttonLabel={formatOption.name}
			buttonIconClassName={`${isRTL ? formatOption.iconRTL : formatOption.icon}`}
			buttonClassName="toolbar-item spaced alignment"
			buttonAriaLabel="Formatting options for text alignment"
		>
			<DropDownItem
				onClick={() => {
					editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
				}}
				className="item"
			>
				<i className="left-align" />
				<span className="text">Left Align</span>
			</DropDownItem>
			<DropDownItem
				onClick={() => {
					editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
				}}
				className="item"
			>
				<i className="center-align" />
				<span className="text">Center Align</span>
			</DropDownItem>
			<DropDownItem
				onClick={() => {
					editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
				}}
				className="item"
			>
				<i className="right-align" />
				<span className="text">Right Align</span>
			</DropDownItem>
			<DropDownItem
				onClick={() => {
					editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
				}}
				className="item"
			>
				<i className="justify-align" />
				<span className="text">Justify Align</span>
			</DropDownItem>
			<DropDownItem
				onClick={() => {
					editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "start");
				}}
				className="item"
			>
				<i className={`${isRTL ? ELEMENT_FORMAT_OPTIONS.start.iconRTL : ELEMENT_FORMAT_OPTIONS.start.icon}`} />
				<span className="text">Start Align</span>
			</DropDownItem>
			<DropDownItem
				onClick={() => {
					editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "end");
				}}
				className="item"
			>
				<i className={`${isRTL ? ELEMENT_FORMAT_OPTIONS.end.iconRTL : ELEMENT_FORMAT_OPTIONS.end.icon}`} />
				<span className="text">End Align</span>
			</DropDownItem>
			<Divider />
			<DropDownItem
				onClick={() => {
					editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
				}}
				className="item"
			>
				<i className={isRTL ? "indent" : "outdent"} />
				<span className="text">Outdent</span>
			</DropDownItem>
			<DropDownItem
				onClick={() => {
					editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
				}}
				className="item"
			>
				<i className={isRTL ? "outdent" : "indent"} />
				<span className="text">Indent</span>
			</DropDownItem>
		</DropDown>
	);
}

export default function ToolbarPlugin({ setIsLinkEditMode }: { setIsLinkEditMode: Dispatch<boolean> }): JSX.Element {
	const [editor] = useLexicalComposerContext();
	const [activeEditor, setActiveEditor] = useState(editor);
	const [blockType, setBlockType] = useState<keyof typeof blockTypeToBlockName>("paragraph");
	const [rootType, setRootType] = useState<keyof typeof rootTypeToRootName>("root");
	const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(null);
	const [modal, showModal] = useModal();

	const [fontColor, setFontColor] = useState<string>("#000");
	const [bgColor, setBgColor] = useState<string>("#fff");
	const [elementFormat, setElementFormat] = useState<ElementFormatType>("left");
	const [isLink, setIsLink] = useState(false);
	const [isBold, setIsBold] = useState(false);
	const [isItalic, setIsItalic] = useState(false);
	const [isUnderline, setIsUnderline] = useState(false);
	const [canUndo, setCanUndo] = useState(false);
	const [canRedo, setCanRedo] = useState(false);
	const [isRTL, setIsRTL] = useState(false);
	const [codeLanguage, setCodeLanguage] = useState<string>("");
	const [isEditable, setIsEditable] = useState(() => editor.isEditable());

	const $updateToolbar = useCallback(() => {
		const selection = $getSelection();
		if ($isRangeSelection(selection)) {
			const anchorNode = selection.anchor.getNode();
			let element =
				anchorNode.getKey() === "root"
					? anchorNode
					: $findMatchingParent(anchorNode, (e) => {
							const parent = e.getParent();
							return parent !== null && $isRootOrShadowRoot(parent);
					  });

			if (element === null) {
				element = anchorNode.getTopLevelElementOrThrow();
			}

			const elementKey = element.getKey();
			const elementDOM = activeEditor.getElementByKey(elementKey);

			// Update text format
			setIsBold(selection.hasFormat("bold"));
			setIsItalic(selection.hasFormat("italic"));
			setIsUnderline(selection.hasFormat("underline"));
			setIsRTL($isParentElementRTL(selection));

			// Update links
			const node = getSelectedNode(selection);
			const parent = node.getParent();
			if ($isLinkNode(parent) || $isLinkNode(node)) {
				setIsLink(true);
			} else {
				setIsLink(false);
			}

			const tableNode = $findMatchingParent(node, $isTableNode);
			if ($isTableNode(tableNode)) {
				setRootType("table");
			} else {
				setRootType("root");
			}

			if (elementDOM !== null) {
				setSelectedElementKey(elementKey);
				if ($isListNode(element)) {
					const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
					const type = parentList ? parentList.getListType() : element.getListType();
					setBlockType(type);
				} else {
					const type = $isHeadingNode(element) ? element.getTag() : element.getType();
					if (type in blockTypeToBlockName) {
						setBlockType(type as keyof typeof blockTypeToBlockName);
					}
					if ($isCodeNode(element)) {
						const language = element.getLanguage() as keyof typeof CODE_LANGUAGE_MAP;
						setCodeLanguage(language ? CODE_LANGUAGE_MAP[language] || language : "");
						return;
					}
				}
			}
			// Handle buttons
			setFontColor($getSelectionStyleValueForProperty(selection, "color", "#000"));
			setBgColor($getSelectionStyleValueForProperty(selection, "background-color", "#fff"));
			setElementFormat(($isElementNode(node) ? node.getFormatType() : parent?.getFormatType()) || "left");
		}
	}, [activeEditor]);

	useEffect(() => {
		return editor.registerCommand(
			SELECTION_CHANGE_COMMAND,
			(_payload, newEditor) => {
				$updateToolbar();
				setActiveEditor(newEditor);
				return false;
			},
			COMMAND_PRIORITY_CRITICAL,
		);
	}, [editor, $updateToolbar]);

	useEffect(() => {
		return mergeRegister(
			editor.registerEditableListener((editable) => {
				setIsEditable(editable);
			}),
			activeEditor.registerUpdateListener(({ editorState }) => {
				editorState.read(() => {
					$updateToolbar();
				});
			}),
			activeEditor.registerCommand<boolean>(
				CAN_UNDO_COMMAND,
				(payload) => {
					setCanUndo(payload);
					return false;
				},
				COMMAND_PRIORITY_CRITICAL,
			),
			activeEditor.registerCommand<boolean>(
				CAN_REDO_COMMAND,
				(payload) => {
					setCanRedo(payload);
					return false;
				},
				COMMAND_PRIORITY_CRITICAL,
			),
		);
	}, [$updateToolbar, activeEditor, editor]);

	useEffect(() => {
		return activeEditor.registerCommand(
			KEY_MODIFIER_COMMAND,
			(payload) => {
				const event: KeyboardEvent = payload;
				const { code, ctrlKey, metaKey } = event;

				if (code === "KeyK" && (ctrlKey || metaKey)) {
					event.preventDefault();
					if (!isLink) {
						setIsLinkEditMode(true);
					} else {
						setIsLinkEditMode(false);
					}
					return activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl("https://"));
				}
				return false;
			},
			COMMAND_PRIORITY_NORMAL,
		);
	}, [activeEditor, isLink, setIsLinkEditMode]);

	const applyStyleText = useCallback(
		(styles: Record<string, string>) => {
			activeEditor.update(() => {
				const selection = $getSelection();
				if ($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection)) {
					$patchStyleText(selection, styles);
				}
			});
		},
		[activeEditor],
	);

	const onFontColorSelect = useCallback(
		(value: string) => {
			applyStyleText({ color: value });
		},
		[applyStyleText],
	);

	const onBgColorSelect = useCallback(
		(value: string) => {
			applyStyleText({ "background-color": value });
		},
		[applyStyleText],
	);

	const insertLink = useCallback(() => {
		if (!isLink) {
			editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl("https://"));
		} else {
			editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
		}
	}, [editor, isLink]);

	const onCodeLanguageSelect = useCallback(
		(value: string) => {
			activeEditor.update(() => {
				if (selectedElementKey !== null) {
					const node = $getNodeByKey(selectedElementKey);
					if ($isCodeNode(node)) {
						node.setLanguage(value);
					}
				}
			});
		},
		[activeEditor, selectedElementKey],
	);

	return (
		<div className="toolbar">
			<button
				disabled={!canUndo || !isEditable}
				onClick={() => {
					activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
				}}
				title={IS_APPLE ? "Undo (⌘Z)" : "Undo (Ctrl+Z)"}
				type="button"
				className="toolbar-item spaced"
				aria-label="Undo"
			>
				<i className="undo" />
			</button>
			<button
				disabled={!canRedo || !isEditable}
				onClick={() => {
					activeEditor.dispatchCommand(REDO_COMMAND, undefined);
				}}
				title={IS_APPLE ? "Redo (⌘Y)" : "Redo (Ctrl+Y)"}
				type="button"
				className="toolbar-item"
				aria-label="Redo"
			>
				<i className="redo" />
			</button>
			<Divider />
			{blockType in blockTypeToBlockName && activeEditor === editor && (
				<>
					<BlockFormatDropDown disabled={!isEditable} blockType={blockType} rootType={rootType} editor={editor} />
					<Divider />
				</>
			)}
			{blockType === "code" ? (
				<DropDown
					disabled={!isEditable}
					buttonClassName="toolbar-item code-language"
					buttonLabel={getLanguageFriendlyName(codeLanguage)}
					buttonAriaLabel="Select language"
				>
					{CODE_LANGUAGE_OPTIONS.map(([value, name]) => {
						return (
							<DropDownItem
								className={`item ${dropDownActiveClass(value === codeLanguage)}`}
								onClick={() => onCodeLanguageSelect(value)}
								key={value}
							>
								<span className="text">{name}</span>
							</DropDownItem>
						);
					})}
				</DropDown>
			) : (
				<>
					<button
						disabled={!isEditable}
						onClick={() => {
							activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
						}}
						className={"toolbar-item spaced " + (isBold ? "active" : "")}
						title={IS_APPLE ? "Bold (⌘B)" : "Bold (Ctrl+B)"}
						type="button"
						aria-label={`Format text as bold. Shortcut: ${IS_APPLE ? "⌘B" : "Ctrl+B"}`}
					>
						<i className="bold" />
					</button>
					<button
						disabled={!isEditable}
						onClick={() => {
							activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
						}}
						className={"toolbar-item spaced " + (isItalic ? "active" : "")}
						title={IS_APPLE ? "Italic (⌘I)" : "Italic (Ctrl+I)"}
						type="button"
						aria-label={`Format text as italics. Shortcut: ${IS_APPLE ? "⌘I" : "Ctrl+I"}`}
					>
						<i className="italic" />
					</button>
					<button
						disabled={!isEditable}
						onClick={() => {
							activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
						}}
						className={"toolbar-item spaced " + (isUnderline ? "active" : "")}
						title={IS_APPLE ? "Underline (⌘U)" : "Underline (Ctrl+U)"}
						type="button"
						aria-label={`Format text to underlined. Shortcut: ${IS_APPLE ? "⌘U" : "Ctrl+U"}`}
					>
						<i className="underline" />
					</button>
					<button
						disabled={!isEditable}
						onClick={insertLink}
						className={"toolbar-item spaced " + (isLink ? "active" : "")}
						aria-label="Insert link"
						title="Insert link"
						type="button"
					>
						<i className="link" />
					</button>
					<DropdownColorPicker
						disabled={!isEditable}
						buttonClassName="toolbar-item color-picker"
						buttonAriaLabel="Formatting text color"
						buttonIconClassName="font-color"
						color={fontColor}
						onChange={onFontColorSelect}
						title="text color"
					/>
					<DropdownColorPicker
						disabled={!isEditable}
						buttonClassName="toolbar-item color-picker"
						buttonAriaLabel="Formatting background color"
						buttonIconClassName="bg-color"
						color={bgColor}
						onChange={onBgColorSelect}
						title="bg color"
					/>
				</>
			)}
			<Divider />
			<DropDown
				disabled={!isEditable}
				buttonClassName="toolbar-item spaced"
				buttonLabel="Insert"
				buttonAriaLabel="Insert specialized editor node"
				buttonIconClassName="icon plus"
			>
				<DropDownItem
					onClick={() => {
						showModal("Insert Image", (onClose: () => void) => (
							<InsertImageDialog activeEditor={activeEditor} onClose={onClose} />
						));
					}}
					className="item"
				>
					<i className="icon image" />
					<span className="text">Image</span>
				</DropDownItem>
				<DropDownItem
					onClick={() => {
						showModal("Insert Inline Image", (onClose: () => void) => (
							<InsertImageDialog activeEditor={activeEditor} onClose={onClose} />
						));
					}}
					className="item"
				>
					<i className="icon image" />
					<span className="text">Inline Image</span>
				</DropDownItem>
			</DropDown>
			<Divider />
			<ElementFormatDropdown disabled={!isEditable} value={elementFormat} editor={editor} isRTL={isRTL} />
			{modal}
		</div>
	);
}
