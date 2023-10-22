import { $getRoot, $isElementNode, $isTextNode, isHTMLElement } from "lexical";
import { LexicalEditor } from "lexical/LexicalEditor";
import { LexicalNode } from "lexical/LexicalNode";
import { GridSelection, NodeSelection, RangeSelection } from "lexical/LexicalSelection";

import { $cloneWithProperties, $sliceSelectedTextNodeContent } from "./lexical-node";

export function generateContent(editor: LexicalEditor): string {
	const editorState = editor.getEditorState();

	let htmlString = "";
	editorState.read(() => {
		htmlString = printPrettyHTML($generateHtmlFromNodes(editor));
	});
	return htmlString;
}

function printPrettyHTML(str: string) {
	const div = document.createElement("div");
	div.innerHTML = str.trim();
	return prettifyHTML(div, 0).innerHTML;
}

function prettifyHTML(node: Element, level: number) {
	const indentBefore = new Array(level++ + 1).join("  ");
	const indentAfter = new Array(level - 1).join("  ");
	let textNode;

	for (let i = 0; i < node.children.length; i++) {
		textNode = document.createTextNode("\n" + indentBefore);
		node.insertBefore(textNode, node.children[i]);
		prettifyHTML(node.children[i], level);
		if (node.lastElementChild === node.children[i]) {
			textNode = document.createTextNode("\n" + indentAfter);
			node.appendChild(textNode);
		}
	}

	return node;
}

export function $generateHtmlFromNodes(
	editor: LexicalEditor,
	selection?: RangeSelection | NodeSelection | GridSelection | null,
): string {
	if (typeof document === "undefined" || typeof window === "undefined") {
		throw new Error(
			"To use $generateHtmlFromNodes in headless mode please initialize a headless browser implementation such as JSDom before calling this function.",
		);
	}

	const container = document.createElement("div");
	const root = $getRoot();
	const topLevelChildren = root.getChildren();

	for (let i = 0; i < topLevelChildren.length; i++) {
		const topLevelNode = topLevelChildren[i];
		$appendNodesToHTML(editor, topLevelNode, container, selection);
	}

	return container.innerHTML;
}

function $appendNodesToHTML(
	editor: LexicalEditor,
	currentNode: LexicalNode,
	parentElement: HTMLElement | DocumentFragment,
	selection: RangeSelection | NodeSelection | GridSelection | null = null,
): boolean {
	let shouldInclude = selection != null ? currentNode.isSelected(selection) : true;
	const shouldExclude = $isElementNode(currentNode) && currentNode.excludeFromCopy("html");
	let target = currentNode;

	if (selection !== null) {
		let clone = $cloneWithProperties<LexicalNode>(currentNode);
		clone = $isTextNode(clone) && selection != null ? $sliceSelectedTextNodeContent(selection, clone) : clone;
		target = clone;
	}
	const children = $isElementNode(target) ? target.getChildren() : [];
	const registeredNode = editor._nodes.get(target.getType());
	let exportOutput;

	// Use HTMLConfig overrides, if available.
	// if (registeredNode && registeredNode.exportDOM !== undefined) {
	//   exportOutput = registeredNode.exportDOM(editor, target);
	// } else {
	//   exportOutput = target.exportDOM(editor);
	// }
	exportOutput = target.exportDOM(editor);

	const { element, after } = exportOutput;

	if (!element) {
		return false;
	}

	const fragment = document.createDocumentFragment();

	for (let i = 0; i < children.length; i++) {
		const childNode = children[i];
		const shouldIncludeChild = $appendNodesToHTML(editor, childNode, fragment, selection);

		if (
			!shouldInclude &&
			$isElementNode(currentNode) &&
			shouldIncludeChild &&
			currentNode.extractWithChild(childNode, selection, "html")
		) {
			shouldInclude = true;
		}
	}

	if (shouldInclude && !shouldExclude) {
		if (isHTMLElement(element)) {
			element.append(fragment);
		}
		parentElement.append(element);

		if (after) {
			const newElement = after.call(target, element);
			if (newElement) element.replaceWith(newElement);
		}
	} else {
		parentElement.append(fragment);
	}

	return shouldInclude;
}
