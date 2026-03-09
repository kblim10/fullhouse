import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HiChevronDown, HiCheck } from 'react-icons/hi';

export default function Dropdown({ value, onChange, options = [], placeholder = 'Pilih...', className = '', size = 'md' }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, direction: 'down' });
  const ref = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target) && listRef.current && !listRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Calculate position when opening
  const updatePos = () => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const direction = spaceBelow < 240 ? 'up' : 'down';
    setPos({
      top: direction === 'down' ? rect.bottom + 6 : rect.top - 6,
      left: rect.left,
      width: rect.width,
      direction,
    });
  };

  useEffect(() => {
    if (open) {
      updatePos();
      const onScroll = () => updatePos();
      window.addEventListener('scroll', onScroll, true);
      window.addEventListener('resize', onScroll);
      return () => { window.removeEventListener('scroll', onScroll, true); window.removeEventListener('resize', onScroll); };
    }
  }, [open]);

  // Scroll selected item into view when opening
  useEffect(() => {
    if (open && listRef.current) {
      const activeEl = listRef.current.querySelector('[data-active="true"]');
      if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [open]);

  const selected = options.find(o => String(o.value) === String(value));
  const sizeClasses = size === 'sm' ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm';
  const itemClasses = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';

  const handleToggle = () => {
    if (!open) updatePos();
    setOpen(!open);
  };

  const dropdownList = open && createPortal(
    <div
      ref={listRef}
      className="fixed z-[9999] bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/60 overflow-hidden"
      style={{
        top: pos.direction === 'down' ? pos.top : undefined,
        bottom: pos.direction === 'up' ? window.innerHeight - pos.top : undefined,
        left: pos.left,
        width: pos.width,
      }}
    >
      <div className="max-h-56 overflow-y-auto py-1 overscroll-contain [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
        {options.map((opt) => {
          const isSelected = String(opt.value) === String(value);
          return (
            <button
              key={opt.value}
              type="button"
              data-active={isSelected}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full ${itemClasses} flex items-center justify-between gap-2 transition-colors cursor-pointer
                ${isSelected
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              <span className="truncate">{opt.label}</span>
              {isSelected && <HiCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>,
    document.body
  );

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        className={`w-full ${sizeClasses} bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white hover:border-slate-300 transition-all cursor-pointer`}
      >
        <span className={`truncate ${selected ? 'text-slate-700' : 'text-slate-400'}`}>
          {selected?.label || placeholder}
        </span>
        <HiChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {dropdownList}
    </div>
  );
}
