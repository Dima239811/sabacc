import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './AvailableRoomsPage.css';
import { selectCurrentUser } from '@/features/Auth/model/selectors/authSelector';
import Auth from '@/features/Auth/ui/Auth';

type RoomInfo = {
  id: number | string;
  status: string;
  playerFirstId: number | null;
  playerSecondId?: number | null;
};

const AvailableRoomsPage: React.FC = () => {
  console.log('AvailableRoomsPage рендерится');
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const [showAuth, setShowAuth] = useState(false);

  enum RoomStatus {
    WAITING_SECOND_USER = 'WAITING_SECOND_USER',
    PLAYER_DISCONNECTED = 'PLAYER_DISCONNECTED'
  }

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${__API__}/v1/room/all`)
      .then((res) => {
        const formattedRooms: RoomInfo[] = res.data.map((room: any) => ({
          id: room.id,
          status: room.status,
          playerFirstId: room.playerFirst?.id ?? null,
          playerSecondId: room.playerSecond?.id ?? null,
        }));

        setRooms(formattedRooms);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Ошибка загрузки комнат');
        setLoading(false);
      });
  }, []);

  const handleJoinRoom = (roomId: number | string) => {
    if (!currentUser) {
      setShowAuth(true);
      localStorage.setItem('redirectAfterLogin', `/in-game?roomId=${roomId}`);
      return;
    }
    navigate(`/in-game?roomId=${roomId}`);
  };

  return (
    <div className="rooms-container">
      {showAuth && <Auth />}
      <h2>Список комнат</h2>

      {loading && <div className="loading">Загрузка...</div>}
      {error && <div className="error">{error}</div>}
      {!loading && rooms.length === 0 && (
        <div className="no-rooms">Нет комнат</div>
      )}

      {!loading && rooms.length > 0 && (
        <table className="rooms-table">
          <thead>
            <tr>
              <th>ID комнаты</th>
              <th>ID первого игрока</th>
              <th>ID второго игрока</th>
              <th>Статус</th>
              <th>Действие</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id}>
                <td>{room.id}</td>
                <td>{room.playerFirstId ?? '—'}</td>
                <td>{room.playerSecondId ?? '—'}</td>
                <td>{room.status}</td>
                <td>
                  {(room.status === RoomStatus.WAITING_SECOND_USER || room.status === RoomStatus.PLAYER_DISCONNECTED ) && (
                    <button
                      className="join-button"
                      onClick={() => handleJoinRoom(room.id)}
                    >
                      Зайти
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AvailableRoomsPage;
