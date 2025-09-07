import { useEffect, useState } from "react";

const ScreenFadeTransition = ({
  show,
  duration = 1000,         // Daha yavaş/soft için 1000 ms
  color = "rgba(0, 0, 0, 0.76)" // Yumuşak koyu mavi-siyah tonu
}) => {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    let timeout;
    if (show) {
      setVisible(true);
      timeout = setTimeout(() => setVisible(false), duration);
    }
    return () => clearTimeout(timeout);
  }, [show, duration]);

  if (!visible) return null;
  return (
    <div
      style={{
        position: "fixed",
        zIndex: 9999,
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        background: color,
        opacity: show ? 1 : 0,
        transition: `opacity ${duration}ms cubic-bezier(0.4,0,0.2,1)`,
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)"
      }}
    />
  );
};

export default ScreenFadeTransition;
