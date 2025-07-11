import { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export const useNotificationSocket = (userId, onNewNotification) => {
  const stompClientRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    let stompClient;
    let socket;

    function connect() {
      socket = new SockJS('http://localhost:8080/network/ws/chat');
      stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        onConnect: () => {
          stompClient.subscribe(`/topic/notification/${userId}`, (message) => {
            console.log('Nhận notification real-time:', new Date(), message.body);
            if (onNewNotification) onNewNotification(JSON.parse(message.body));
          });
        },
      });
      stompClient.activate();
      stompClientRef.current = stompClient;
    }

    connect();

    return () => {
      if (stompClientRef.current) stompClientRef.current.deactivate();
    };
  }, [userId, onNewNotification]);
}; 