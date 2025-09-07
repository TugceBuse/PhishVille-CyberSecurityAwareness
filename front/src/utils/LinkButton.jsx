// components/LinkButton.jsx
import React from 'react';
import styles from './LinkButton.module.css'; 
import { useEventLog } from '../Contexts/EventLogContext';
import { useMailContext } from '../Contexts/MailContext';

const LinkButton = ({
  url,
  questId,
  type = "click_link",
  logEventType,
  value = 0,
  mailId,
  shippingCompany,
  trackingNo,
  orderNo
}) => {
  const { addEventLog } = useEventLog();
  const { selectedMail } = useMailContext();

  const handleClick = (e) => {
    e.preventDefault(); // Linkin dışarı yönlendirmesini engelle, oyun içi aç
    addEventLog({
      type: type,
      questId: questId,
      logEventType: logEventType,
      value,
      data: {
        app: "MailBox",
        mailId: mailId || selectedMail?.id,
        url
      }
    });

    // Oyun içi simülasyon tarayıcısında aç
    window.dispatchEvent(new CustomEvent("open-browser-url", {
      detail: {
        url,
        shippingCompany,
        trackingNo,
        orderNo,
      }
    }));
  };

  return (
    <div className={styles.attachmentBox}>
      <span className={styles.downloadIcon}>🔗</span>
      <a
        href={url}
        className={styles.linkText}
        onClick={handleClick}
        title={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ wordBreak: "break-all" }}
      >
        {url}
      </a>
    </div>
  );
};

export default LinkButton;
