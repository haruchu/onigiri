import { useRef, useState } from "react";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const UPLOAD_DELAY = 5000;

export const ImageUploader = () => {
	// 隠されたinput要素にアクセスするためのref
	const inputImageRef = useRef<HTMLInputElement | null>(null);

	// 選択されたファイルデータを保持するref
	const fileRef = useRef<File | null>(null);

	const [message, setMessage] = useState<string>("");

	// 画像をアプロードというテキストがクリックされた時のコールバック
	const onClickText = () => {
		if (inputImageRef.current !== null) {
			// inputのＤＯＭにアクセスして、クリックイベントを発火
			inputImageRef.current.click();
		}
	};

	// ファイルが選択された後に呼ばれるコールバック
	const onChangeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files !== null && files.length > 0) {
			// fileRef.currentに値を保存する
			// fileRefmcurrentが変化しても再描画は発生しない
			fileRef.current = files[0];
		}
	};

	// アップロードボタンがクリックされたときに呼ばれるコールバック
	const onClickUpload = async () => {
		if (fileRef.current !== null) {
			// 通常はここでＡＰＩを呼んで、ファイルをサーバーにアップロードする
			// ここでは疑似的に一定時間待つ
			await sleep(UPLOAD_DELAY);
			setMessage(`${fileRef.current.name} has been successfully upload`);
		}
	};

	return (
		<div>
			<p style={{ textDecoration: "underline" }} onClick={onClickText}>
				画像をアップロード
			</p>
			<input
				ref={inputImageRef}
				type="file"
				accept="image/*"
				onChange={onChangeImage}
				style={{ visibility: "hidden" }}
			/>
			<br />
			<button onClick={onClickUpload}>アップロードする</button>
			{message != "" && <p>{message}</p>}
		</div>
	);
};
