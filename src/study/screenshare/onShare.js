export const onShare = () => {
    const mediaStreamConstraints = {
        video: true,
    };

    const localVideo = document.querySelector("video");
    localVideo.style.display = "block";

    function gotLocalMediaStream(mediaStream) {
        // const localStream = mediaStream;
        localVideo.srcObject = mediaStream;
    }

    function handleLocalMediaStreamError(error) {
        console.log("navigator.getUserMedia error: ", error);
    }

    const localVideoStream = navigator.mediaDevices
        .getDisplayMedia(mediaStreamConstraints)
        .then(gotLocalMediaStream)
        .catch(handleLocalMediaStreamError);
    localVideoStream.getTracks()[0].addEventListener("ended", () => {
        // ここで処理を記述
        console.log()
    });
}