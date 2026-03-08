import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import StickerBadge from '@/components/scrapbook/StickerBadge';

interface ExamDate {
  exam_type: string;
  exam_date: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(target: string): TimeLeft | null {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const CountdownUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <span className="handwriting text-2xl sm:text-3xl font-bold text-foreground leading-none">
      {String(value).padStart(2, '0')}
    </span>
    <span className="text-[9px] text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
      {label}
    </span>
  </div>
);

const ExamCountdown: React.FC = () => {
  const [examDates, setExamDates] = useState<ExamDate[]>([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    supabase
      .from('exam_dates')
      .select('exam_type, exam_date')
      .then(({ data }) => {
        if (data) setExamDates(data);
      });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (examDates.length === 0) return null;

  const sorted = [...examDates].sort(
    (a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime()
  );

  return (
    <div className="flex justify-center gap-4 mt-3 flex-wrap">
      {sorted.map((exam) => {
        const tl = calcTimeLeft(exam.exam_date);
        if (!tl) return null;

        const color = exam.exam_type === 'TYT' ? 'pink' : 'blue';
        const rotation = exam.exam_type === 'TYT' ? -2 : 2;

        return (
          <motion.div
            key={exam.exam_type}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 18 }}
          >
            <StickerBadge color={color} rotation={rotation}>
              <div className="flex flex-col items-center gap-1 px-1">
                <span className="text-[10px] font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                  {exam.exam_type} Sınavına
                </span>
                <div className="flex gap-2">
                  <CountdownUnit value={tl.days} label="gün" />
                  <span className="handwriting text-xl font-bold text-muted-foreground">:</span>
                  <CountdownUnit value={tl.hours} label="saat" />
                  <span className="handwriting text-xl font-bold text-muted-foreground">:</span>
                  <CountdownUnit value={tl.minutes} label="dk" />
                  <span className="handwriting text-xl font-bold text-muted-foreground">:</span>
                  <CountdownUnit value={tl.seconds} label="sn" />
                </div>
              </div>
            </StickerBadge>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ExamCountdown;
