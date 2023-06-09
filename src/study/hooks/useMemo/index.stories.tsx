import type { Meta, StoryObj } from "@storybook/react";

import { UseMemoSample } from "./index";

const meta: Meta<typeof UseMemoSample> = {
	title: "Study/Hooks/useMemo",
	component: UseMemoSample,
};

export default meta;
type Story = StoryObj<typeof UseMemoSample>;

export const Default: Story = {};
