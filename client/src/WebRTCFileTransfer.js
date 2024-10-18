import React, { useRef, useState } from 'react';

const WebRTCFileTransfer = () => {
  const localConnection = useRef(null);
  const remoteConnection = useRef(null);
  const sendChannel = useRef(null);
  const receiveChannel = useRef(null);
  const fileReader = useRef(null);
  
  const fileInputRef = useRef(null);
  const [downloadLink, setDownloadLink] = useState(null);
  
  const CHUNK_SIZE = 16384; // Dosya transferi için parça büyüklüğü
  let fileName = '';
  let fileSize = 0;

  // WebRTC bağlantısı kurma
  const createConnection = () => {
    const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] };

    localConnection.current = new RTCPeerConnection(configuration);
    console.log("localConnection",JSON.stringify(localConnection.current, null, 2));
    
    sendChannel.current = localConnection.current.createDataChannel('sendDataChannel');
    sendChannel.current.binaryType = 'arraybuffer'; // Dosya gönderimi için binary mode

    // sendChannel açık olduğunda çağrılacak onopen event'i
    sendChannel.current.onopen = () => {
      console.log('Send channel is open!');
      sendFile(); // Kanal açıldığında dosyayı gönder
    };

    sendChannel.current.onclose = () => {
      console.log('Send channel is closed');
    };

    localConnection.current.onicecandidate = (e) => {
      if (e.candidate) {
        remoteConnection.current.addIceCandidate(e.candidate);
      }
    };

    remoteConnection.current = new RTCPeerConnection(configuration);
    remoteConnection.current.onicecandidate = (e) => {
      if (e.candidate) {
        localConnection.current.addIceCandidate(e.candidate);
      }
    };

    remoteConnection.current.ondatachannel = receiveChannelCallback;

    localConnection.current.createOffer().then((offer) => {
      localConnection.current.setLocalDescription(offer);
      remoteConnection.current.setRemoteDescription(offer);
      return remoteConnection.current.createAnswer();
    }).then((answer) => {
      remoteConnection.current.setLocalDescription(answer);
      localConnection.current.setRemoteDescription(answer);
    });
  };

  // Alıcı tarafın data channel işlemi
  const receiveChannelCallback = (event) => {
    receiveChannel.current = event.channel;
    receiveChannel.current.binaryType = 'arraybuffer';
    let receivedBuffer = [];
    let receivedSize = 0;

    receiveChannel.current.onmessage = (event) => {
      receivedBuffer.push(event.data);
      receivedSize += event.data.byteLength;

      // Tüm dosya parçaları alındığında birleştir ve indir
      if (receivedSize === fileSize) {
        const receivedBlob = new Blob(receivedBuffer);
        const downloadUrl = URL.createObjectURL(receivedBlob);
        setDownloadLink(downloadUrl);
      }
    };
  };

  // Dosyayı parçalara ayırarak gönderme işlemi
  const sendFile = () => {
    const file = fileInputRef.current.files[0];
    fileName = file.name;
    fileSize = file.size;

    fileReader.current = new FileReader();
    let offset = 0;

    const readSlice = (o) => {
      const slice = file.slice(o, o + CHUNK_SIZE);
      fileReader.current.readAsArrayBuffer(slice);
    };

    fileReader.current.onload = (e) => {
      if (sendChannel.current.readyState === 'open') {
        sendChannel.current.send(e.target.result);
        offset += e.target.result.byteLength;

        if (offset < file.size) {
          readSlice(offset);
        }
      }
    };

    readSlice(0); // İlk dosya parçasını oku ve gönder
  };

  // Butona tıklama olayları
  const handleSendFile = () => {
    createConnection();
  };

  return (
    <div>
      <h2>WebRTC File Transfer</h2>
      <input type="file" ref={fileInputRef} />
      <button onClick={handleSendFile}>Send File</button>

      {downloadLink && (
        <div>
          <h3>Download Received File</h3>
          <a href={downloadLink} download={fileName}>
            Click to Download
          </a>
        </div>
      )}
    </div>
  );
};

export default WebRTCFileTransfer;
