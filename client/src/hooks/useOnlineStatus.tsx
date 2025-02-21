import { useState, useEffect } from "react";

export const useOnlineStatus = (userId: number | undefined) => {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const checkStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(
          `http://localhost:5000/api/users/id/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setIsOnline(data.isOnline);
        }
      } catch (error) {
        console.error("Error checking online status:", error);
      }
    };

    // Verificación inicial
    checkStatus();

    // Verificar cada 5 segundos
    const intervalId = setInterval(checkStatus, 5000);

    return () => clearInterval(intervalId);
  }, [userId]);

  return isOnline;
};
