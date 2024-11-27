interface APIResponse<T> {
    code: number;
    message: string;
    data: T;
}

type Protocol = 'http' | 'https' | 'ws' | 'wss';
