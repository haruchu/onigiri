import React, { useReducer } from "react";

type ActionType = "DECREMENT" | "INCREMENT" | "DOUBLE" | "RESET";

const reducer = (currentCount: number, action: ActionType) => {
	switch (action) {
		case "INCREMENT":
			return currentCount + 1;
		case "DECREMENT":
			return currentCount - 1;
		case "DOUBLE":
			return currentCount * 2;
		case "RESET":
			return 0;
		default:
			return currentCount;
	}
};

type CunterProps = {
	initalValue: number;
};

export const Counter = ({ initalValue }: CunterProps) => {
	const [count, dispatch] = useReducer(reducer, initalValue);

	return (
		<div>
			<p>Count: {count}</p>
			<button onClick={() => dispatch("DECREMENT")}>-</button>
			<button onClick={() => dispatch("INCREMENT")}>+</button>
			<button onClick={() => dispatch("DOUBLE")}>×2</button>
			<button onClick={() => dispatch("RESET")}>Reset</button>
		</div>
	);
};
