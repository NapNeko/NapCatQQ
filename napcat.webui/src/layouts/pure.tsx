export default function PureLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex flex-col h-screen">
      <main className="flex-grow w-full flex flex-col justify-center items-center">
        {children}
      </main>
    </div>
  )
}
