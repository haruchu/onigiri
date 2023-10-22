import type { Meta, StoryObj } from "@storybook/react";
import { LexicalEditor } from ".";

const meta: Meta<typeof LexicalEditor> = {
	title: "Study/LexicalEditor",
	component: LexicalEditor,
};

export default meta;
type Story = StoryObj<typeof LexicalEditor>;

export const Default: Story = {};
