#include <windows.h>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <string>

using QueryByName = BOOL(WINAPI *)(PCWSTR, FILE_INFO_BY_NAME_CLASS, PVOID, ULONG);

int wmain(int argumentCount, wchar_t **arguments)
{
    if (argumentCount != 3)
        return 2;

    const wchar_t *providers[] = {L"kernel32.dll", L"kernelbase.dll", L"api-ms-win-core-file-l2-1-4.dll"};
    HMODULE providerModules[3]{};
    QueryByName nativeQueries[3]{};
    unsigned char nativeCode[3][12]{};
    unsigned char nativeInfo[3][4][1024]{};
    BOOL nativeResults[3][4]{};
    DWORD nativeErrors[3][4]{};
    for (int providerIndex = 0; providerIndex < 3; ++providerIndex)
    {
        providerModules[providerIndex] = LoadLibraryW(providers[providerIndex]);
        auto query = reinterpret_cast<QueryByName>(GetProcAddress(providerModules[providerIndex], "GetFileInformationByName"));
        if (!query)
            return 3;
        nativeQueries[providerIndex] = query;
        std::memcpy(nativeCode[providerIndex], reinterpret_cast<void *>(query), sizeof(nativeCode[providerIndex]));
        for (int infoClass = 0; infoClass < 4; ++infoClass)
        {
            SetLastError(ERROR_SUCCESS);
            nativeResults[providerIndex][infoClass] = query(arguments[2], static_cast<FILE_INFO_BY_NAME_CLASS>(infoClass), nativeInfo[providerIndex][infoClass], sizeof(nativeInfo[providerIndex][infoClass]));
            nativeErrors[providerIndex][infoClass] = GetLastError();
        }
    }

    FILE_STAT_BASIC_INFORMATION expected{};
    if (!nativeQueries[0](arguments[2], FileStatBasicByNameInfo, &expected, sizeof(expected)))
        return 4;
    if (_wputenv_s(L"NAPCAT_LOAD_PATH", arguments[2]) || _wputenv_s(L"NAPCAT_PATCH_PACKAGE", arguments[2]))
        return 5;
    if (!LoadLibraryW(arguments[1]))
    {
        std::printf("LoadLibrary failed: %lu\n", GetLastError());
        return 6;
    }

    const std::wstring missingRoot = L"C:\\napcat-loader-test-" + std::to_wstring(GetCurrentProcessId());
    const std::wstring loaderPath = missingRoot + L"\\loadNapCat.js";
    const std::wstring packagePath = missingRoot + L"\\resources\\app\\package.json";
    const std::wstring unrelatedPath = missingRoot + L"\\unrelated.txt";
    const wchar_t *redirectedPaths[] = {loaderPath.c_str(), packagePath.c_str()};
    int failures = 0;
    for (int providerIndex = 0; providerIndex < 3; ++providerIndex)
    {
        auto query = reinterpret_cast<QueryByName>(GetProcAddress(providerModules[providerIndex], "GetFileInformationByName"));
        bool preserved = std::memcmp(nativeCode[providerIndex], reinterpret_cast<void *>(nativeQueries[providerIndex]), sizeof(nativeCode[providerIndex])) == 0;
        std::wprintf(L"%ls native code preserved: %ls\n", providers[providerIndex], preserved ? L"PASS" : L"FAIL");
        failures += !preserved;
        for (int infoClass = 0; infoClass < 4; ++infoClass)
        {
            unsigned char actual[1024]{};
            SetLastError(ERROR_SUCCESS);
            BOOL result = query(arguments[2], static_cast<FILE_INFO_BY_NAME_CLASS>(infoClass), actual, sizeof(actual));
            DWORD error = GetLastError();
            bool passed = result == nativeResults[providerIndex][infoClass] &&
                (result ? std::memcmp(actual, nativeInfo[providerIndex][infoClass], sizeof(actual)) == 0 : error == nativeErrors[providerIndex][infoClass]);
            std::wprintf(L"%ls information class %d native parity: %ls\n", providers[providerIndex], infoClass, passed ? L"PASS" : L"FAIL");
            failures += !passed;
        }
        for (const auto *redirectedPath : redirectedPaths)
        {
            FILE_STAT_BASIC_INFORMATION actual{};
            BOOL result = query(redirectedPath, FileStatBasicByNameInfo, &actual, sizeof(actual));
            bool passed = result && actual.EndOfFile.QuadPart == expected.EndOfFile.QuadPart &&
                actual.FileId.QuadPart == expected.FileId.QuadPart && actual.FileAttributes == expected.FileAttributes;
            std::wprintf(L"%ls redirect %ls: %ls\n", providers[providerIndex], redirectedPath, passed ? L"PASS" : L"FAIL");
            failures += !passed;
        }
        FILE_STAT_BASIC_INFORMATION missing{};
        SetLastError(ERROR_SUCCESS);
        BOOL nativeResult = nativeQueries[providerIndex](unrelatedPath.c_str(), FileStatBasicByNameInfo, &missing, sizeof(missing));
        DWORD nativeError = GetLastError();
        SetLastError(ERROR_SUCCESS);
        BOOL result = query(unrelatedPath.c_str(), FileStatBasicByNameInfo, &missing, sizeof(missing));
        bool passed = !result && result == nativeResult && GetLastError() == nativeError;
        std::wprintf(L"%ls unrelated missing file: %ls\n", providers[providerIndex], passed ? L"PASS" : L"FAIL");
        failures += !passed;
    }
    FILE_STAT_BASIC_INFORMATION direct{};
    BOOL result = GetFileInformationByName(loaderPath.c_str(), FileStatBasicByNameInfo, &direct, sizeof(direct));
    bool passed = result && direct.FileId.QuadPart == expected.FileId.QuadPart && direct.EndOfFile.QuadPart == expected.EndOfFile.QuadPart;
    std::printf("static import redirection: %s\n", passed ? "PASS" : "FAIL");
    failures += !passed;
    return failures ? 1 : 0;
}
