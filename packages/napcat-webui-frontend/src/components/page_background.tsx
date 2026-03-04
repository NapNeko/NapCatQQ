
const PageBackground = () => {
  return (
    <div className='fixed inset-0 w-full h-full -z-10 overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      {/* 静态光斑 - ACG风格 */}
      <div
        className='absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary-200/40 blur-[100px]'
      />
      <div
        className='absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-secondary-200/40 blur-[90px]'
      />
      <div
        className='absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-pink-200/30 blur-[110px]'
      />
    </div>
  );
};

export default PageBackground;
