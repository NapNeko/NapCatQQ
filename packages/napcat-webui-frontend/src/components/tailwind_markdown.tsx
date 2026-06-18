import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const TailwindMarkdown: React.FC<{ content: string; }> = ({ content }) => {
  return (
    <Markdown
      className='prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none'
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ node: _node, ...props }) => (
          <h1
            className='text-3xl font-bold mt-6 mb-4 pb-2 border-b-2 border-primary/20 text-default-900 first:mt-0'
            {...props}
          />
        ),
        h2: ({ node: _node, ...props }) => (
          <h2
            className='text-2xl font-bold mt-6 mb-3 pb-2 border-b border-default-200 text-default-800'
            {...props}
          />
        ),
        h3: ({ node: _node, ...props }) => (
          <h3
            className='text-xl font-semibold mt-5 mb-2 text-default-800'
            {...props}
          />
        ),
        h4: ({ node: _node, ...props }) => (
          <h4
            className='text-lg font-semibold mt-4 mb-2 text-default-700'
            {...props}
          />
        ),
        h5: ({ node: _node, ...props }) => (
          <h5
            className='text-base font-semibold mt-3 mb-2 text-default-700'
            {...props}
          />
        ),
        h6: ({ node: _node, ...props }) => (
          <h6
            className='text-sm font-semibold mt-3 mb-2 text-default-600'
            {...props}
          />
        ),
        p: ({ node: _node, ...props }) => (
          <p
            className='my-3 leading-7 text-default-700 first:mt-0 last:mb-0'
            {...props}
          />
        ),
        a: ({ node: _node, ...props }) => (
          <a
            className='text-primary font-medium hover:text-primary-600 underline decoration-primary/30 hover:decoration-primary transition-colors'
            target='_blank'
            rel='noopener noreferrer'
            {...props}
          />
        ),
        ul: ({ node: _node, ...props }) => (
          <ul
            className='my-3 ml-6 space-y-2 list-disc marker:text-primary'
            {...props}
          />
        ),
        ol: ({ node: _node, ...props }) => (
          <ol
            className='my-3 ml-6 space-y-2 list-decimal marker:text-primary marker:font-semibold'
            {...props}
          />
        ),
        li: ({ node: _node, ...props }) => (
          <li
            className='leading-7 text-default-700 pl-2'
            {...props}
          />
        ),
        blockquote: ({ node: _node, ...props }) => (
          <blockquote
            className='my-4 pl-4 pr-4 py-2 border-l-4 border-primary/50 bg-primary/5 rounded-r-lg italic text-default-600'
            {...props}
          />
        ),
        pre: ({ node: _node, ...props }) => (
          <pre
            className='my-4 p-4 bg-default-100 dark:bg-default-50 rounded-xl overflow-x-auto text-sm border border-default-200 shadow-sm'
            {...props}
          />
        ),
        code: ({ node: _node, inline, ...props }: any) => {
          if (inline) {
            return (
              <code
                className='px-1.5 py-0.5 mx-0.5 bg-primary/10 text-primary-700 dark:text-primary-600 rounded text-sm font-mono border border-primary/20'
                {...props}
              />
            );
          }
          return (
            <code
              className='text-sm font-mono text-default-800'
              {...props}
            />
          );
        },
        img: ({ node: _node, ...props }) => (
          <img
            className='max-w-full h-auto rounded-lg my-4 shadow-md hover:shadow-xl transition-shadow border border-default-200'
            {...props}
          />
        ),
        hr: ({ node: _node, ...props }) => (
          <hr
            className='my-8 border-0 h-px bg-gradient-to-r from-transparent via-default-300 to-transparent'
            {...props}
          />
        ),
        table: ({ node: _node, ...props }) => (
          <div className='my-4 overflow-x-auto rounded-lg border border-default-200 shadow-sm'>
            <table
              className='min-w-full divide-y divide-default-200'
              {...props}
            />
          </div>
        ),
        thead: ({ node: _node, ...props }) => (
          <thead
            className='bg-default-100'
            {...props}
          />
        ),
        tbody: ({ node: _node, ...props }) => (
          <tbody
            className='divide-y divide-default-200 bg-white dark:bg-default-50'
            {...props}
          />
        ),
        tr: ({ node: _node, ...props }) => (
          <tr
            className='hover:bg-default-50 transition-colors'
            {...props}
          />
        ),
        th: ({ node: _node, ...props }) => (
          <th
            className='px-4 py-3 text-left text-xs font-semibold text-default-700 uppercase tracking-wider'
            {...props}
          />
        ),
        td: ({ node: _node, ...props }) => (
          <td
            className='px-4 py-3 text-sm text-default-700'
            {...props}
          />
        ),
        strong: ({ node: _node, ...props }) => (
          <strong
            className='font-bold text-default-900'
            {...props}
          />
        ),
        em: ({ node: _node, ...props }) => (
          <em
            className='italic text-default-700'
            {...props}
          />
        ),
        del: ({ node: _node, ...props }) => (
          <del
            className='line-through text-default-500'
            {...props}
          />
        ),
      }}
    >
      {content}
    </Markdown>
  );
};

export default TailwindMarkdown;
