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
  playerFirstConnected: boolean;
  playerSecondConnected: boolean;
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
  }
  const isJoinable = (room: RoomInfo) => room.status === RoomStatus.WAITING_SECOND_USER;



  useEffect(() => {
    setLoading(true);
    axios.get(`${__API__}/v1/room/all`)
      .then(res => {
        // Форматируем комнаты
        const formattedRooms: RoomInfo[] = res.data.map((room: any) => ({
          id: room.id,
          status: room.status,
          playerFirstConnected: room.playerFirstConnected,
          playerSecondConnected: room.playerSecondConnected ?? false,
          playerSecondId: room.playerSecond?.id ?? null,
        }));

        // Оставляем только реально доступные для присоединения комнаты
        const availableRooms = formattedRooms.filter(room =>
          room.status === RoomStatus.WAITING_SECOND_USER &&
          (!room.playerSecondConnected && !room.playerSecondId)
        );

        setRooms(availableRooms);
        setLoading(false);
      })
      .catch(err => {
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
        <h2>Доступные комнаты</h2>

        {loading && <div className="loading">Загрузка...</div>}
        {error && <div className="error">{error}</div>}
        {!loading && rooms.length === 0 && <div className="no-rooms">Нет свободных комнат</div>}

        {!loading && rooms.length > 0 && (
          <table className="rooms-table">
            <thead>
              <tr>
                <th>ID комнаты</th>
                <th>Соперник (ID)</th>
                <th>Статус</th>
                <th>Действие</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(room => (
                <tr key={room.id}>
                  <td>{room.id}</td>
                  <td>{room.playerSecondId ?? '—'}</td>
                  <td>{room.status}</td>
                  <td>
                    {room.status === RoomStatus.WAITING_SECOND_USER ? (
                      <button className="join-button" onClick={() => handleJoinRoom(room.id)}>
                        Зайти
                      </button>
                    ) : null}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

// return (
//   <div style={{
//     position: 'relative',
//     zIndex: 9999,
//     background: 'red',
//     color: 'black',
//     padding: 50
//   }}>
//     TEST BLOCK — должен быть виден поверх всего
//   </div>
// );





export default AvailableRoomsPage;
