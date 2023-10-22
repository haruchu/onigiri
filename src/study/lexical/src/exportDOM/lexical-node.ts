/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {
	$isElementNode,
	$isRangeSelection,
	$isTextNode,
	DEPRECATED_$isGridSelection,
	ElementNode,
	GridSelection,
	LexicalNode,
	NodeSelection,
	RangeSelection,
	TextNode,
} from "lexical";

function $updateElementNodeProperties<T extends ElementNode>(target: T, source: ElementNode): T {
	target.__first = source.__first;
	target.__last = source.__last;
	target.__size = source.__size;
	target.__format = source.__format;
	target.__indent = source.__indent;
	target.__dir = source.__dir;
	return target;
}

function $updateTextNodeProperties<T extends TextNode>(target: T, source: TextNode): T {
	target.__format = source.__format;
	target.__style = source.__style;
	target.__mode = source.__mode;
	target.__detail = source.__detail;
	return target;
}

/**
 * Returns a copy of a node, but generates a new key for the copy.
 * @param node - The node to be cloned.
 * @returns The clone of the node.
 */
export function $cloneWithProperties<T extends LexicalNode>(node: T): T {
	const constructor = node.constructor;
	// @ts-expect-error
	const clone: T = constructor.clone(node);
	clone.__parent = node.__parent;
	clone.__next = node.__next;
	clone.__prev = node.__prev;

	if ($isElementNode(node) && $isElementNode(clone)) {
		return $updateElementNodeProperties(clone, node);
	}

	if ($isTextNode(node) && $isTextNode(clone)) {
		return $updateTextNodeProperties(clone, node);
	}

	return clone;
}

/**
 * Generally used to append text content to HTML and JSON. Grabs the text content and "slices"
 * it to be generated into the new TextNode.
 * @param selection - The selection containing the node whose TextNode is to be edited.
 * @param textNode - The TextNode to be edited.
 * @returns The updated TextNode.
 */
export function $sliceSelectedTextNodeContent(
	selection: RangeSelection | GridSelection | NodeSelection,
	textNode: TextNode,
): LexicalNode {
	if (
		textNode.isSelected() &&
		!textNode.isSegmented() &&
		!textNode.isToken() &&
		($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection))
	) {
		const anchorNode = selection.anchor.getNode();
		const focusNode = selection.focus.getNode();
		const isAnchor = textNode.is(anchorNode);
		const isFocus = textNode.is(focusNode);

		if (isAnchor || isFocus) {
			const isBackward = selection.isBackward();
			const [anchorOffset, focusOffset] = selection.getCharacterOffsets();
			const isSame = anchorNode.is(focusNode);
			const isFirst = textNode.is(isBackward ? focusNode : anchorNode);
			const isLast = textNode.is(isBackward ? anchorNode : focusNode);
			let startOffset = 0;
			let endOffset = undefined;

			if (isSame) {
				startOffset = anchorOffset > focusOffset ? focusOffset : anchorOffset;
				endOffset = anchorOffset > focusOffset ? anchorOffset : focusOffset;
			} else if (isFirst) {
				const offset = isBackward ? focusOffset : anchorOffset;
				startOffset = offset;
				endOffset = undefined;
			} else if (isLast) {
				const offset = isBackward ? anchorOffset : focusOffset;
				startOffset = 0;
				endOffset = offset;
			}

			textNode.__text = textNode.__text.slice(startOffset, endOffset);
			return textNode;
		}
	}
	return textNode;
}
