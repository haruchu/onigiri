import React, { memo, useCallback, useState } from "react";

type ButtonProps = {
	onClick: () => void;
};

//　通常の関数コンポーネント
const DecrementButton = ({ onClick }: ButtonProps) => {
	console.log("DecrementButtonが再描画されました");
	return <button onClick={onClick}>Decrement</button>;
};

// メモ化された関数コンポーネント
// eslint-disable-next-line react/display-name
const IncrementButton = memo(({ onClick }: ButtonProps) => {
	console.log("IncrementButtonが再描画されました");
	return <button onClick={onClick}>Increment</button>;
});

// メモ化された関数コンポーネント
// eslint-disable-next-line react/display-name
const DoubleButton = memo(({ onClick }: ButtonProps) => {
	console.log("DoubleButtonが再描画されました");
	return <button onClick={onClick}>Double</button>;
});

export const Counter = () => {
	const [count, setCount] = useState(0);

	const decrement = () => {
		setCount((c) => c - 1);
	};

	const increment = () => {
		setCount((c) => c + 1);
	};

	const double = useCallback(() => {
		setCount((c) => c * 2);
	}, []);

	return (
		<div>
			<p>Count: {count}</p>
			{/* 
				コンポーネントに関数を渡す 
			*/}
			<DecrementButton onClick={decrement} />
			{/* 
				メモ化コンポーネントに関数を渡す 
				渡す関数は通常の関数なので、親コンポーネントが再描画されると同様に再描画が行われる
				そのためメモ化コンポーネントに通常の関数を渡しても意味はなく、再描画される
			*/}
			<IncrementButton onClick={increment} />
			{/* 
				メモ化コンポーネントにメモ化した関数を渡す
				メモ化された関数は依存配列の中を比較し、関数を新しくするかを判断
				そのため、親が再描画されても、メモ化した関数は再描画されないので、渡されたメモ化コンポーネントも再描画されない
			*/}
			<DoubleButton onClick={double} />
		</div>
	);
};
