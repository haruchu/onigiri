import React, { useMemo, useState } from "react";

export const UseMemoSample = () => {
	const [text, setText] = useState("");
	const [items, setItems] = useState<string[]>([]);

	const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setText(e.target.value);
	};

	const onClickButton = () => {
		setItems((prevItems) => {
			return [...prevItems, text];
		});
		setText("");
	};

	// inputに文字を入力するときでも描画される
	const numberOfCharacters1 = items?.reduce((sub, item) => sub + item.length, 0);

	// itemsが新しくなった時だけ、関数を実行してメモを更新
	const numberOfCharacters2 = useMemo(() => {
		return items?.reduce((sub, item) => sub + item.length, 0);
	}, [items]);

	return (
		<div>
			<p>UseMemoSample</p>
			<div>
				<input value={text} onChange={onChangeInput} />
				<button onClick={onClickButton}>add</button>
			</div>
			<div>
				{items.map((item, index) => (
					<p key={index}>{item}</p>
				))}
			</div>
			<div>
				<p>Total Number of Chareacters 1: {numberOfCharacters1}</p>
				<p>Total Number of Chareacters 2: {numberOfCharacters2}</p>
			</div>
		</div>
	);
};
