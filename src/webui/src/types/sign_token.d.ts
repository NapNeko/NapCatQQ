interface WebUiCredentialInnerJson {
    CreatedTime: number;
    HashEncoded: string;
}

interface WebUiCredentialJson {
    Data: WebUiCredentialInnerJson;
    Hmac: string;
}
