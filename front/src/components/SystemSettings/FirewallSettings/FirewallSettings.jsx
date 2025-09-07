import styles from './FirewallSettings.module.css';
import { useSecurityContext } from '../../../Contexts/SecurityContext';
import { useEventLog } from '../../../Contexts/EventLogContext';

const FirewallSettings = ({ onClose }) => {
  const { 
    domainNetworkEnabled, 
    setDomainNetworkEnabled, 
    privateNetworkEnabled, 
    setPrivateNetworkEnabled, 
    publicNetworkEnabled, 
    setPublicNetworkEnabled
  } = useSecurityContext();

  const { addEventLogOnChange } = useEventLog(); // 🔔 Event log context'i ekle

  // Her biri için ayrı handler fonksiyonu:
  const handleDomainToggle = () => {
    const newValue = !domainNetworkEnabled;
    setDomainNetworkEnabled(newValue);
    addEventLogOnChange(
      "toggle_firewall_domain",
      "state",
      newValue,
      {
        type: "toggle_firewall_domain",
        questId: "firewall_settings", // quest varsa!
        logEventType: "firewall",
        value: newValue ? 5 : -5,
        data: {
          profile: "domain",
          state: newValue,
        }
      }
    );
  };

  const handlePrivateToggle = () => {
    const newValue = !privateNetworkEnabled;
    setPrivateNetworkEnabled(newValue);
    addEventLogOnChange(
      "toggle_firewall_private",
      "state",
      newValue,
      {
        type: "toggle_firewall_private",
        questId: "firewall_settings",
        logEventType: "firewall",
        value: newValue ? 5 : -5,
        data: {
          profile: "private",
          state: newValue,
        }
      }
    );
  };

  const handlePublicToggle = () => {
    const newValue = !publicNetworkEnabled;
    setPublicNetworkEnabled(newValue);
    addEventLogOnChange(
      "toggle_firewall_public",
      "state",
      newValue,
      {
        type: "toggle_firewall_public",
        questId: "firewall_settings",
        logEventType: "firewall",
        value: newValue ? 5 : -5,
        data: {
          profile: "public",
          state: newValue,
        }
      }
    );
  };

  return (
     <div className={styles.firewallContainer}>
      <div className={styles.header}>
        <img src="/icons/firewall.png" alt="Firewall Icon" className={styles.headerIcon} />
        <b>Güvenlik Duvarı Ayarları</b>
      </div>
      <div className={styles.body}>
        <h4 className={styles.sectionTitle}>Ağ Profilleri</h4>

        <div className={styles.networkGroup}>
          <span className={styles.networkLabel}>🏢 Etki Alanı Ağı</span>
          <label className={styles.switchLabel}>
            <input
              type="checkbox"
              checked={domainNetworkEnabled}
              onChange={handleDomainToggle}
              className={styles.switchInput}
            />
            <span className={styles.switchSlider}></span>
            <span className={domainNetworkEnabled ? styles.on : styles.off}>
              {domainNetworkEnabled ? "AÇIK" : "KAPALI"}
            </span>
          </label>
          <hr className={styles.divider} />
          <p className={styles.info}>
            Güvenlik duvarı, bilgisayarınızı ağ trafiğini kontrol ederek izinsiz bağlantılardan korur.<br />
            <span className={domainNetworkEnabled ? styles.safe : styles.danger}>
              {domainNetworkEnabled
                ? "Koruma aktif. Cihazınız güvende."
                : "Kapalı! Cihazınız saldırılara açık."}
            </span>
          </p>
        </div>

        <div className={styles.networkGroup}>
          <span className={styles.networkLabel}>🏠 Özel Ağ</span>
          <label className={styles.switchLabel}>
            <input
              type="checkbox"
              checked={privateNetworkEnabled}
              onChange={handlePrivateToggle}
              className={styles.switchInput}
            />
            <span className={styles.switchSlider}></span>
            <span className={privateNetworkEnabled ? styles.on : styles.off}>
              {privateNetworkEnabled ? "AÇIK" : "KAPALI"}
            </span>          
          </label>
          <hr className={styles.divider} />
          <p className={styles.info}>
            Güvenlik duvarı, bilgisayarınızı ağ trafiğini kontrol ederek izinsiz bağlantılardan korur.<br />
            <span className={privateNetworkEnabled ? styles.safe : styles.danger}>
              {privateNetworkEnabled
                ? "Koruma aktif. Cihazınız güvende."
                : "Kapalı! Cihazınız saldırılara açık."}
            </span>
          </p>
        </div>

        <div className={styles.networkGroup}>
          <span className={styles.networkLabel}>🌐 Ortak Ağ</span>
          <label className={styles.switchLabel}>
            <input
              type="checkbox"
              checked={publicNetworkEnabled}
              onChange={handlePublicToggle}
              className={styles.switchInput}
            />
            <span className={styles.switchSlider}></span>
            <span className={publicNetworkEnabled ? styles.on : styles.off}>
              {publicNetworkEnabled ? "AÇIK" : "KAPALI"}
            </span>
          </label>
          <hr className={styles.divider} />
          <p className={styles.info}>
          Güvenlik duvarı, bilgisayarınızı ağ trafiğini kontrol ederek izinsiz bağlantılardan korur.<br />
          <span className={publicNetworkEnabled ? styles.safe : styles.danger}>
            {publicNetworkEnabled
              ? "Koruma aktif. Cihazınız güvende."
              : "Kapalı! Cihazınız saldırılara açık."}
          </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FirewallSettings;
