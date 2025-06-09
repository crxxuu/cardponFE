import { useVideo } from "@100mslive/react-sdk";

function Peer({ peer }) {
  const { videoRef } = useVideo({
    trackId: peer.videoTrack
  });
  return (
    <div className="w-full h-[50%] relative bg-black flex items-center justify-center">
     <video
        ref={videoRef}
       className="w-full h-full object-contain"
        autoPlay
        muted
        playsInline
      />
     <div className="absolute bottom-2 left-2 text-white text-sm bg-black/50 px-2 py-1 rounded">
        {peer.name} {peer.isLocal ? "(You)" : ""}
      </div>
</div>

    
  );
}

export default Peer;
