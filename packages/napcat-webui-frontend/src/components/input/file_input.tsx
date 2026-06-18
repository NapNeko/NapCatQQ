import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { useRef, useState } from 'react';

export interface FileInputProps {
  onChange: (file: File) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  label?: string;
  accept?: string;
  placeholder?: string;
}

const FileInput: React.FC<FileInputProps> = ({
  onChange,
  onDelete,
  label,
  accept,
  placeholder,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  return (
    <div className='flex items-end gap-2'>
      <div className='flex-grow'>
        <Input
          isDisabled={isLoading}
          ref={inputRef}
          label={label}
          type='file'
          placeholder={placeholder || '选择文件'}
          accept={accept}
          classNames={{
            inputWrapper:
              'bg-default-100/50 dark:bg-white/5 backdrop-blur-md border border-transparent hover:bg-default-200/50 dark:hover:bg-white/10 transition-all shadow-sm data-[hover=true]:border-default-300',
            input: 'bg-transparent text-default-700 placeholder:text-default-400',
          }}
          onChange={async (e) => {
            try {
              setIsLoading(true);
              const file = e.target.files?.[0];
              if (file) {
                await onChange(file);
              }
            } catch (error) {
              console.error(error);
            } finally {
              setIsLoading(false);
              if (inputRef.current) inputRef.current.value = '';
            }
          }}
        />
      </div>
      <Button
        isDisabled={isLoading}
        onPress={async () => {
          try {
            setIsLoading(true);
            if (onDelete) await onDelete();
          } catch (error) {
            console.error(error);
          } finally {
            setIsLoading(false);
            if (inputRef.current) inputRef.current.value = '';
          }
        }}
        color='primary'
        variant='flat'
        size='sm'
      >
        删除
      </Button>
    </div>
  );
};

export default FileInput;
