import type { Meta, StoryObj } from "@storybook/react";

import { ImageUploader } from "./index";

const meta: Meta<typeof ImageUploader> = {
	title: "Study/Hooks/useRef",
	component: ImageUploader,
};

export default meta;
type Story = StoryObj<typeof ImageUploader>;

export const Default: Story = {};
