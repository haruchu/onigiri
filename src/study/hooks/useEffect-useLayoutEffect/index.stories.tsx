import type { Meta, StoryObj } from "@storybook/react";

import { Component } from "./index";

const meta: Meta<typeof Component> = {
	title: "Study/Hooks/useEffect(useLayout)",
	component: Component,
};

export default meta;
type Story = StoryObj<typeof Component>;

export const Default: Story = {};
