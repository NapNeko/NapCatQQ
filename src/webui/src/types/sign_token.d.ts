interface WebUiCredentialInnerJson {
    CreatedTime: number;
    TokenEncoded: string;
}

interface WebUiCredentialJson {
    Data: WebUiCredentialInnerJson;
    Hmac: string;
}
