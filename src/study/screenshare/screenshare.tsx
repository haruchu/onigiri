export const Component = () => {
	const onShare = async () => {
		const mediaStreamConstraints = {
			video: true,
		};

		const localVideo = document.querySelector("video") as HTMLVideoElement;
		localVideo.style.display = "block";

		function gotLocalMediaStream(mediaStream: MediaProvider | null) {
			// const localStream = mediaStream;
			localVideo.srcObject = mediaStream;
		}

		const localVideoStream = await navigator.mediaDevices.getDisplayMedia(mediaStreamConstraints);
		gotLocalMediaStream(localVideoStream);
		localVideoStream.getTracks()[0].addEventListener("ended", () => {
			// ここで処理を記述
			localVideo.style.display = "none";
		});
	};

	return (
		<div>
			<button onClick={onShare}>画面共有</button>
			<video autoPlay playsInline hidden></video>
		</div>
	);
};
