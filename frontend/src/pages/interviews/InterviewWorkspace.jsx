import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { ArrowLeft, Video } from 'lucide-react';

export default function InterviewWorkspace() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const containerRef = useRef(null);
  const zpRef = useRef(null);

  const roomData = location.state;

  useEffect(() => {
    if (!containerRef.current || !roomData) return;

    const { roomId, userId, userName, zegoAppId } = roomData;

    if (!zegoAppId) {
      // Show placeholder if ZEGO not configured
      return;
    }

    const appID = zegoAppId;
    const serverSecret = ''; // Token should come from backend in production
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
      showScreenSharingButton: false,
      showPreJoinView: false,
      onLeaveRoom: () => {
        navigate(`/interviews/${id}`);
      },
    });

    return () => {
      if (zpRef.current) {
        try { zpRef.current.destroy(); } catch (e) {}
      }
    };
  }, [roomData, id, navigate]);

  if (!roomData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16 }}>
        <h3>No room data found.</h3>
        <button className="btn btn-primary" onClick={() => navigate(`/interviews/${id}`)}>
          Go back to Interview Details
        </button>
      </div>
    );
  }

  const { zegoAppId, roomId, userName } = roomData;

  if (!zegoAppId) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', flexDirection: 'column' }}>
        {/* Header bar */}
        <div style={{ background: '#1e293b', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => navigate(`/interviews/${id}`)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
              <ArrowLeft size={20} />
            </button>
            <Video size={20} color="#f59e0b" />
            <span style={{ color: 'white', fontWeight: 600 }}>Interview Workspace</span>
          </div>
          <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Room: {roomId}</div>
        </div>

        {/* Placeholder content */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Video size={36} color="#f59e0b" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: 'white', fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>Interview Workspace</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: 400 }}>
              Welcome, <strong style={{ color: 'white' }}>{userName}</strong>.
            </p>
            <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: 8, maxWidth: 400 }}>
              ZEGO Cloud credentials are not configured. To enable live video, add ZEGO_APP_ID and ZEGO_SERVER_SECRET to your environment variables.
            </p>
          </div>

          <div style={{ background: '#1e293b', borderRadius: 12, padding: 24, maxWidth: 400, width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Connection Info</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Room ID</span>
              <span style={{ color: 'white', fontSize: '0.8rem', fontFamily: 'monospace' }}>{roomId?.slice(-12)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Participant</span>
              <span style={{ color: 'white', fontSize: '0.8rem' }}>{userName}</span>
            </div>
          </div>

          <button className="btn btn-ghost" onClick={() => navigate(`/interviews/${id}`)} style={{ color: '#94a3b8' }}>
            <ArrowLeft size={16} /> Return to Interview Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0f172a' }} ref={containerRef} />
  );
}
