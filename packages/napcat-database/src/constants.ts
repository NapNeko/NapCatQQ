/** 文件头部扩展区大小 */
export const EXT_HEADER_SIZE = 1024;

/** SQLCipher 页大小 */
export const PAGE_SIZE = 4096;

/** PBKDF2 salt 长度 */
export const SALT_SIZE = 16;

/** AES-256 密钥长度 */
export const KEY_SIZE = 32;

/** AES-CBC IV 长度 */
export const IV_SIZE = 16;

/** HMAC-SHA1 长度 */
export const HMAC_SIZE = 20;

/** 每页保留区大小: IV(16) + HMAC_SHA1(20) + pad(12) = 48 */
export const RESERVE_SIZE = 48;

/** PBKDF2 主密钥迭代次数 */
export const KDF_ITERATIONS = 4000;

/** PBKDF2 HMAC 密钥迭代次数 */
export const FAST_ITERATIONS = 2;

/** HMAC salt XOR 掩码 */
export const HMAC_MASK = 0x3a;

/** SQLite 加密文件头 */
export const SQLITE_HEADER = Buffer.from('SQLite header 3\0');

/** SQLite 明文文件头 */
export const SQLITE_FORMAT = Buffer.from('SQLite format 3\0');
