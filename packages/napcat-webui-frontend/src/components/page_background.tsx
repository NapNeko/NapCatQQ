import { motion } from 'motion/react';

const PageBackground = () => {
  return (
    <div className='fixed inset-0 w-full h-full -z-10 overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      {/* 动态呼吸光斑 - ACG风格 */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className='absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary-200/40 blur-[100px]'
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 100, 0],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className='absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-secondary-200/40 blur-[90px]'
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          y: [0, -50, 0],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        className='absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-pink-200/30 blur-[110px]'
      />
    </div>
  );
};

export default PageBackground;
