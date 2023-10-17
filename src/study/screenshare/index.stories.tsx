import type { Meta, StoryObj } from "@storybook/react";

import { Component } from "./screenshare";

const meta: Meta<typeof Component> = {
	title: "Study/screenshare",
	component: Component,
};

export default meta;
type Story = StoryObj<typeof Component>;

export const Default: Story = {};
