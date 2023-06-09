import type { Meta, StoryObj } from "@storybook/react";

import { Parent } from "./index";

const meta: Meta<typeof Parent> = {
	title: "Study/Hooks/useContext",
	component: Parent,
};

export default meta;
type Story = StoryObj<typeof Parent>;

export const Default: Story = {};
