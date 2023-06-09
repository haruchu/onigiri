import type { Meta, StoryObj } from "@storybook/react";

import { Counter } from "./index";

const meta: Meta<typeof Counter> = {
	title: "Study/Hooks/useCallback",
	component: Counter,
};

export default meta;
type Story = StoryObj<typeof Counter>;

export const Default: Story = {};
