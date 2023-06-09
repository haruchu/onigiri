import { useEffect, useLayoutEffect, useState } from "react";

export const Component = () => {
	const [text1, setText1] = useState("デフォルトデフォルトデフォルトデフォルトデフォルトデフォルト");
	const [text2, setText2] = useState("デフォルトデフォルトデフォルトデフォルトデフォルトデフォルト");

	useEffect(() => {
		setText1("useEffectで更新");
	}, []);

	useLayoutEffect(() => {
		setText2("useLayoutEffectで更新");
	}, []);

	return (
		<div>
			<p>useStateで更新: {text1}</p>
			<p>useLayoutStateで更新: {text2}</p>
		</div>
	);
};
