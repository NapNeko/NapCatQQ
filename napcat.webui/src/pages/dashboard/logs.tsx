import { title } from '@/components/primitives'

export default function LogsPage() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-lg text-center justify-center">
        <h1
          className={title({
            size: 'sm',
            color: 'violet',
            shadow: true
          })}
        >
          页面正在施工
        </h1>
      </div>
    </section>
  )
}
