
import React from 'react';

interface NotificationProps {
  message: string;
}

const Notification: React.FC<NotificationProps> = ({ message }) => {
  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 z-[3000] pointer-events-none p-4 w-full max-w-lg animate-notification">
      <div className="bg-green-500/20 backdrop-blur-3xl border-2 border-green-400/60 px-6 py-4 rounded-[30px] shadow-[0_0_60px_rgba(34,197,94,0.3)] flex items-center justify-between gap-6">
        <div className="h-12 w-12 bg-green-400 rounded-full flex items-center justify-center animate-pulse shrink-0">
           <i className="fa-solid fa-bell text-black text-xl"></i>
        </div>
        <div className="flex-1">
          <div className="text-green-400 text-xl font-black tracking-tighter uppercase leading-none mb-1">
            {message}
          </div>
          <div className="text-green-400/60 text-[0.6rem] tracking-[0.2em] font-bold uppercase">
            Service cart is approaching your row
          </div>
        </div>
        <div className="flex gap-2">
           <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
        </div>
      </div>
    </div>
  );
};

export default Notification;