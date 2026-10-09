#include <node_api.h>
#include <array>
#include <cstdint>
#include <cstdlib>
#include <cstring>
#include <dlfcn.h>
#include <sstream>
#include <string>
#include <vector>

struct alignas(8) QQString
{
    std::array<uint8_t, 24> bytes{};
};

#if defined(__aarch64__)
constexpr size_t flagOffset = 23;
constexpr size_t dataOffset = 0;
constexpr uint8_t heapMask = 0x80;
#else
constexpr size_t flagOffset = 0;
constexpr size_t dataOffset = 16;
constexpr uint8_t heapMask = 1;
#endif

static uint64_t ReadWord(const QQString &value, size_t offset)
{
    uint64_t word;
    std::memcpy(&word, value.bytes.data() + offset, sizeof(word));
    return word;
}

static void WriteWord(QQString &value, size_t offset, uint64_t word)
{
    std::memcpy(value.bytes.data() + offset, &word, sizeof(word));
}

static QQString MakeString(const void *data, size_t length)
{
    QQString value;
    if (length <= 22)
    {
#if defined(__aarch64__)
        std::memcpy(value.bytes.data(), data, length);
        value.bytes[23] = length;
#else
        std::memcpy(value.bytes.data() + 1, data, length);
        value.bytes[0] = length * 2;
#endif
    }
    else
    {
        size_t capacity = (length | 15) + 1;
        auto buffer = static_cast<uint8_t *>(std::calloc(capacity, 1));
        std::memcpy(buffer, data, length);
        WriteWord(value, dataOffset, reinterpret_cast<uintptr_t>(buffer));
        WriteWord(value, 8, length);
#if defined(__aarch64__)
        WriteWord(value, 16, capacity | (uint64_t{1} << 63));
#else
        WriteWord(value, 0, capacity | 1);
#endif
    }
    return value;
}

static std::string ReadString(const QQString &value)
{
    if ((value.bytes[flagOffset] & heapMask) != 0)
        return {reinterpret_cast<const char *>(ReadWord(value, dataOffset)), ReadWord(value, 8)};
#if defined(__aarch64__)
    return {reinterpret_cast<const char *>(value.bytes.data()), value.bytes[23]};
#else
    return {reinterpret_cast<const char *>(value.bytes.data() + 1), static_cast<size_t>(value.bytes[0] / 2)};
#endif
}

static void FreeString(const QQString &value)
{
    if ((value.bytes[flagOffset] & heapMask) != 0)
        std::free(reinterpret_cast<void *>(ReadWord(value, dataOffset)));
}

static QQString FromBuffer(napi_env env, napi_value input)
{
    void *data;
    size_t length;
    napi_get_buffer_info(env, input, &data, &length);
    return MakeString(data, length);
}

extern "C" __attribute__((noinline)) QQString MockCoerce(napi_env env, napi_value input)
{
    napi_value text;
    napi_coerce_to_string(env, input, &text);
    size_t length;
    napi_get_value_string_utf8(env, text, nullptr, 0, &length);
    std::vector<char> bytes(length + 1);
    napi_get_value_string_utf8(env, text, bytes.data(), bytes.size(), &length);
    return MakeString(bytes.data(), length);
}

struct Context
{
    uint8_t padding[24]{};
    napi_env env;
    napi_deferred deferred;
};

struct AsyncResult
{
    uint8_t padding[16]{};
    Context *context;
    int32_t result;
    int32_t alignment{};
    QQString error;
    QQString response;
};

extern "C" __attribute__((noinline)) void MockResolver(AsyncResult *result)
{
    napi_throw_error(result->context->env, nullptr, "Resolver was not intercepted");
}

static volatile int64_t sendCalls = 0;
static volatile int64_t recvCalls = 0;

extern "C" __attribute__((noinline)) int64_t MockSend(void *self, void **packet)
{
    sendCalls += 1;
    return 101 + (self != nullptr) + (packet != nullptr);
}

extern "C" __attribute__((noinline)) int64_t MockRecv(void *self, void **packet, uint32_t marker)
{
    recvCalls += 1;
    return 201 + marker + (self != nullptr) + (packet != nullptr);
}

static napi_value Convert(napi_env env, napi_callback_info info)
{
    size_t argc = 1;
    napi_value input;
    napi_get_cb_info(env, info, &argc, &input, nullptr, nullptr);
    auto output = MockCoerce(env, input);
    auto bytes = ReadString(output);
    napi_value result;
    napi_create_buffer_copy(env, bytes.size(), bytes.data(), nullptr, &result);
    FreeString(output);
    return result;
}

static napi_value Resolve(napi_env env, napi_callback_info info)
{
    size_t argc = 3;
    napi_value args[3];
    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);
    Context context{};
    context.env = env;
    napi_value promise;
    napi_create_promise(env, &context.deferred, &promise);
    AsyncResult result{};
    result.context = &context;
    napi_get_value_int32(env, args[0], &result.result);
    result.error = FromBuffer(env, args[1]);
    result.response = FromBuffer(env, args[2]);
    MockResolver(&result);
    FreeString(result.error);
    FreeString(result.response);
    return promise;
}

struct ByteVector
{
    uint8_t *begin;
    uint8_t *end;
};

struct SendInner
{
    QQString command;
    uint64_t padding{};
    ByteVector *payload;
};

struct SendPacket
{
    SendInner *inner;
    uint8_t padding[48]{};
    QQString uin;
    uint64_t alignment{};
    int64_t sequence;
    uint8_t tail[16]{};
};

struct RecvPacket
{
    QQString uin;
    int64_t sequence;
    QQString command;
    ByteVector *payload;
};

static_assert(offsetof(AsyncResult, error) == 32);
static_assert(offsetof(AsyncResult, response) == 56);
static_assert(offsetof(SendPacket, uin) == 56);
static_assert(offsetof(SendPacket, sequence) == 88);
static_assert(offsetof(RecvPacket, payload) == 56);

static napi_value Packet(napi_env env, napi_callback_info info)
{
    size_t argc = 5;
    napi_value args[5];
    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);
    int32_t direction;
    int64_t sequence;
    napi_get_value_int32(env, args[0], &direction);
    napi_get_value_int64(env, args[3], &sequence);
    auto uin = FromBuffer(env, args[1]);
    auto command = FromBuffer(env, args[2]);
    void *payloadData;
    size_t payloadLength;
    napi_get_buffer_info(env, args[4], &payloadData, &payloadLength);
    uint8_t emptyPayload = 0;
    auto bytes = payloadLength ? static_cast<uint8_t *>(payloadData) : &emptyPayload;
    ByteVector payload{bytes, bytes + payloadLength};
    int64_t returnValue;
    if (direction == 0)
    {
        SendInner inner{command, 0, &payload};
        SendPacket packet{};
        packet.inner = &inner;
        packet.uin = uin;
        packet.sequence = sequence;
        void *pointer = &packet;
        returnValue = MockSend(nullptr, &pointer);
        command = inner.command;
    }
    else
    {
        RecvPacket packet{uin, sequence, command, &payload};
        void *pointer = &packet;
        returnValue = MockRecv(nullptr, &pointer, 7);
    }
    napi_value result;
    napi_create_object(env, &result);
    napi_value returned;
    napi_create_int64(env, returnValue, &returned);
    napi_set_named_property(env, result, "returned", returned);
    auto commandBytes = ReadString(command);
    napi_value outputCommand;
    napi_create_buffer_copy(env, commandBytes.size(), commandBytes.data(), nullptr, &outputCommand);
    napi_set_named_property(env, result, "command", outputCommand);
    FreeString(uin);
    FreeString(command);
    return result;
}

static napi_value EmptyPackets(napi_env env, napi_callback_info info)
{
    void *missing = nullptr;
    MockSend(nullptr, nullptr);
    MockSend(nullptr, &missing);
    SendPacket send{};
    void *sendPointer = &send;
    MockSend(nullptr, &sendPointer);
    SendInner inner{};
    send.inner = &inner;
    MockSend(nullptr, &sendPointer);
    MockRecv(nullptr, nullptr, 0);
    MockRecv(nullptr, &missing, 0);
    RecvPacket recv{};
    void *recvPointer = &recv;
    MockRecv(nullptr, &recvPointer, 0);
    napi_value result;
    napi_create_int64(env, sendCalls + recvCalls, &result);
    return result;
}

static napi_value Addresses(napi_env env, napi_callback_info info)
{
    Dl_info image{};
    dladdr(reinterpret_cast<void *>(MockCoerce), &image);
    uintptr_t base = reinterpret_cast<uintptr_t>(image.dli_fbase);
    napi_value result;
    napi_create_object(env, &result);
    const std::pair<const char *, uintptr_t> functions[] = {
        {"coerce", reinterpret_cast<uintptr_t>(MockCoerce) - base},
        {"resolver", reinterpret_cast<uintptr_t>(MockResolver) - base},
        {"send", (reinterpret_cast<uintptr_t>(MockSend) - base) * 2},
        {"recv", (reinterpret_cast<uintptr_t>(MockRecv) - base) * 2},
    };
    for (const auto &entry : functions)
    {
        std::ostringstream hex;
        hex << std::hex << entry.second;
        napi_value value;
        napi_create_string_utf8(env, hex.str().c_str(), NAPI_AUTO_LENGTH, &value);
        napi_set_named_property(env, result, entry.first, value);
    }
    return result;
}

static napi_value Init(napi_env env, napi_value exports)
{
    const napi_property_descriptor properties[] = {
        {"addresses", nullptr, Addresses, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"convert", nullptr, Convert, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"resolve", nullptr, Resolve, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"packet", nullptr, Packet, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"emptyPackets", nullptr, EmptyPackets, nullptr, nullptr, nullptr, napi_default, nullptr},
    };
    napi_define_properties(env, exports, sizeof(properties) / sizeof(properties[0]), properties);
    return exports;
}

NAPI_MODULE(wrapper, Init)
