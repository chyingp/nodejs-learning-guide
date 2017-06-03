#include <node_api.h>

napi_value HelloMethod (napi_env env, napi_callback_info info) {
	napi_value world;
	napi_create_string_utf8(env, "world", 5, &world);
	return world;
}

void Init (napi_env env, napi_value exports, napi_value module, void* priv) {
	napi_property_descriptor desc = { "hello", 0, HelloMethod, 0, 0, 0, napi_default, 0 };
	napi_define_properties(env, exports, 1, &desc);
}

NAPI_MODULE(hello, Init);