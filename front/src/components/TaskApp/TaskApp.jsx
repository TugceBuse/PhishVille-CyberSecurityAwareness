import React, { useEffect, useState } from 'react';
import './TaskApp.css';
import { useGameContext } from '../../Contexts/GameContext';
import { useQuestManager } from '../../Contexts/QuestManager';

const TaskApp = () => {
  const { getActiveQuests, isTaskAppInstalled } = useQuestManager();
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [openedDescId, setOpenedDescId] = useState(null);

  useEffect(() => {
    if (!isTaskAppInstalled) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        setVisible(true);
        setClosing(false);
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'Tab') {
        setClosing(true);
        setTimeout(() => {
          setVisible(false);
          setClosing(false);
        }, 400);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isTaskAppInstalled]);

  if (!isTaskAppInstalled || !visible) return null;

  const handleTaskClick = (id) => {
    setOpenedDescId(prev => (prev === id ? null : id));
  };

  // Sadece aktif quest'leri al
  const activeQuests = getActiveQuests();

  return (
    <div className={`task-app-container ${closing ? 'closing' : ''}`}>
      <div className="rotated-header">
        <button className="slide-close-button"></button>
        TaskApp
      </div>

      <div className="task-app-panel-content">
        <div className="task-icon-container">
          <div className="task-icon-wrapper">
            <img src="/icons/task-list.png" alt="Task List Icon" className="task-icon-img" />
            <span className="task-icon-badge">Yeni!</span>
          </div>
        </div>

        <div className="task-app-content">
          {activeQuests && activeQuests.length > 0 ? (
            <ul className="task-list">
              {activeQuests.map((quest) => (
                <React.Fragment key={quest.id}>
                  <li
                    className={`task-item active`}
                    title={quest.description}
                    onClick={() => handleTaskClick(quest.id)}
                    tabIndex={0}
                  >
                    <span className="task-status-dot"></span>
                    <span>{quest.title}</span>
                    <span className="task-status-label">Aktif</span>
                  </li>
                  {openedDescId === quest.id && (
                    <div className="task-desc-box">
                      <span>{quest.description}</span>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </ul>
          ) : (
            <p className="no-tasks">Aktif görevin yok!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskApp;
