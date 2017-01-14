#include <node.h>

namespace demo {

using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::Object;
using v8::String;
using v8::Value;

int32_t CheckSum(const char *buff, int64_t size) {
    int32_t cksum = 0;
    while (size > 1) {
        cksum += *(unsigned short *) buff;
        buff += 2;
        size -= 2;
    }
    if (size) {
        cksum += *buff;
    }
    while (cksum >> 16)
        cksum = (cksum >> 16) + (cksum & 0xffff);
    return ~cksum;
}

void Method(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  args.GetReturnValue().Set(String::NewFromUtf8(isolate, "hello"));
}

void init(Local<Object> exports) {
  NODE_SET_METHOD(exports, "hello", Method);
}

NODE_MODULE(addon, init)

}  // namespace demo