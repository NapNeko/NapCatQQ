import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const TailwindMarkdown: React.FC<{ content: string }> = ({ content }) => {
  return (
    <Markdown
      className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl"
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ node, ...props }) => (
          <h1 className="text-2xl font-bold" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-xl font-bold" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="text-lg font-bold" {...props} />
        ),
        p: ({ node, ...props }) => <p className="m-0" {...props} />,
        a: ({ node, ...props }) => (
          <a
            className="text-primary-500 inline-block hover:underline"
            target="_blank"
            {...props}
          />
        ),
        ul: ({ node, ...props }) => (
          <ul className="list-disc list-inside" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal list-inside" {...props} />
        ),
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-4 border-default-300 pl-4 italic"
            {...props}
          />
        ),
        code: ({ node, ...props }) => (
          <code className="bg-default-100 p-1 rounded text-xs" {...props} />
        )
      }}
    >
      {content}
    </Markdown>
  )
}

export default TailwindMarkdown
