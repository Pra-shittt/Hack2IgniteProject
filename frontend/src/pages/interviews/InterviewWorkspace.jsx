import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { ArrowLeft, Video, VideoOff, Mic, MicOff, PhoneOff, Users, Monitor } from 'lucide-react';

export default function InterviewWorkspace() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const zpRef = useRef(null);
  const localVideoRef = useRef(null);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');

  const roomData = location.state;

  useEffect(() => {
    if (!roomData) return;
    const { roomId, userId, userName, zegoAppId, zegoServerSecret } = roomData;
    const serverSecret = zegoServerSecret || import.meta.env.VITE_ZEGO_SERVER_SECRET || '';

    const isRealZego = zegoAppId && serverSecret && zegoAppId !== 'your-zego-app-id' && serverSecret !== 'your-zego-server-secret';

    if (isRealZego && containerRef.current) {
      try {
        const appID = Number(zegoAppId);
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          roomId,
          userId,
          userName,
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zpRef.current = zp;

        zp.joinRoom({
          container: containerRef.current,
          sharedLinks: [],
          scenario: {
            mode: ZegoUIKitPrebuilt.OneONoneCall,
          },
          showScreenSharingButton: true,
          showPreJoinView: false,
          onLeaveRoom: () => {
            navigate(`/interviews/${id}`);
          },
        });
      } catch (err) {
        console.error('Zego initialization error:', err);
      }
    } else {
      // Local Camera WebRTC fallback for demo
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then(stream => {
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
              setCameraActive(true);
            }
          })
          .catch(err => {
            console.log('Camera preview permission note:', err.message);
            setCameraError('Camera access not granted or unavailable. Preview avatar mode active.');
          });
      }
    }

    return () => {
      if (zpRef.current) {
        try { zpRef.current.destroy(); } catch (e) {}
      }
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [roomData, id, navigate]);

  const toggleMic = () => {
    setIsMicOn(prev => !prev);
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getAudioTracks().forEach(track => {
        track.enabled = !isMicOn;
      });
    }
  };

  const toggleVideo = () => {
    setIsVideoOn(prev => !prev);
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.getVideoTracks().forEach(track => {
        track.enabled = !isVideoOn;
      });
    }
  };

  if (!roomData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem', background: '#0f172a', color: '#fff' }}>
        <h3>No interview room data found.</h3>
        <button
          onClick={() => navigate(`/interviews/${id}`)}
          style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}
        >
          Return to Interview Details
        </button>
      </div>
    );
  }

  const { zegoAppId, zegoServerSecret, roomId, userName } = roomData;
  const serverSecret = zegoServerSecret || import.meta.env.VITE_ZEGO_SERVER_SECRET || '';
  const isRealZego = zegoAppId && serverSecret && zegoAppId !== 'your-zego-app-id' && serverSecret !== 'your-zego-server-secret';

  if (!isRealZego) {
    return (
      <div style={{ minHeight: '100vh', background: '#090d16', display: 'flex', flexDirection: 'column', color: '#ffffff', fontFamily: 'system-ui, sans-serif' }}>
        {/* Top bar */}
        <div style={{ background: '#131b2e', borderBottom: '1px solid #1e293b', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => navigate(`/interviews/${id}`)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
            >
              <ArrowLeft size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
              <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.02em' }}>Live Technical Interview Room</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', background: '#1e293b', padding: '0.3rem 0.75rem', borderRadius: '9999px', fontFamily: 'monospace' }}>
              Session: {roomId ? roomId.slice(-10) : 'LIVE-INT'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#38bdf8' }}>
              <Users size={16} /> <span>2 Participants</span>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div style={{ flex: 1, padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', alignItems: 'stretch' }}>
          {/* Tile 1: Interviewer / Recruiter */}
          <div style={{
            background: '#131b2e',
            borderRadius: '1rem',
            border: '1px solid #1e293b',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '340px'
          }}>
            <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem', boxShadow: '0 8px 20px rgba(79, 70, 229, 0.4)' }}>
              IV
            </div>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>Technical Panelist</p>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>Senior Engineering Lead</p>

            <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', padding: '0.35rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Mic size={14} color="#22c55e" /> Interviewer (Host)
            </div>
          </div>

          {/* Tile 2: Candidate (Local camera preview) */}
          <div style={{
            background: '#131b2e',
            borderRadius: '1rem',
            border: '1px solid #1e293b',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '340px'
          }}>
            {isVideoOn ? (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
              />
            ) : null}

            {(!isVideoOn || !cameraActive) && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </div>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>{userName || 'Candidate'}</p>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                  {cameraError || (isVideoOn ? 'Connecting camera preview…' : 'Camera turned off')}
                </p>
              </div>
            )}

            <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', padding: '0.35rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {isMicOn ? <Mic size={14} color="#22c55e" /> : <MicOff size={14} color="#ef4444" />}
              {userName || 'You'} (Candidate)
            </div>
          </div>
        </div>

        {/* Floating Call Control Bar */}
        <div style={{ background: '#131b2e', borderTop: '1px solid #1e293b', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.25rem' }}>
          <button
            onClick={toggleMic}
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              border: 'none',
              background: isMicOn ? '#334155' : '#ef4444',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          <button
            onClick={toggleVideo}
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              border: 'none',
              background: isVideoOn ? '#334155' : '#ef4444',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            title={isVideoOn ? 'Stop Camera' : 'Start Camera'}
          >
            {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
          </button>

          <button
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              border: 'none',
              background: isScreenSharing ? '#4f46e5' : '#334155',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Toggle Screen Sharing"
          >
            <Monitor size={20} />
          </button>

          <button
            onClick={() => navigate(`/interviews/${id}`)}
            style={{
              height: '46px',
              padding: '0 1.5rem',
              borderRadius: '9999px',
              border: 'none',
              background: '#dc2626',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.9rem',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)'
            }}
          >
            <PhoneOff size={18} /> End Interview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0f172a' }} ref={containerRef} />
  );
}
